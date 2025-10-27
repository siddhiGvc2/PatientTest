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

    const { userId, currentUserId, name, age, city, fatherName, motherName, uniqueId, phoneNumber, score } = await request.json();

    if (!userId || !currentUserId) {
      return NextResponse.json({ error: 'userId and currentUserId are required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId, 10);
    const currentUserIdInt = parseInt(currentUserId, 10);
    if (isNaN(userIdInt) || isNaN(currentUserIdInt)) {
      return NextResponse.json({ error: 'userId and currentUserId must be valid integers' }, { status: 400 });
    }

    // Get current user to check permissions
    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: currentUserIdInt },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check if current user has permission to update patients for the specified userId
    let hasPermission = false;

    if (userIdInt === currentUserIdInt) {
      // Users can update their own patients
      hasPermission = true;
    } else if (currentUser.type === 'SUPERADMIN') {
      // SUPERADMIN can update any user's patients
      hasPermission = true;
    } else if (currentUser.type === 'ADMIN') {
      // ADMIN can update patients of users they created
      const targetUser = await prisma.authorizedUser.findUnique({
        where: { id: userIdInt },
        select: { createdBy: true },
      });
      if (targetUser && targetUser.createdBy === currentUser.id) {
        hasPermission = true;
      }
    } else if (currentUser.type === 'USER') {
      // USER can only update their own patients
      hasPermission = false;
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to update patients for this user' }, { status: 403 });
    }

    // Get the AuthorizedUser to find the corresponding PatientTestUser
    const authorizedUser = await prisma.authorizedUser.findUnique({
      where: { id: userIdInt },
      select: { email: true },
    });

    if (!authorizedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the PatientTestUser with the same email
    const patientTestUser = await prisma.patientTestUser.findUnique({
      where: { email: authorizedUser.email },
    });

    if (!patientTestUser) {
      return NextResponse.json({ error: 'Patient test user not found' }, { status: 404 });
    }

    // Check if patient exists and belongs to the PatientTestUser
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!existingPatient || existingPatient.userId !== patientTestUser.id) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }

    // Check if uniqueId is being updated and already exists for another patient
    if (uniqueId !== undefined && uniqueId !== existingPatient.uniqueId) {
      if (uniqueId) {
        const existingUniqueIdPatient = await prisma.patient.findUnique({
          where: { uniqueId },
        });
        if (existingUniqueIdPatient && existingUniqueIdPatient.id !== patientId) {
          return NextResponse.json({ error: 'Unique ID already exists' }, { status: 400 });
        }
      }
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
    const currentUserId = searchParams.get('currentUserId');

    if (!userId || !currentUserId) {
      return NextResponse.json({ error: 'userId and currentUserId query parameters are required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId, 10);
    const currentUserIdInt = parseInt(currentUserId, 10);
    if (isNaN(userIdInt) || isNaN(currentUserIdInt)) {
      return NextResponse.json({ error: 'userId and currentUserId must be valid integers' }, { status: 400 });
    }

    // Get current user to check permissions
    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: currentUserIdInt },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check if current user has permission to delete patients for the specified userId
    let hasPermission = false;

    if (userIdInt === currentUserIdInt) {
      // Users can delete their own patients
      hasPermission = true;
    } else if (currentUser.type === 'SUPERADMIN') {
      // SUPERADMIN can delete any user's patients
      hasPermission = true;
    } else if (currentUser.type === 'ADMIN') {
      // ADMIN can delete patients of users they created
      const targetUser = await prisma.authorizedUser.findUnique({
        where: { id: userIdInt },
        select: { createdBy: true },
      });
      if (targetUser && targetUser.createdBy === currentUser.id) {
        hasPermission = true;
      }
    } else if (currentUser.type === 'USER') {
      // USER can only delete their own patients
      hasPermission = false;
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to delete patients for this user' }, { status: 403 });
    }

    // Get the AuthorizedUser to find the corresponding PatientTestUser
    const authorizedUser = await prisma.authorizedUser.findUnique({
      where: { id: userIdInt },
      select: { email: true },
    });

    if (!authorizedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the PatientTestUser with the same email
    const patientTestUser = await prisma.patientTestUser.findUnique({
      where: { email: authorizedUser.email },
    });

    if (!patientTestUser) {
      return NextResponse.json({ error: 'Patient test user not found' }, { status: 404 });
    }

    // Check if patient exists and belongs to the PatientTestUser
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!existingPatient || existingPatient.userId !== patientTestUser.id) {
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
