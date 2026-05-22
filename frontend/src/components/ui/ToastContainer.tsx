'use client';

import { useRealtime } from '@/context/RealtimeContext';
import clsx from 'clsx';

export function ToastContainer() {
  const { toasts, dismissToast } = useRealtime();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'min-w-[280px] max-w-sm rounded-lg border px-4 py-3 shadow-lg',
            t.type === 'success' && 'border-emerald-200 bg-emerald-50',
            t.type === 'warning' && 'border-amber-200 bg-amber-50',
            t.type === 'error' && 'border-red-200 bg-red-50',
            t.type === 'info' && 'border-gray-200 bg-white',
          )}
        >
          <div className="flex justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              <p className="text-xs text-gray-600">{t.message}</p>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => dismissToast(t.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
