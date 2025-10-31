import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const { text, screenId, options, answerImageId } = await request.json();

    if (!text || typeof text !== 'string' || !screenId || typeof screenId !== 'number' || !options || !Array.isArray(options) || answerImageId === undefined || typeof answerImageId !== 'number') {
      return NextResponse.json({ error: 'text, screenId, options, and valid answerImageId are required. options must be an array, answerImageId must be a number' }, { status: 400 });
    }

    // Update question
    const updatedQuestion = await prisma.question.update({
      where: { id: idNum },
      data: {
        text,
        screenId,
        answerImageId,
      },
    });

    // Update options: assume options is array of { text }, update existing ones, create if more, but for simplicity, update up to 4
    const existingOptions = await prisma.option.findMany({
      where: { questionId: idNum },
      orderBy: { id: 'asc' },
    });

    for (let i = 0; i < Math.max(options.length, existingOptions.length); i++) {
      if (i < options.length && existingOptions[i]) {
        await prisma.option.update({
          where: { id: existingOptions[i].id },
          data: { text: options[i].text },
        });
      } else if (i < options.length) {
        await prisma.option.create({
          data: {
            text: options[i].text,
            questionId: idNum,
          },
        });
      } else if (existingOptions[i]) {
        // If fewer options provided, delete extra
        await prisma.option.delete({
          where: { id: existingOptions[i].id },
        });
      }
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    // Delete associated options first
    await prisma.option.deleteMany({
      where: { questionId: idNum },
    });

    // Delete the question
    await prisma.question.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
