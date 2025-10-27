import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get current user from request (assuming it's passed in headers or body)
    // For simplicity, we'll assume the current user ID is passed in the body
    const { currentUserId } = await request.json();

    if (!currentUserId) {
      return NextResponse.json({ error: 'Current user ID is required' }, { status: 400 });
    }

    const currentUserIdInt = parseInt(currentUserId, 10);
    if (isNaN(currentUserIdInt)) {
      return NextResponse.json({ error: 'Invalid current user ID' }, { status: 400 });
    }

    // Get the user to be deleted with full details
    const userToDelete = await prisma.authorizedUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        type: true,
        createdBy: true,
      },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the current user with full details
    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: currentUserIdInt },
      select: {
        id: true,
        email: true,
        type: true,
        createdBy: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check permissions
    if (currentUser.type === 'USER') {
      return NextResponse.json({ error: 'Users cannot delete other users' }, { status: 403 });
    }

    if (currentUser.type === 'ADMIN' && userToDelete.type === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Admins cannot delete superadmins' }, { status: 403 });
    }

    // Only superadmins can delete other superadmins
    if (userToDelete.type === 'SUPERADMIN' && currentUser.type !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Only superadmins can delete other superadmins' }, { status: 403 });
    }

    // Check if the user to delete was created by the current user (for admins)
    if (currentUser.type === 'ADMIN' && userToDelete.createdBy !== currentUserIdInt) {
      return NextResponse.json({ error: 'Admins can only delete users they created' }, { status: 403 });
    }

    // Prevent admins from deleting other admins
    if (currentUser.type === 'ADMIN' && userToDelete.type === 'ADMIN' && userToDelete.id !== currentUserIdInt) {
      return NextResponse.json({ error: 'Admins cannot delete other admins' }, { status: 403 });
    }

    // Delete the authorized user
    await prisma.authorizedUser.delete({
      where: { id: userId },
    });

    // Also delete the corresponding patient test user
    await prisma.patientTestUser.deleteMany({
      where: { email: userToDelete.email },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
