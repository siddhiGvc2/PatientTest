import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { text, screenId, options, answerId } = await request.json();

    if (!text || typeof text !== 'string' || !screenId || typeof screenId !== 'number' || !options || !Array.isArray(options)) {
      return NextResponse.json({ error: 'text, screenId, and options are required. options must be an array' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        text,
        screenId,
        options: {
          create: options.map((opt: { text: string }) => ({ text: opt.text })),
        },
        answerId,
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
        options: true,
        answer: true,
        responses: true,
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
