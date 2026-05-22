'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FormInput } from '@/components/ui/FormInput';

interface Settings {
  businessName: string;
  currency: string;
  taxRate: number | string;
  lowStockDefault: number;
  timezone: string;
}

export default function SettingsPage() {
  const { accessToken, user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    api.getSettings(accessToken).then((data) => setSettings(data as unknown as Settings)).catch(console.error);
  }, [accessToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !settings || user?.role !== 'ADMIN') return;
    await api.updateSettings(accessToken, {
      businessName: settings.businessName,
      currency: settings.currency,
      taxRate: Number(settings.taxRate),
      lowStockDefault: settings.lowStockDefault,
      timezone: settings.timezone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Business configuration</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <FormInput
          label="Business name"
          value={settings.businessName}
          onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
          disabled={user?.role !== 'ADMIN'}
        />
        <FormInput
          label="Currency"
          value={settings.currency}
          onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
          disabled={user?.role !== 'ADMIN'}
        />
        <FormInput
          label="Tax rate (decimal)"
          type="number"
          step="0.01"
          value={String(settings.taxRate)}
          onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
          disabled={user?.role !== 'ADMIN'}
        />
        <FormInput
          label="Default low-stock threshold"
          type="number"
          value={String(settings.lowStockDefault)}
          onChange={(e) => setSettings({ ...settings, lowStockDefault: parseInt(e.target.value, 10) })}
          disabled={user?.role !== 'ADMIN'}
        />
        <FormInput
          label="Timezone"
          value={settings.timezone}
          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          disabled={user?.role !== 'ADMIN'}
        />
        {user?.role === 'ADMIN' && (
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Save settings
          </button>
        )}
        {saved && <p className="text-sm text-emerald-600">Settings saved.</p>}
      </form>
    </div>
  );
}
