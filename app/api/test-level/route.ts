import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { level } = await request.json();

    if (!level || typeof level !== 'number') {
      return NextResponse.json({ error: 'Level is required and must be a number' }, { status: 400 });
    }

    const testLevel = await prisma.testLevel.create({
      data: {
        level,
      },
    });

    return NextResponse.json(testLevel, { status: 201 });
  } catch (error) {
    console.error('Error creating test level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const testLevels = await prisma.testLevel.findMany({
      include: {
        screens: {
          include: {
            questions: {
              include: {
                options: true,
                answer: true,
              },
            },
            images: true,
          },
        },
      },
    });

    return NextResponse.json(testLevels);
  } catch (error) {
    console.error('Error fetching test levels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
