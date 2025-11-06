import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { patientId, questionId, selectedImageId } = await request.json();

    if (!patientId || !questionId || !selectedImageId) {
      return NextResponse.json({ error: 'patientId, questionId, and selectedImageId are required' }, { status: 400 });
    }

    const patientIdInt = parseInt(patientId, 10);
    const questionIdInt = parseInt(questionId, 10);
    const selectedImageIdInt = parseInt(selectedImageId, 10);

    if (isNaN(patientIdInt) || isNaN(questionIdInt) || isNaN(selectedImageIdInt)) {
      return NextResponse.json({ error: 'All IDs must be valid integers' }, { status: 400 });
    }

    // Fetch the question to get the correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionIdInt },
      select: { answerImageId: true },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = question.answerImageId === selectedImageIdInt;

    // Upsert the response
    const response = await prisma.userResponse.upsert({
      where: {
        patientId_questionId: {
          patientId: patientIdInt,
          questionId: questionIdInt,
        },
      },
      update: {
        selectedImageId: selectedImageIdInt,
        isCorrect,
      },
      create: {
        patientId: patientIdInt,
        questionId: questionIdInt,
        selectedImageId: selectedImageIdInt,
        isCorrect,
      },
    });

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
