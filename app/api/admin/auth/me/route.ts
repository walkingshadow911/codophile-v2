import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export async function GET(req: Request) {
  try {
    const adminToken = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];

    if (!adminToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(adminToken, JWT_SECRET);
      return NextResponse.json({ user: decoded }, { status: 200 });
    } catch (e) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
