import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'userId must be a valid integer' }, { status: 400 });
    }

    // Fetch patients for the user
    const patients = await prisma.patient.findMany({
      where: { userId: userIdInt },
      select: {
        id: true,
        name: true,
        email: true,
        score: true,
        // Exclude userId and responses for simplicity
      },
    });

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
