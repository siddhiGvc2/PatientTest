import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const options = await prisma.option.findMany();

    return NextResponse.json({ options }, { status: 200 });
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, questionId } = await request.json();

    if (!text || !questionId) {
      return NextResponse.json({ error: 'Text and questionId are required' }, { status: 400 });
    }

    const option = await prisma.option.create({
      data: {
        text,
        questionId,
      },
    });

    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    console.error('Error creating option:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
