'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { useT } from '@/components/I18nProvider';
import { Sprout, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const t = useT();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: 'Lahore',
    farm_size_acres: '',
    primary_crop: 'Wheat',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        farm_size_acres: parseFloat(form.farm_size_acres) || 0,
      };
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      login(data.access_token, data.user);
      window.location.href = `/${locale}/dashboard`;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
            <Sprout className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.registerTitle')}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.name')}</label>
              <input name="name" required value={form.name} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.email')}</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.password')}</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.phone')}</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.district')}</label>
                <select name="district" value={form.district} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['Lahore', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Rawalpindi', 'Bahawalpur'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.farmSize')}</label>
                <input name="farm_size_acres" type="number" step="0.5" value={form.farm_size_acres} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.primaryCrop')}</label>
              <select name="primary_crop" value={form.primary_crop} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                {['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Vegetables'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('auth.registerBtn')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            {t('auth.hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-primary-600 font-medium hover:underline">
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
