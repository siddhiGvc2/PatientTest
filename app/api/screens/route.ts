import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { screenNumber, testLevelId } = await request.json();

    if (!screenNumber || typeof screenNumber !== 'number' || !testLevelId || typeof testLevelId !== 'number') {
      return NextResponse.json({ error: 'screenNumber and testLevelId are required and must be numbers' }, { status: 400 });
    }

    const screen = await prisma.screen.create({
      data: {
        screenNumber,
        testLevelId,
      },
    });

    return NextResponse.json(screen, { status: 201 });
  } catch (error) {
    console.error('Error creating screen:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const screens = await prisma.screen.findMany({
      include: {
        testLevel: true,
        questions: {
          include: {
            options: true,
            answer: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json(screens);
  } catch (error) {
    console.error('Error fetching screens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
