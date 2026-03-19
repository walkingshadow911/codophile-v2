import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Effect from '@/lib/models/Effect';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch (e) {
    return null;
  }
}

export async function PATCH(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { ids, isPublished } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Missing or invalid ids array' }, { status: 400 });
    }

    if (typeof isPublished !== 'boolean') {
      return NextResponse.json({ message: 'Missing or invalid isPublished boolean' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Update multiple effects
    await Effect.updateMany(
      { _id: { $in: ids } },
      { $set: { isPublished } }
    );

    return NextResponse.json({ message: 'Effects updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
