import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aadiId = searchParams.get('aadiId');

    if (!aadiId) {
      return NextResponse.json({ error: 'AADI ID is required' }, { status: 400 });
    }

    // Check if the aadiId already exists in the Patient table
    const existingPatient = await prisma.patient.findUnique({
      where: { aadiId },
    });

    const isUnique = !existingPatient;

    return NextResponse.json({ isUnique }, { status: 200 });
  } catch (error) {
    console.error('Error checking AADI ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
