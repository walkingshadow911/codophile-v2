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

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    await connectToDatabase();
    const effect = await Effect.findById(id);
    
    if (!effect) {
        return NextResponse.json({ message: 'Effect not found' }, { status: 404 });
    }

    return NextResponse.json({ effect }, { status: 200 });
  } catch (error) {
    console.error('Error fetching effect:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const effect = await Effect.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description,
        tags: body.tags || [],
        keywords: body.keywords || [],
        code: {
          html: body.code?.html || '',
          css: body.code?.css || '',
          js: body.code?.js || '',
          react: body.code?.react || ''
        },
        isPublished: body.isPublished !== undefined ? body.isPublished : false,
        previewImage: body.previewImage || ''
      },
      { new: true }
    );

    if (!effect) {
      return NextResponse.json({ message: 'Effect not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Effect updated successfully', effect }, { status: 200 });
  } catch (error) {
    console.error('Error updating effect:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;

    await connectToDatabase();
    
    const effect = await Effect.findByIdAndDelete(id);

    if (!effect) {
      return NextResponse.json({ message: 'Effect not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Effect deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting effect:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
