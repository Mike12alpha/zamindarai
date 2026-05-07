'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Loader2, Sparkles, Sprout } from 'lucide-react';
import VoiceInputButton from '@/components/VoiceInputButton';
import ComboInput from '@/components/ComboInput';
import { CROPS, SOIL_TYPES } from '@/lib/options';

const PREVIOUS_CROP_OPTIONS = ['None', ...CROPS];

export default function SoilAdvisorPage() {
  const t = useT();
  const locale = useLocale();
  const [form, setForm] = useState({
    current_crop: 'Wheat',
    previous_crop: 'None',
    soil_type: 'Loamy',
    location: 'Lahore',
    question: 'What fertilizer should I use for wheat?',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/soil/advise', {
        method: 'POST',
        body: JSON.stringify({ ...form, language: locale }),
      });
      setResult(data);
      toast.success(t('soilAdvisor.advice'), { description: `Recommendations for ${form.current_crop}` });
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('soilAdvisor.title')}</h1>
        </div>
        <p className="text-slate-500 ml-[52px]">{t('soilAdvisor.subtitle')}</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 p-6 mb-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('soilAdvisor.currentCrop')}</label>
            <ComboInput name="current_crop" value={form.current_crop} onChange={handleChange}
              options={CROPS} listId="soil-current-crops" placeholder={t('soilAdvisor.currentCrop')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('soilAdvisor.previousCrop')}</label>
            <ComboInput name="previous_crop" value={form.previous_crop} onChange={handleChange}
              options={PREVIOUS_CROP_OPTIONS} listId="soil-previous-crops" placeholder={t('soilAdvisor.previousCrop')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('soilAdvisor.soilType')}</label>
            <ComboInput name="soil_type" value={form.soil_type} onChange={handleChange}
              options={SOIL_TYPES} listId="soil-types" placeholder={t('soilAdvisor.soilType')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('soilAdvisor.question')}</label>
            <div className="flex gap-2">
              <input name="question" value={form.question} onChange={handleChange}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
              <VoiceInputButton
                locale={locale}
                onResult={(text) => setForm((prev) => ({ ...prev, question: prev.question + (prev.question ? ' ' : '') + text }))}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        )}
        <button onClick={handleSubmit} disabled={loading}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {t('soilAdvisor.getAdvice')}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-emerald-500/10 bg-emerald-500/[0.02] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-emerald-400">{t('soilAdvisor.advice')}</h2>
              </div>
              <div className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                {result.advice}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
