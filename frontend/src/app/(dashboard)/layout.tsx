'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RealtimeProvider } from '@/context/RealtimeContext';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RealtimeProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </RealtimeProvider>
    </ProtectedRoute>
  );
}
