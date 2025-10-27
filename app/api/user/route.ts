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
    const { id, name, email, type } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ error: 'ID and email are required' }, { status: 400 });
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
    const authorizedUsers = await prisma.authorizedUser.findMany({
      select: {
        id: true,
        email: true,
        type: true,
        createdBy: true,
      },
    });

    return NextResponse.json({ authorizedUsers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching authorized users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
