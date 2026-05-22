'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export default function StaffPage() {
  const { accessToken, user } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
      setError('Admin or Manager role required');
      return;
    }
    api.getUsers(accessToken).then((data) => setStaff(data as StaffUser[])).catch(() => setError('Unable to load staff'));
  }, [accessToken, user]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff & Users</h1>
        <p className="text-sm text-gray-500">Role-based access control</p>
      </div>

      <DataTable
        data={staff as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'firstName', header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role', render: (r) => <StatusBadge status={String(r.role)} /> },
          { key: 'isActive', header: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
        ]}
      />
    </div>
  );
}
