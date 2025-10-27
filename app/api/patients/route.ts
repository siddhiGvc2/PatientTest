import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
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

    // Check if current user has permission to view patients for the specified userId
    let hasPermission = false;

    if (userIdInt === currentUserIdInt) {
      // Users can always view their own patients
      hasPermission = true;
    } else if (currentUser.type === 'SUPERADMIN') {
      // SUPERADMIN can view any user's patients
      hasPermission = true;
    } else if (currentUser.type === 'ADMIN') {
      // ADMIN can view patients of users they created
      const targetUser = await prisma.authorizedUser.findUnique({
        where: { id: userIdInt },
        select: { createdBy: true },
      });
      if (targetUser && targetUser.createdBy === currentUser.id) {
        hasPermission = true;
      }
    } else if (currentUser.type === 'USER') {
      // USER can only view their own patients
      hasPermission = false;
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to view these patients' }, { status: 403 });
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

    // Fetch patients for the PatientTestUser
    const patients = await prisma.patient.findMany({
      where: { userId: patientTestUser.id },
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
        user: {
          select: {
            email: true,
            name: true,
          },
        },
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
    const { userId, currentUserId, name, age, city, fatherName, motherName, uniqueId, phoneNumber, score } = await request.json();
    console.log(userId,currentUserId,name);
    if (!userId || !currentUserId || !name) {
      return NextResponse.json({ error: 'userId, currentUserId, and name are required' }, { status: 400 });
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

    // Check if current user has permission to create patients for the specified userId
    let hasPermission = false;

    if (userIdInt === currentUserIdInt) {
      // Users can create patients for themselves
      hasPermission = true;
    } else if (currentUser.type === 'SUPERADMIN') {
      // SUPERADMIN can create patients for any user
      hasPermission = true;
    } else if (currentUser.type === 'ADMIN') {
      // ADMIN can create patients for users they created
      const targetUser = await prisma.authorizedUser.findUnique({
        where: { id: userIdInt },
        select: { createdBy: true },
      });
      if (targetUser && targetUser.createdBy === currentUser.id) {
        hasPermission = true;
      }
    } else if (currentUser.type === 'USER') {
      // USER can only create patients for themselves
      hasPermission = false;
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to create patients for this user' }, { status: 403 });
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

    // Check if uniqueId is provided and already exists
    if (uniqueId) {
      const existingPatient = await prisma.patient.findUnique({
        where: { uniqueId },
      });
      if (existingPatient) {
        return NextResponse.json({ error: 'Unique ID already exists' }, { status: 400 });
      }
    }

    // Create new patient linked to the PatientTestUser
    const patient = await prisma.patient.create({
      data: {
        userId: patientTestUser.id,
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
