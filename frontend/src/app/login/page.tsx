'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FormInput } from '@/components/ui/FormInput';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@bizops.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">BizOps Login</h1>
        <p className="mt-1 text-sm text-gray-500">Real-time business operations dashboard</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          No account?{' '}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          Demo: admin@bizops.local / Admin123!
        </p>
      </div>
    </div>
  );
}
