import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '../../lib/utils/auth';

export const runtime = 'edge';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get('admin_token');
  const token = tokenObj?.value;
  
  const authSecret = process.env.AUTH_SECRET || 'akshara_jwt_secret_token_2026';
  
  let authenticated = false;
  
  if (token) {
    const verified = await verifyJWT(token, authSecret);
    if (verified && verified.role === 'admin') {
      authenticated = true;
    }
  }
  
  if (!authenticated) {
    redirect('/dashboard/login');
  }
  
  return <>{children}</>;
}
