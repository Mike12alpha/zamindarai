'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle, Download, Sparkles, FileText } from 'lucide-react';
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('dealGuardian.title')}</h1>
        </div>
        <p className="text-slate-500 ml-[52px]">{t('dealGuardian.subtitle')}</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 p-6 mb-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('dealGuardian.buyerName')}</label>
            <div className="flex gap-2">
              <input name="buyer_name" value={form.buyer_name} onChange={handleChange}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
              <VoiceInputButton locale={locale} onResult={(text) => setField('buyer_name', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('dealGuardian.crop')}</label>
            <div className="flex gap-2">
              <ComboInput name="crop" value={form.crop} onChange={handleChange}
                options={CROPS} listId="deal-crops" placeholder={t('dealGuardian.crop')} />
              <VoiceInputButton locale={locale} onResult={(text) => setField('crop', text)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('dealGuardian.quantity')}</label>
            <ComboInput name="quantity" value={form.quantity} onChange={handleChange}
              options={QUANTITIES} listId="deal-quantities" placeholder={t('dealGuardian.quantity')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('dealGuardian.price')}</label>
            <input name="price_per_kg" type="number" value={form.price_per_kg} onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !form.buyer_name || !form.price_per_kg}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {t('dealGuardian.generate')}
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
              {result.is_fair 
                ? <CheckCircle className="w-6 h-6 text-emerald-400" /> 
                : <AlertTriangle className="w-6 h-6 text-red-400" />
              }
              <h2 className={`text-lg font-bold ${result.is_fair ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.is_fair ? t('dealGuardian.isFair') : t('dealGuardian.isUnfair')}
              </h2>
            </div>
            {result.warnings?.length > 0 && (
              <div className="mb-5 space-y-2">
                {result.warnings.map((w: string, i: number) => (
                  <p key={i} className="text-sm text-red-400 bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/10">{w}</p>
                ))}
              </div>
            )}
            <div className="glass rounded-xl p-5 border border-white/5 mb-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                {t('dealGuardian.contract')}
              </h3>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{result.contract_text}</pre>
            </div>
            {result.pdf_url && (
              <a href={`/api/${result.pdf_url}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                <Download className="w-4 h-4" /> {t('dealGuardian.download')}
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
