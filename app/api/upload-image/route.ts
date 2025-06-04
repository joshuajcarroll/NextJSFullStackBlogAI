// src/app/api/upload-image/route.ts
import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

interface UploadResult {
  Location?: string;
}

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
        // REMOVE THIS LINE: ACL: 'public-read',
      },
    });

    const result = await upload.done() as UploadResult;
    const imageUrl = result.Location;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL not found in S3 response' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Error uploading image to S3:', error);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}