import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Upsert user: create if not exists, update if exists (based on email)
    const user = await prisma.patientTestUser.upsert({
      where: { email },
      update: { name },
      create: {
        name,
        email,
        password: '', // Placeholder since password is required in schema; consider making optional later
      },
    });

    return NextResponse.json({ message: 'User saved successfully', user }, { status: 200 });
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authorizedUsers = await prisma.authorizedUser.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json({ authorizedUsers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching authorized users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
