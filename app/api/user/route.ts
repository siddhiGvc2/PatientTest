import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserType } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, type, createdBy } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if the creator has permission to create this type of user
    if (createdBy) {
      const creator = await prisma.authorizedUser.findUnique({
        where: { id: createdBy },
      });

      if (!creator) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }

      if (creator.type === UserType.USER) {
        return NextResponse.json({ error: 'Users cannot create other users' }, { status: 403 });
      }

      if (creator.type === UserType.ADMIN && type === UserType.SUPERADMIN) {
        return NextResponse.json({ error: 'Admins cannot create superadmins' }, { status: 403 });
      }
    }

    // Prepare update objects conditionally
    const authorizedUpdate: any = {};
    if (type !== undefined) authorizedUpdate.type = type;
    if (createdBy !== undefined) authorizedUpdate.createdBy = createdBy;

    const patientUpdate: any = {};
    if (name !== undefined) patientUpdate.name = name;
    if (type !== undefined) patientUpdate.userType = type;

    // Upsert authorized user
    const authorizedUser = await prisma.authorizedUser.upsert({
      where: { email },
      update: authorizedUpdate,
      create: {
        email,
        type: type || UserType.USER,
        createdBy,
      },
    });

    // Upsert patient test user
    const user = await prisma.patientTestUser.upsert({
      where: { email },
      update: patientUpdate,
      create: {
        name,
        email,
        password: '', // Placeholder since password is required in schema; consider making optional later
        userType: type || UserType.USER,
      },
    });

    return NextResponse.json({ message: 'User saved successfully', user, authorizedUser }, { status: 200 });
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, type, currentUserId } = await request.json();

    if (!id || !email || !currentUserId) {
      return NextResponse.json({ error: 'ID, email, and currentUserId are required' }, { status: 400 });
    }

    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: parseInt(currentUserId) },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check permissions
    const targetUser = await prisma.authorizedUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (currentUser.type === UserType.ADMIN) {
      // ADMIN can only update users they created and cannot update other ADMINS
      if (targetUser.createdBy !== currentUser.id) {
        return NextResponse.json({ error: 'You can only update users you created' }, { status: 403 });
      }
      if (targetUser.type === UserType.ADMIN && type !== UserType.ADMIN) {
        return NextResponse.json({ error: 'You cannot change the type of other admins' }, { status: 403 });
      }
    } else if (currentUser.type === UserType.USER) {
      return NextResponse.json({ error: 'Users cannot update other users' }, { status: 403 });
    }

    // Prepare update objects conditionally
    const authorizedUpdate: any = {};
    if (type !== undefined) authorizedUpdate.type = type;

    const patientUpdate: any = {};
    if (name !== undefined) patientUpdate.name = name;
    if (type !== undefined) patientUpdate.userType = type;

    // Update authorized user
    const authorizedUser = await prisma.authorizedUser.update({
      where: { id },
      data: authorizedUpdate,
    });

    // Update patient test user
    const user = await prisma.patientTestUser.update({
      where: { email },
      data: patientUpdate,
    });

    return NextResponse.json({ message: 'User updated successfully', user, authorizedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');

    // If no currentUserId or currentUserId=0, return all users for authorization check
    if (!currentUserId || currentUserId === '0') {
      const authorizedUsers = await prisma.authorizedUser.findMany({
        select: {
          id: true,
          email: true,
          type: true,
          createdBy: true,
        },
      });
      return NextResponse.json({ authorizedUsers }, { status: 200 });
    }

    const currentUser = await prisma.authorizedUser.findUnique({
      where: { id: parseInt(currentUserId) },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    let authorizedUsers: any[];

    if (currentUser.type === UserType.SUPERADMIN) {
      // SUPERADMIN sees all users
      authorizedUsers = await prisma.authorizedUser.findMany({
        select: {
          id: true,
          email: true,
          type: true,
          createdBy: true,
        },
      });
    } else if (currentUser.type === UserType.ADMIN) {
      // ADMIN sees only users they created
      authorizedUsers = await prisma.authorizedUser.findMany({
        where: {
          createdBy: currentUser.id,
        },
        select: {
          id: true,
          email: true,
          type: true,
          createdBy: true,
        },
      });
    } else {
      // USER sees no users
      authorizedUsers = [];
    }

    return NextResponse.json({ authorizedUsers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching authorized users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
