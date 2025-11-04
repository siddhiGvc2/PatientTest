import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../../utils/cloudinary';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'image-library');

    // Save to database
    const imageLibrary = await prisma.imageLibrary.create({
      data: {
        url: cloudinaryUrl,
      },
    });

    return NextResponse.json(imageLibrary, { status: 201 });
  } catch (error) {
    console.error('Error creating image library item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const imageLibraries = await prisma.imageLibrary.findMany();

    return NextResponse.json(imageLibraries);
  } catch (error) {
    console.error('Error fetching image library:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
