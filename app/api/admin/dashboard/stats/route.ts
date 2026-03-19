import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/lib/models/Admin';
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

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch real stats
    const totalAdmins = await Admin.countDocuments();
    
    // Determine stats
    // Assuming 1 active session (the logged-in admin) mapping 0 for alerts/operations until those systems are built.
    const activeSessions = 1;
    const securityAlerts = 0;
    const operations24h = 0;
    
    return NextResponse.json({
      totalAdmins,
      activeSessions,
      securityAlerts,
      operations24h
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
