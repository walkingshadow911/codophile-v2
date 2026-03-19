import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/lib/models/Admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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

// Ensure context type is matched properly with Next.js 15
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const resolvedParams = await params;
    
    if (authUser.id === resolvedParams.id) {
      return NextResponse.json({ message: 'Cannot delete yourself' }, { status: 400 });
    }

    await connectToDatabase();
    const deletedAdmin = await Admin.findByIdAndDelete(resolvedParams.id);

    if (!deletedAdmin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Admin deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    
    const updateData: any = {
      name: body.name
    };

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(body.password, salt);
    }

    await connectToDatabase();
    const updatedAdmin = await Admin.findByIdAndUpdate(
      resolvedParams.id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash');

    if (!updatedAdmin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Admin updated successfully', admin: updatedAdmin }, { status: 200 });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
