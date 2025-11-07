import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const screenId = parseInt(id);

    if (isNaN(screenId)) {
      return NextResponse.json({ error: 'Invalid screen ID' }, { status: 400 });
    }

    // Check if screen exists
    const screen = await prisma.screen.findUnique({
      where: { id: screenId },
    });

    if (!screen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 });
    }

    // Delete related records in the correct order to handle foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete UserResponses that reference questions or images from this screen
      await tx.userResponse.deleteMany({
        where: {
          OR: [
            {
              question: {
                screenId: screenId,
              },
            },
            {
              selectedImage: {
                screenId: screenId,
              },
            },
          ],
        },
      });

      // Delete Options that reference questions from this screen
      await tx.option.deleteMany({
        where: {
          question: {
            screenId: screenId,
          },
        },
      });

      // Delete Questions from this screen
      await tx.question.deleteMany({
        where: { screenId: screenId },
      });

      // Delete Images from this screen
      await tx.image.deleteMany({
        where: { screenId: screenId },
      });

      // Finally, delete the screen
      await tx.screen.delete({
        where: { id: screenId },
      });
    });

    return NextResponse.json({ message: 'Screen deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting screen:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
