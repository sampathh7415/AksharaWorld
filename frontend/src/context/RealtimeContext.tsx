'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { getSocket, WS_EVENTS } from '@/lib/socket';
import { useAuth } from './AuthContext';

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeCustomers: number;
  liveRevenue: number;
  dailyRevenue?: number;
  monthlyRevenue?: number;
  updatedAt?: string;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface RealtimeContextValue {
  metrics: DashboardMetrics | null;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  refreshKey: number;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const addToast = useCallback((title: string, message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket();

    socket.on(WS_EVENTS.DASHBOARD_METRICS_UPDATED, (data: DashboardMetrics) => {
      setMetrics(data);
    });

    socket.on(WS_EVENTS.ORDER_CREATED, (data: { orderNumber?: string }) => {
      addToast('New order', `Order ${data.orderNumber ?? ''} created`, 'success');
      bump();
    });

    socket.on(WS_EVENTS.ORDER_UPDATED, () => {
      addToast('Order updated', 'An order status changed', 'info');
      bump();
    });

    socket.on(WS_EVENTS.PAYMENT_UPDATED, () => {
      addToast('Payment updated', 'A payment record was updated', 'info');
      bump();
    });

    socket.on(WS_EVENTS.INVENTORY_UPDATED, () => bump());

    socket.on(WS_EVENTS.LOW_STOCK_ALERT, (data: { name?: string; stock?: number }) => {
      addToast('Low stock', `${data.name}: ${data.stock} units left`, 'warning');
      bump();
    });

    socket.on(WS_EVENTS.NOTIFICATION_CREATED, (data: { title?: string; message?: string }) => {
      addToast(data.title ?? 'Notification', data.message ?? '', 'info');
      bump();
    });

    return () => {
      socket.off(WS_EVENTS.DASHBOARD_METRICS_UPDATED);
      socket.off(WS_EVENTS.ORDER_CREATED);
      socket.off(WS_EVENTS.ORDER_UPDATED);
      socket.off(WS_EVENTS.PAYMENT_UPDATED);
      socket.off(WS_EVENTS.INVENTORY_UPDATED);
      socket.off(WS_EVENTS.LOW_STOCK_ALERT);
      socket.off(WS_EVENTS.NOTIFICATION_CREATED);
    };
  }, [accessToken, addToast, bump]);

  return (
    <RealtimeContext.Provider value={{ metrics, toasts, dismissToast, refreshKey }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
}
