'use client';

import { Menu, LogOut, Wifi } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        type="button"
        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden items-center gap-2 text-sm text-emerald-600 lg:flex">
        <Wifi className="h-4 w-4" />
        Real-time connected
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right text-sm">
          <p className="font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
