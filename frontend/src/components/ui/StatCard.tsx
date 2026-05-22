import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'warning' | 'success';
}) {
  const colors = {
    default: 'bg-white border-gray-200',
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-emerald-50 border-emerald-200',
  };

  return (
    <div className={clsx('rounded-xl border p-5 shadow-sm', colors[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
        </div>
        <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
