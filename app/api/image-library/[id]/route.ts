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

    let cloudinaryUrl: string | undefined;

    if (file) {
      // Convert file to buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Upload to Cloudinary
      cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'image-library');
    }

    const updateData: { url?: string } = {};
    if (cloudinaryUrl) {
      updateData.url = cloudinaryUrl;
    }

    const updatedImageLibrary = await prisma.imageLibrary.update({
      where: { id: idNum },
      data: updateData,
    });

    return NextResponse.json(updatedImageLibrary);
  } catch (error) {
    console.error('Error updating image library item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    await prisma.imageLibrary.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Image library item deleted successfully' });
  } catch (error) {
    console.error('Error deleting image library item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
