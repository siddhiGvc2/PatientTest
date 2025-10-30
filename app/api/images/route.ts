import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { url, screenId } = await request.json();

    if (!url || typeof url !== 'string' || !screenId || typeof screenId !== 'number') {
      return NextResponse.json({ error: 'url and screenId are required. url must be a string, screenId must be a number' }, { status: 400 });
    }

    const image = await prisma.image.create({
      data: {
        url,
        screenId,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      include: {
        screen: true,
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
