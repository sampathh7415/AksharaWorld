export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { signJWT } from '../../../../lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authSecret = process.env.AUTH_SECRET;

    if (!adminPassword || !authSecret) {
      return NextResponse.json({ success: false, error: 'Server misconfiguration: Authentication secrets not configured' }, { status: 500 });
    }
    
    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Incorrect administrative password' }, { status: 401 });
    }
    
    // Create JWT token valid for 24 hours
    const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    const token = await signJWT({ role: 'admin', exp: expiresAt }, authSecret);
    
    // Set secure HttpOnly cookie
    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });
    
    return response;
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
