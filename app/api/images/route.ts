import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { uploadToCloudinary } from '../../utils/cloudinary';

const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const screenIdStr = formData.get('screenId') as string;
    const imageLibraryIdStr = formData.get('imageLibraryId') as string;

    if (!screenIdStr) {
      return NextResponse.json({ error: 'screenId is required' }, { status: 400 });
    }

    const screenId = parseInt(screenIdStr);
    if (isNaN(screenId)) {
      return NextResponse.json({ error: 'screenId must be a number' }, { status: 400 });
    }

    let cloudinaryUrl: string;

    if (file) {
      // Upload new file
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'patient-test-images');
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
    } else {
      return NextResponse.json({ error: 'Either file or imageLibraryId is required' }, { status: 400 });
    }

    // Save to database
    const image = await prisma.image.create({
      data: {
        url: cloudinaryUrl,
        screenId,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      include: {
        screen: true,
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
