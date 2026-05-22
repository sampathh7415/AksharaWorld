'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Package,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import type { DashboardMetrics } from '@/context/RealtimeContext';

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const { metrics: liveMetrics, refreshKey } = useRealtime();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<{ date: string; revenue: number }[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    api.getDashboard(accessToken).then(setMetrics).catch(console.error);
    api.getDailySales(accessToken, 7).then(setChartData).catch(console.error);
  }, [accessToken, refreshKey]);

  const m = liveMetrics ?? metrics;

  const fmt = (n?: number) =>
    n != null ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Live business metrics — updates in real time</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total sales (month)" value={fmt(m?.totalSales)} icon={DollarSign} />
        <StatCard title="Total orders" value={m?.totalOrders ?? '—'} icon={ShoppingCart} />
        <StatCard title="Pending orders" value={m?.pendingOrders ?? '—'} icon={Clock} variant="warning" />
        <StatCard title="Low-stock products" value={m?.lowStockProducts ?? '—'} icon={Package} variant="warning" />
        <StatCard title="Active customers" value={m?.activeCustomers ?? '—'} icon={Users} />
        <StatCard title="Live revenue (today)" value={fmt(m?.liveRevenue)} icon={TrendingUp} variant="success" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Daily revenue (7 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
