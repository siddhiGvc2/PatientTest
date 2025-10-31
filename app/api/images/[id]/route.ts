import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const { url, screenId } = await request.json();

    if (!url || typeof url !== 'string' || !screenId || typeof screenId !== 'number') {
      return NextResponse.json({ error: 'url and screenId are required. url must be a string, screenId must be a number' }, { status: 400 });
    }

    const updatedImage = await prisma.image.update({
      where: { id: idNum },
      data: {
        url,
        screenId,
      },
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
