import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../../../utils/cloudinary';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const screenIdStr = formData.get('screenId') as string;

    if (!screenIdStr) {
      return NextResponse.json({ error: 'screenId is required' }, { status: 400 });
    }

    const screenId = parseInt(screenIdStr);
    if (isNaN(screenId)) {
      return NextResponse.json({ error: 'screenId must be a number' }, { status: 400 });
    }

    let cloudinaryUrl: string | undefined;

    if (file) {
      // Convert file to buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Upload to Cloudinary
      cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'patient-test-images');
    }

    const updateData: { url?: string; screenId: number } = { screenId };
    if (cloudinaryUrl) {
      updateData.url = cloudinaryUrl;
    }

    const updatedImage = await prisma.image.update({
      where: { id: idNum },
      data: updateData,
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
