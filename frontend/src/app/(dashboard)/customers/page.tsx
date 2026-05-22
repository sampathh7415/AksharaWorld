'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  isActive: boolean;
  _count?: { orders: number };
}

export default function CustomersPage() {
  const { accessToken } = useAuth();
  const { refreshKey } = useRealtime();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', company: '', phone: '' });

  const load = () => {
    if (!accessToken) return;
    api.getCustomers(accessToken, search || undefined).then((data) => setCustomers(data as Customer[])).catch(console.error);
  };

  useEffect(load, [accessToken, search, refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    await api.createCustomer(accessToken, form);
    setModalOpen(false);
    setForm({ email: '', firstName: '', lastName: '', company: '', phone: '' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Manage customer records</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add customer
        </button>
      </div>

      <input
        type="search"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />

      <DataTable
        data={customers as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'firstName', header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
          { key: 'email', header: 'Email' },
          { key: 'company', header: 'Company', render: (r) => String(r.company ?? '—') },
          { key: 'orders', header: 'Orders', render: (r) => String((r._count as { orders?: number })?.orders ?? 0) },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New customer">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <FormInput label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <FormInput label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white">Create</button>
        </form>
      </Modal>
    </div>
  );
}
