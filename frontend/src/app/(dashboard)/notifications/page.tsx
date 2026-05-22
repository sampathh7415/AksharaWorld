'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { accessToken } = useAuth();
  const { refreshKey } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = () => {
    if (!accessToken) return;
    api.getNotifications(accessToken).then((data) => setNotifications(data as Notification[])).catch(console.error);
  };

  useEffect(load, [accessToken, refreshKey]);

  const markAll = async () => {
    if (!accessToken) return;
    await api.markAllNotificationsRead(accessToken);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Real-time alerts and system messages</p>
        </div>
        <button type="button" onClick={markAll} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border p-4 ${n.isRead ? 'border-gray-200 bg-white' : 'border-brand-200 bg-brand-50'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{n.title}</p>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={n.type} />
            </div>
          </div>
        ))}
        {!notifications.length && (
          <p className="text-center text-gray-500 py-8">No notifications</p>
        )}
      </div>
    </div>
  );
}
