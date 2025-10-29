import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const optionId = parseInt(id, 10);

    if (isNaN(optionId)) {
      return NextResponse.json({ error: 'Invalid option ID' }, { status: 400 });
    }

    const option = await prisma.option.findUnique({
      where: { id: optionId },
      include: {
        questions: true,
        userResponses: true,
      },
    });

    if (!option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    return NextResponse.json({ option }, { status: 200 });
  } catch (error) {
    console.error('Error fetching option:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const optionId = parseInt(id, 10);

    if (isNaN(optionId)) {
      return NextResponse.json({ error: 'Invalid option ID' }, { status: 400 });
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const option = await prisma.option.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    const updatedOption = await prisma.option.update({
      where: { id: optionId },
      data: { text },
    });

    return NextResponse.json({ option: updatedOption }, { status: 200 });
  } catch (error) {
    console.error('Error updating option:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const optionId = parseInt(id, 10);

    if (isNaN(optionId)) {
      return NextResponse.json({ error: 'Invalid option ID' }, { status: 400 });
    }

    const option = await prisma.option.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    await prisma.option.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ message: 'Option deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting option:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
