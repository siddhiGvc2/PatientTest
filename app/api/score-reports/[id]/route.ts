import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const scoreReportId = parseInt(id, 10);
    if (isNaN(scoreReportId)) {
      return NextResponse.json({ error: 'Invalid score report ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
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

    // Get the score report with patient details
    const scoreReport = await prisma.scoreReport.findUnique({
      where: { id: scoreReportId },
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

    if (!scoreReport) {
      return NextResponse.json({ error: 'Score report not found' }, { status: 404 });
    }

    // Check permissions
    let hasPermission = false;

    if (currentUser.type === 'SUPERADMIN') {
      hasPermission = true;
    } else {
      // Find the AuthorizedUser for the patient's user
      const patientAuthorizedUser = await prisma.authorizedUser.findUnique({
        where: { email: scoreReport.patient.user.email },
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
      return NextResponse.json({ error: 'You do not have permission to view this score report' }, { status: 403 });
    }

    return NextResponse.json({ scoreReport }, { status: 200 });
  } catch (error) {
    console.error('Error fetching score report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
