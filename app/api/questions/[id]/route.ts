import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const { text, screenId,answerImageId } = await request.json();
    console.log(typeof(answerImageId),typeof(screenId),typeof(text));

    if (!text || typeof text !== 'string' || !screenId || typeof screenId !== 'number' || answerImageId === undefined || typeof answerImageId !== 'number') {
      return NextResponse.json({ error: 'text, screenId, and valid answerImageId are required. answerImageId must be a number' }, { status: 400 });
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
