import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
}

// POST /api/admin/upload
// Body: { filename: string, contentType: string }
// Returns: { uploadUrl, publicUrl }
export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ message: 'filename and contentType are required' }, { status: 400 });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    const key = `effects/thumbnails/${Date.now()}-${filename.replace(/\s+/g, '-')}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

    const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl }, { status: 200 });
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json({ message: 'Failed to generate upload URL' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ message: 'url is required' }, { status: 400 });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    const bucketDomain = `${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    
    if (!url.includes(bucketDomain)) {
      return NextResponse.json({ message: 'Invalid URL for this bucket' }, { status: 400 });
    }

    const key = url.split(bucketDomain)[1];
    if (!key) {
      return NextResponse.json({ message: 'Could not extract key from URL' }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json({ message: 'File deleted from S3' }, { status: 200 });
  } catch (error) {
    console.error('S3 delete error:', error);
    return NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
  }
}
