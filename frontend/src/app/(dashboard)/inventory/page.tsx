'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number | string;
  stock: number;
  lowStockThreshold: number;
  category?: string;
}

export default function InventoryPage() {
  const { accessToken } = useAuth();
  const { refreshKey } = useRealtime();
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', price: '', stock: '0', category: '' });

  const load = () => {
    if (!accessToken) return;
    api.getProducts(accessToken).then((data) => setProducts(data as Product[])).catch(console.error);
  };

  useEffect(load, [accessToken, refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    await api.createProduct(accessToken, {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    });
    setModalOpen(false);
    load();
  };

  const adjustStock = async (id: string, change: number) => {
    if (!accessToken) return;
    await api.adjustStock(accessToken, id, { change, reason: 'Manual adjustment' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Products and stock levels</p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <DataTable
        data={products as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'sku', header: 'SKU' },
          { key: 'name', header: 'Name' },
          { key: 'price', header: 'Price', render: (r) => `$${Number(r.price).toFixed(2)}` },
          {
            key: 'stock',
            header: 'Stock',
            render: (r) => {
              const low = Number(r.stock) <= Number(r.lowStockThreshold);
              return (
                <span className="flex items-center gap-2">
                  {String(r.stock)}
                  {low && <StatusBadge status="LOW" />}
                </span>
              );
            },
          },
          { key: 'category', header: 'Category', render: (r) => String(r.category ?? '—') },
          {
            key: 'actions',
            header: 'Adjust',
            render: (r) => (
              <div className="flex gap-1">
                <button type="button" className="rounded bg-gray-100 px-2 py-1 text-xs" onClick={() => adjustStock(String(r.id), 1)}>+1</button>
                <button type="button" className="rounded bg-gray-100 px-2 py-1 text-xs" onClick={() => adjustStock(String(r.id), -1)}>-1</button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New product">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          <FormInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <FormInput label="Initial stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <FormInput label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white">Create</button>
        </form>
      </Modal>
    </div>
  );
}
