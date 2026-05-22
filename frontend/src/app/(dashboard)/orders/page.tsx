'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FormSelect } from '@/components/ui/FormInput';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  customer?: { firstName: string; lastName: string };
  createdAt: string;
}

export default function OrdersPage() {
  const { accessToken } = useAuth();
  const { refreshKey } = useRealtime();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    if (!accessToken) return;
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    api.getOrders(accessToken, params).then((data) => setOrders(data as Order[])).catch(console.error);
  };

  useEffect(load, [accessToken, statusFilter, refreshKey]);

  const updateStatus = async (id: string, status: string) => {
    if (!accessToken) return;
    await api.updateOrderStatus(accessToken, id, status);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">Real-time order management</p>
      </div>

      <FormSelect label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </FormSelect>

      <DataTable
        data={orders as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'orderNumber', header: 'Order #' },
          {
            key: 'customer',
            header: 'Customer',
            render: (r) => {
              const c = r.customer as { firstName?: string; lastName?: string };
              return c ? `${c.firstName} ${c.lastName}` : '—';
            },
          },
          {
            key: 'total',
            header: 'Total',
            render: (r) => `$${Number(r.total).toFixed(2)}`,
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <StatusBadge status={String(r.status)} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <select
                className="rounded border border-gray-300 px-2 py-1 text-xs"
                value={String(r.status)}
                onChange={(e) => updateStatus(String(r.id), e.target.value)}
              >
                {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ),
          },
        ]}
      />
    </div>
  );
}
