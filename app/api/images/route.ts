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

    if (!file || !screenIdStr) {
      return NextResponse.json({ error: 'file and screenId are required' }, { status: 400 });
    }

    const screenId = parseInt(screenIdStr);
    if (isNaN(screenId)) {
      return NextResponse.json({ error: 'screenId must be a number' }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'patient-test-images');

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
