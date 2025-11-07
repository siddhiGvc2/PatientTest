import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const patientIdInt = parseInt(patientId, 10);
    if (isNaN(patientIdInt)) {
      return NextResponse.json({ error: 'patientId must be a valid integer' }, { status: 400 });
    }

    // Fetch all responses for the patient
    const allResponses = await prisma.userResponse.findMany({
      where: { patientId: patientIdInt },
      select: {
        id: true,
        questionId: true,
        isCorrect: true,
        question: {
          select: {
            text: true,
            options: {
              select: { id: true, text: true }
            }
          }
        },
       
      },
    });

    // Calculate the score based on correct responses
    const correctResponses = allResponses.filter(response => response.isCorrect);
    const score = correctResponses.length;

    // Update the patient's score
    const updatedPatient = await prisma.patient.update({
      where: { id: patientIdInt },
      data: { score },
    });

    // Save score-report with detailedReport
    await prisma.scoreReport.create({
      data: {
        patientId: patientIdInt,
        score,
        detailedReport: allResponses,
      },
    });

    return NextResponse.json({ patient: updatedPatient, score }, { status: 200 });
  } catch (error) {
    console.error('Error calculating and saving score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
