import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { text, screenId, answerImageId } = await request.json();

    if (!text || typeof text !== 'string' || !screenId || typeof screenId !== 'number' || answerImageId === undefined || typeof answerImageId !== 'number') {
      return NextResponse.json({ error: 'text, screenId, and valid answerImageId are required. answerImageId must be a number' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        text,
        screenId,
        answerImageId: answerImageId,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        screen: true,
        responses: true,
        options: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
