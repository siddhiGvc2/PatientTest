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
    const imageLibraryIdStr = formData.get('imageLibraryId') as string;

    if (!screenIdStr) {
      return NextResponse.json({ error: 'screenId is required' }, { status: 400 });
    }

    const screenId = parseInt(screenIdStr);
    if (isNaN(screenId)) {
      return NextResponse.json({ error: 'screenId must be a number' }, { status: 400 });
    }

    let cloudinaryUrl: string | undefined;

    if (file) {
      // Upload new file
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'patient-test-images');
      const imageLibrary = await prisma.imageLibrary.create({
        data: {
          url: cloudinaryUrl
        },
      });
    } else if (imageLibraryIdStr) {
      // Use existing image from library
      const imageLibraryId = parseInt(imageLibraryIdStr);
      if (isNaN(imageLibraryId)) {
        return NextResponse.json({ error: 'imageLibraryId must be a number' }, { status: 400 });
      }

      const imageLibrary = await prisma.imageLibrary.findUnique({
        where: { id: imageLibraryId },
      });

      if (!imageLibrary) {
        return NextResponse.json({ error: 'Image library item not found' }, { status: 404 });
      }
      cloudinaryUrl = imageLibrary.url;
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.image.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
