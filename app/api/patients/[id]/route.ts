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

    if (!currentUserId) {
      return NextResponse.json({ error: 'currentUserId is required' }, { status: 400 });
    }

    const currentUserIdInt = parseInt(currentUserId, 10);
    if (isNaN(currentUserIdInt)) {
      return NextResponse.json({ error: 'currentUserId must be a valid integer' }, { status: 400 });
    }

    // Get current user to check permissions
    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: currentUserIdInt },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if current user has permission to update this patient
    let hasPermission = false;

    if (currentUser.type === 'SUPERADMIN') {
      // SUPERADMIN can update any patient
      hasPermission = true;
    } else {
      // For ADMIN and USER, check ownership through userId or direct patient ownership
      if (userId) {
        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
          return NextResponse.json({ error: 'userId must be a valid integer' }, { status: 400 });
        }

        if (userIdInt === currentUserIdInt) {
          // Users can update their own patients
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
        }
      } else {
        // If no userId provided, check if the patient belongs to the current user
        const patientUser = await prisma.patientTestUser.findUnique({
          where: { id: existingPatient.userId },
          select: { email: true },
        });

        if (patientUser) {
          const authorizedUser = await prisma.authorizedUser.findUnique({
            where: { email: patientUser.email },
            select: { id: true, createdBy: true },
          });

          if (authorizedUser) {
            if (authorizedUser.id === currentUserIdInt) {
              hasPermission = true;
            } else if (currentUser.type === 'ADMIN' && authorizedUser.createdBy === currentUser.id) {
              hasPermission = true;
            }
          }
        }
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to update this patient' }, { status: 403 });
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
        name: name !== undefined ? name : existingPatient.name,
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

    if (!currentUserId) {
      return NextResponse.json({ error: 'currentUserId query parameter is required' }, { status: 400 });
    }

    const currentUserIdInt = parseInt(currentUserId, 10);
    if (isNaN(currentUserIdInt)) {
      return NextResponse.json({ error: 'currentUserId must be a valid integer' }, { status: 400 });
    }

    // Get current user to check permissions
    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: currentUserIdInt },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if current user has permission to delete this patient
    let hasPermission = false;

    if (currentUser.type === 'SUPERADMIN') {
      // SUPERADMIN can delete any patient
      hasPermission = true;
    } else {
      // For ADMIN and USER, check ownership through userId or direct patient ownership
      if (userId) {
        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
          return NextResponse.json({ error: 'userId must be a valid integer' }, { status: 400 });
        }

        if (userIdInt === currentUserIdInt) {
          // Users can delete their own patients
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
        }
      } else {
        // If no userId provided, check if the patient belongs to the current user
        const patientUser = await prisma.patientTestUser.findUnique({
          where: { id: existingPatient.userId },
          select: { email: true },
        });

        if (patientUser) {
          const authorizedUser = await prisma.authorizedUser.findUnique({
            where: { email: patientUser.email },
            select: { id: true, createdBy: true },
          });

          if (authorizedUser) {
            if (authorizedUser.id === currentUserIdInt) {
              hasPermission = true;
            } else if (currentUser.type === 'ADMIN' && authorizedUser.createdBy === currentUser.id) {
              hasPermission = true;
            }
          }
        }
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to delete this patient' }, { status: 403 });
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
