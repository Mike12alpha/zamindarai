'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import VoiceInputButton from '@/components/VoiceInputButton';
import ComboInput from '@/components/ComboInput';
import { CROPS, DISTRICTS, QUANTITIES } from '@/lib/options';

export default function PriceOraclePage() {
  const t = useT();
  const locale = useLocale();
  const [form, setForm] = useState({ crop: 'Wheat', quantity: '1000 kg', location: 'Lahore', offered_price: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheck = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/prices/check', {
        method: 'POST',
        body: JSON.stringify({ ...form, offered_price: parseFloat(form.offered_price), language: locale }),
      });
      setResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-amber-500" /> {t('priceOracle.title')}
        </h1>
        <p className="text-slate-500">{t('priceOracle.subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('priceOracle.crop')}</label>
            <div className="flex gap-2">
              <ComboInput
                name="crop"
                value={form.crop}
                onChange={handleChange}
                options={CROPS}
                listId="price-crops"
                placeholder={t('priceOracle.crop')}
              />
              <VoiceInputButton locale={locale} onResult={(text) => setField('crop', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('priceOracle.quantity')}</label>
            <ComboInput
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              options={QUANTITIES}
              listId="price-quantities"
              placeholder={t('priceOracle.quantity')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('priceOracle.location')}</label>
            <div className="flex gap-2">
              <ComboInput
                name="location"
                value={form.location}
                onChange={handleChange}
                options={DISTRICTS}
                listId="price-districts"
                placeholder={t('priceOracle.location')}
              />
              <VoiceInputButton locale={locale} onResult={(text) => setField('location', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('priceOracle.offeredPrice')}</label>
            <input name="offered_price" type="number" value={form.offered_price} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <button onClick={handleCheck} disabled={loading || !form.offered_price}
          className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          {t('priceOracle.check')}
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
              {result.is_fair ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <h2 className={`text-lg font-bold ${result.is_fair ? 'text-emerald-800' : 'text-red-800'}`}>
                {result.is_fair ? t('priceOracle.fair') : t('priceOracle.unfair')}
              </h2>
            </div>
            <div className="whitespace-pre-wrap text-slate-800 text-sm leading-relaxed mb-4">
              {result.analysis}
            </div>
            {result.market_rate && (
              <div className="inline-block bg-white rounded-lg px-4 py-2 border border-slate-200">
                <span className="text-xs text-slate-500">{t('priceOracle.marketRate')}</span>
                <p className="text-lg font-bold text-slate-900">{t('priceOracle.currency')} {result.market_rate}/kg</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
