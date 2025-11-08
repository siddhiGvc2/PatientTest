import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const currentUserId = searchParams.get('currentUserId');

    if (!patientId || !currentUserId) {
      return NextResponse.json({ error: 'patientId and currentUserId query parameters are required' }, { status: 400 });
    }

    const patientIdInt = parseInt(patientId, 10);
    const currentUserIdInt = parseInt(currentUserId, 10);

    if (isNaN(patientIdInt) || isNaN(currentUserIdInt)) {
      return NextResponse.json({ error: 'patientId and currentUserId must be valid integers' }, { status: 400 });
    }

    // Get current user to check permissions
    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: currentUserIdInt },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Get the patient to check ownership
    const patient = await prisma.patient.findUnique({
      where: { id: patientIdInt },
      include: { user: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check permissions
    let hasPermission = false;

    if (currentUser.type === 'SUPERADMIN') {
      hasPermission = true;
    } else {
      // Find the AuthorizedUser for the patient's user
      const patientAuthorizedUser = await prisma.authorizedUser.findUnique({
        where: { email: patient.user.email },
        select: { id: true, createdBy: true },
      });

      if (patientAuthorizedUser) {
        if (patientAuthorizedUser.id === currentUserIdInt) {
          hasPermission = true;
        } else if (currentUser.type === 'ADMIN' && patientAuthorizedUser.createdBy === currentUser.id) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to view score reports for this patient' }, { status: 403 });
    }

    // Build where clause for date filtering
    const whereClause: any = { patientId: patientIdInt };
    if (searchParams.get('startDate')) {
      whereClause.dateTime = { ...whereClause.dateTime, gte: new Date(searchParams.get('startDate')!) };
    }
    if (searchParams.get('endDate')) {
      whereClause.dateTime = { ...whereClause.dateTime, lte: new Date(searchParams.get('endDate')!) };
    }

    // Get filtered score reports for the patient
    const scoreReports = await prisma.scoreReport.findMany({
      where: whereClause,
      orderBy: { dateTime: 'desc' },
      select: {
        id: true,
        patientId: true,
        score: true,
        dateTime: true,
        detailedReport: true,
      },
    });

    return NextResponse.json({ scoreReports }, { status: 200 });
  } catch (error) {
    console.error('Error fetching score reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, score, currentUserId } = await request.json();

    if (!patientId || score === undefined || !currentUserId) {
      return NextResponse.json({ error: 'patientId, score, and currentUserId are required' }, { status: 400 });
    }

    const patientIdInt = parseInt(patientId, 10);
    const scoreInt = parseInt(score, 10);
    const currentUserIdInt = parseInt(currentUserId, 10);

    if (isNaN(patientIdInt) || isNaN(scoreInt) || isNaN(currentUserIdInt)) {
      return NextResponse.json({ error: 'patientId, score, and currentUserId must be valid integers' }, { status: 400 });
    }

    // Get current user to check permissions
    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: currentUserIdInt },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check if patient exists and belongs to the user
    const patient = await prisma.patient.findUnique({
      where: { id: patientIdInt },
      include: { user: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check permissions
    let hasPermission = false;

    if (currentUser.type === 'SUPERADMIN') {
      hasPermission = true;
    } else {
      // Find the AuthorizedUser for the patient's user
      const patientAuthorizedUser = await prisma.authorizedUser.findUnique({
        where: { email: patient.user.email },
        select: { id: true, createdBy: true },
      });

      if (patientAuthorizedUser) {
        if (patientAuthorizedUser.id === currentUserIdInt) {
          hasPermission = true;
        } else if (currentUser.type === 'ADMIN' && patientAuthorizedUser.createdBy === currentUser.id) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to create score reports for this patient' }, { status: 403 });
    }

    // Create the score report
    const scoreReport = await prisma.scoreReport.create({
      data: {
        patientId: patientIdInt,
        score: scoreInt,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ scoreReport }, { status: 201 });
  } catch (error) {
    console.error('Error creating score report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
