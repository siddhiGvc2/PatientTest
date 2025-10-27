import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
    }

    const { userId, name, email, age, city, fatherName, motherName, uniqueId, phoneNumber, score } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'userId must be a valid integer' }, { status: 400 });
    }

    // Check if patient exists and belongs to the user
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!existingPatient || existingPatient.userId !== userIdInt) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        name: name || existingPatient.name,
        age: age !== undefined ? (age ? parseInt(age, 10) : null) : existingPatient.age,
        city: city !== undefined ? city : existingPatient.city,
        fatherName: fatherName !== undefined ? fatherName : existingPatient.fatherName,
        motherName: motherName !== undefined ? motherName : existingPatient.motherName,
        uniqueId: uniqueId !== undefined ? uniqueId : existingPatient.uniqueId,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : existingPatient.phoneNumber,
        score: score !== undefined ? score : existingPatient.score,
      },
    });

    return NextResponse.json({ patient: updatedPatient }, { status: 200 });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'userId must be a valid integer' }, { status: 400 });
    }

    // Check if patient exists and belongs to the user
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!existingPatient || existingPatient.userId !== userIdInt) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }

    // Delete patient
    await prisma.patient.delete({
      where: { id: patientId },
    });

    return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
