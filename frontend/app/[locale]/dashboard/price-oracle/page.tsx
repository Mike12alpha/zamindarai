'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Loader2, CheckCircle, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react';
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('priceOracle.title')}</h1>
        </div>
        <p className="text-slate-500 ml-[52px]">{t('priceOracle.subtitle')}</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 p-6 mb-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('priceOracle.crop')}</label>
            <div className="flex gap-2">
              <ComboInput name="crop" value={form.crop} onChange={handleChange}
                options={CROPS} listId="price-crops" placeholder={t('priceOracle.crop')} />
              <VoiceInputButton locale={locale} onResult={(text) => setField('crop', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('priceOracle.quantity')}</label>
            <ComboInput name="quantity" value={form.quantity} onChange={handleChange}
              options={QUANTITIES} listId="price-quantities" placeholder={t('priceOracle.quantity')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('priceOracle.location')}</label>
            <div className="flex gap-2">
              <ComboInput name="location" value={form.location} onChange={handleChange}
                options={DISTRICTS} listId="price-districts" placeholder={t('priceOracle.location')} />
              <VoiceInputButton locale={locale} onResult={(text) => setField('location', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('priceOracle.offeredPrice')}</label>
            <input name="offered_price" type="number" value={form.offered_price} onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
          </div>
        </div>
        <button onClick={handleCheck} disabled={loading || !form.offered_price}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-500 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover:shadow-[0_0_30px_rgba(217,119,6,0.2)]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {t('priceOracle.check')}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border relative overflow-hidden ${
              result.is_fair 
                ? 'bg-emerald-500/[0.03] border-emerald-500/10' 
                : 'bg-red-500/[0.03] border-red-500/10'
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              {result.is_fair ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
              <h2 className={`text-lg font-bold ${result.is_fair ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.is_fair ? t('priceOracle.fair') : t('priceOracle.unfair')}
              </h2>
            </div>
            <div className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed mb-5">
              {result.analysis}
            </div>
            {result.market_rate && (
              <div className="inline-block glass rounded-xl px-5 py-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-primary-400" />
                  <span className="text-xs text-slate-500">{t('priceOracle.marketRate')}</span>
                </div>
                <p className="text-xl font-bold text-white">{t('priceOracle.currency')} {result.market_rate}/kg</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
