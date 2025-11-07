import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueId');

    if (!uniqueId) {
      return NextResponse.json({ error: 'Unique ID is required' }, { status: 400 });
    }

    // Check if the uniqueId already exists in the Patient table
    const existingPatient = await prisma.patient.findUnique({
      where: { uniqueId },
    });

    const isUnique = !existingPatient;

    return NextResponse.json({ isUnique }, { status: 200 });
  } catch (error) {
    console.error('Error checking unique ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
