import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  });

  return response;
}

export async function GET(req: Request) {
  // same logic for get as a fallback
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  });

  return response;
}
