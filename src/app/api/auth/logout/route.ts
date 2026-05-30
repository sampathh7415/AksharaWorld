export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/'
  });
  return response;
}
export async function GET(req: NextRequest) {
  // Graceful fallback for GET logout
  const response = NextResponse.redirect(new URL('/dashboard/login', req.url));
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
  return response;
}
