import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/lib/models/Admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Function to verify token and get user
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
    // Exclude password hash from response
    const admins = await Admin.find({}).select('-passwordHash').sort({ createdAt: -1 });
    
    return NextResponse.json({ admins }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin with this email already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      name,
      passwordHash
    });

    await newAdmin.save();

    const adminResponse = {
      _id: newAdmin._id,
      email: newAdmin.email,
      name: newAdmin.name,
      createdAt: newAdmin.createdAt
    };

    return NextResponse.json({ message: 'Admin created successfully', admin: adminResponse }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
