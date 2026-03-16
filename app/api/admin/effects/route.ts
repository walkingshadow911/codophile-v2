import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Effect from '@/lib/models/Effect';
import jwt from 'jsonwebtoken';
// import {jwt} from 'jsonwebtoken';
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

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const effects = await Effect.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ effects }, { status: 200 });
  } catch (error) {
    console.error('Error fetching effects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();

    if (!data.id || !data.title || !data.description) {
      return NextResponse.json({ message: 'Missing required fields (id, title, description)' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check if effect exists
    const existingEffect = await Effect.findOne({ id: data.id });
    if (existingEffect) {
      return NextResponse.json({ message: 'Effect with this ID already exists' }, { status: 400 });
    }

    const newEffect = new Effect({
      id: data.id,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      keywords: data.keywords || [],
      code: {
        html: data.code?.html || '',
        css: data.code?.css || '',
        js: data.code?.js || '',
        react: data.code?.react || ''
      },
      isPublished: data.isPublished || false,
      previewImage: data.previewImage || ''
    });

    await newEffect.save();

    return NextResponse.json({ message: 'Effect created successfully', effect: newEffect }, { status: 201 });
  } catch (error) {
    console.error('Error creating effect:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
