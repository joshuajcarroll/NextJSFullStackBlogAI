// src/app/api/upload-image/route.ts
import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Define an interface for the expected shape of the upload result
interface UploadResult {
  Location?: string; // S3 returns the URL in the Location property
  // You might add other properties like ETag, Key, Bucket if you need them
}

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read',
      },
    });

    // Type the result explicitly
    const result = await upload.done() as UploadResult;
    const imageUrl = result.Location; // Access the property directly

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL not found in S3 response' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Error uploading image to S3:', error);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}