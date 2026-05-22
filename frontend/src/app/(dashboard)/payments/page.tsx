'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Payment {
  id: string;
  amount: number | string;
  status: string;
  provider: string;
  order?: { orderNumber: string };
  customer?: { firstName: string; lastName: string };
  createdAt: string;
}

export default function PaymentsPage() {
  const { accessToken } = useAuth();
  const { refreshKey } = useRealtime();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    api.getPayments(accessToken).then((data) => setPayments(data as Payment[])).catch(console.error);
  }, [accessToken, refreshKey]);

  const markCompleted = async (id: string) => {
    if (!accessToken) return;
    await api.updatePayment(accessToken, id, { status: 'COMPLETED' });
    const list = await api.getPayments(accessToken);
    setPayments(list as Payment[]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">Transactions — Stripe/Razorpay/PayPal ready</p>
      </div>

      <DataTable
        data={payments as unknown as Record<string, unknown>[]}
        columns={[
          {
            key: 'order',
            header: 'Order',
            render: (r) => String((r.order as { orderNumber?: string })?.orderNumber ?? '—'),
          },
          {
            key: 'customer',
            header: 'Customer',
            render: (r) => {
              const c = r.customer as { firstName?: string; lastName?: string };
              return c ? `${c.firstName} ${c.lastName}` : '—';
            },
          },
          { key: 'amount', header: 'Amount', render: (r) => `$${Number(r.amount).toFixed(2)}` },
          { key: 'provider', header: 'Provider' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) =>
              r.status === 'PENDING' ? (
                <button
                  type="button"
                  className="text-xs text-brand-600 hover:underline"
                  onClick={() => markCompleted(String(r.id))}
                >
                  Mark completed
                </button>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
