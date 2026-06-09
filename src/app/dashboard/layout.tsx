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
  
  const authSecret = process.env.AUTH_SECRET;
  
  let authenticated = false;
  
  if (token && authSecret) {
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
