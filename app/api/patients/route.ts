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
        age: true,
        city: true,
        fatherName: true,
        motherName: true,
        uniqueId: true,
        phoneNumber: true,
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

export async function POST(request: NextRequest) {
  try {
    const { userId, name,age, city, fatherName, motherName, uniqueId, phoneNumber, score } = await request.json();

    if (!userId || !name) {
      return NextResponse.json({ error: 'userId and name are required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'userId must be a valid integer' }, { status: 400 });
    }

    // Create new patient
    const patient = await prisma.patient.create({
      data: {
        userId: userIdInt,
        name,
        age: age ? parseInt(age, 10) : null,
        city: city || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        uniqueId: uniqueId || null,
        phoneNumber: phoneNumber || null,
        score: score || 0,
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
