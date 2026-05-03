'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import VoiceInputButton from '@/components/VoiceInputButton';
import ComboInput from '@/components/ComboInput';
import { CROPS, QUANTITIES } from '@/lib/options';

export default function DealGuardianPage() {
  const t = useT();
  const locale = useLocale();
  const [form, setForm] = useState({ buyer_name: '', crop: 'Wheat', quantity: '500 kg', price_per_kg: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/contracts/generate', {
        method: 'POST',
        body: JSON.stringify({ ...form, price_per_kg: parseFloat(form.price_per_kg), language: locale }),
      });
      setResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-blue-500" /> {t('dealGuardian.title')}
        </h1>
        <p className="text-slate-500">{t('dealGuardian.subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('dealGuardian.buyerName')}</label>
            <div className="flex gap-2">
              <input name="buyer_name" value={form.buyer_name} onChange={handleChange}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <VoiceInputButton locale={locale} onResult={(text) => setField('buyer_name', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('dealGuardian.crop')}</label>
            <div className="flex gap-2">
              <ComboInput
                name="crop"
                value={form.crop}
                onChange={handleChange}
                options={CROPS}
                listId="deal-crops"
                placeholder={t('dealGuardian.crop')}
              />
              <VoiceInputButton locale={locale} onResult={(text) => setField('crop', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('dealGuardian.quantity')}</label>
            <ComboInput
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              options={QUANTITIES}
              listId="deal-quantities"
              placeholder={t('dealGuardian.quantity')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('dealGuardian.price')}</label>
            <input name="price_per_kg" type="number" value={form.price_per_kg} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !form.buyer_name || !form.price_per_kg}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {t('dealGuardian.generate')}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border ${result.is_fair ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-center gap-2 mb-4">
              {result.is_fair ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
              <h2 className={`text-lg font-bold ${result.is_fair ? 'text-emerald-800' : 'text-red-800'}`}>
                {result.is_fair ? t('dealGuardian.isFair') : t('dealGuardian.isUnfair')}
              </h2>
            </div>
            {result.warnings?.length > 0 && (
              <div className="mb-4 space-y-1">
                {result.warnings.map((w: string, i: number) => (
                  <p key={i} className="text-sm text-red-700">{w}</p>
                ))}
              </div>
            )}
            <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
              <h3 className="font-semibold text-slate-900 mb-2">{t('dealGuardian.contract')}</h3>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{result.contract_text}</pre>
            </div>
            {result.pdf_url && (
              <a href={`http://localhost:8000/${result.pdf_url}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                <Download className="w-4 h-4" /> {t('dealGuardian.download')}
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
