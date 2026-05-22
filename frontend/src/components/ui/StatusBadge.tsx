import clsx from 'clsx';

const styles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  ADMIN: 'bg-brand-100 text-brand-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  STAFF: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status] ?? 'bg-gray-100 text-gray-700',
      )}
    >
      {status}
    </span>
  );
}
