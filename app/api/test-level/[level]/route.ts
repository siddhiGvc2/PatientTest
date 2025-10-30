import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level: levelParam } = await params;
    const level = parseInt(levelParam);

    if (isNaN(level)) {
      return NextResponse.json(
        { error: 'Invalid level parameter' },
        { status: 400 }
      );
    }

    const testLevel = await prisma.testLevel.findUnique({
      where: { level },
      include: {
        screens: {
          include: {
            images: true,
            questions: {
              include: {
                options: true,
                answer: true,
              },
            },
          },
          orderBy: {
            screenNumber: 'asc',
          },
        },
      },
    });

    if (!testLevel) {
      return NextResponse.json(
        { error: 'Test level not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(testLevel);
  } catch (error) {
    console.error('Error fetching test level:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
