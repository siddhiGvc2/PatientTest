import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
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

    let patients: any[];

    if (currentUser.type === 'SUPERADMIN') {
      // SUPERADMIN can view all patients in the system
      patients = await prisma.patient.findMany({
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          relation: true,
          remark: true,
          address: true,
          aadiId: true,
          keyWorkerName: true,
          caregiverName: true,
          phoneNumber: true,
          score: true,
          user: {
            select: {
              email: true,
              name: true,
              userType: true,
            },
          },
        },
      });
    } else if (currentUser.type === 'ADMIN') {
      // ADMIN can view patients for themselves and users they created
      const adminUsers = await prisma.authorizedUser.findMany({
        where: {
          OR: [
            { id: currentUser.id },
            { createdBy: currentUser.id },
          ],
        },
        select: { email: true },
      });

      const adminEmails = adminUsers.map(user => user.email);

      patients = await prisma.patient.findMany({
        where: {
          user: {
            email: {
              in: adminEmails,
            },
          },
        },
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          relation: true,
          remark: true,
          address: true,
          aadiId: true,
          keyWorkerName: true,
          caregiverName: true,
          phoneNumber: true,
          score: true,
          user: {
            select: {
              email: true,
              name: true,
              userType: true,
            },
          },
        },
      });
    } else {
      // For USER, require userId and it must be their own
      if (!userId) {
        return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
      }

      const userIdInt = parseInt(userId, 10);
      if (isNaN(userIdInt)) {
        return NextResponse.json({ error: 'userId must be a valid integer' }, { status: 400 });
      }

      if (userIdInt !== currentUserIdInt) {
        return NextResponse.json({ error: 'You can only view your own patients' }, { status: 403 });
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
      patients = await prisma.patient.findMany({
        where: { userId: patientTestUser.id },
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          relation: true,
          remark: true,
          address: true,
          aadiId: true,
          keyWorkerName: true,
          phoneNumber: true,
          score: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });
    }

    // Calculate age for each patient
    const patientsWithAge = patients.map(patient => ({
      ...patient,
      age: patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
    }));

    return NextResponse.json({ patients: patientsWithAge }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, currentUserId, name, dateOfBirth, relation, remark, address, aadiId, keyWorkerName, caregiverName, phoneNumber, score } = await request.json();
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

    // Check if aadiId is provided and already exists
    if (aadiId) {
      const existingPatient = await prisma.patient.findUnique({
        where: { aadiId },
      });
      if (existingPatient) {
        return NextResponse.json({ error: 'AADI ID already exists' }, { status: 400 });
      }
    }

    // Create new patient linked to the PatientTestUser
    const patient = await prisma.patient.create({
      data: {
        userId: patientTestUser.id,
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        relation: relation || 'OTHER',
        remark: remark || null,
        address: address || null,
        aadiId: aadiId || null,
        keyWorkerName: keyWorkerName || null,
        caregiverName: caregiverName || null,
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
