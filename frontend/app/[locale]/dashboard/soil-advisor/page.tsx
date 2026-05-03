'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Loader2 } from 'lucide-react';
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
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/soil/advise', {
        method: 'POST',
        body: JSON.stringify({ ...form, language: locale }),
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
          <Leaf className="w-7 h-7 text-emerald-500" /> {t('soilAdvisor.title')}
        </h1>
        <p className="text-slate-500">{t('soilAdvisor.subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('soilAdvisor.currentCrop')}</label>
            <ComboInput
              name="current_crop"
              value={form.current_crop}
              onChange={handleChange}
              options={CROPS}
              listId="soil-current-crops"
              placeholder={t('soilAdvisor.currentCrop')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('soilAdvisor.previousCrop')}</label>
            <ComboInput
              name="previous_crop"
              value={form.previous_crop}
              onChange={handleChange}
              options={PREVIOUS_CROP_OPTIONS}
              listId="soil-previous-crops"
              placeholder={t('soilAdvisor.previousCrop')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('soilAdvisor.soilType')}</label>
            <ComboInput
              name="soil_type"
              value={form.soil_type}
              onChange={handleChange}
              options={SOIL_TYPES}
              listId="soil-types"
              placeholder={t('soilAdvisor.soilType')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('soilAdvisor.question')}</label>
            <div className="flex gap-2">
              <input name="question" value={form.question} onChange={handleChange}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <VoiceInputButton
                locale={locale}
                onResult={(text) => setForm((prev) => ({ ...prev, question: prev.question + (prev.question ? ' ' : '') + text }))}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
          {t('soilAdvisor.getAdvice')}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200"
          >
            <h2 className="text-lg font-bold text-emerald-800 mb-3">{t('soilAdvisor.advice')}</h2>
            <div className="whitespace-pre-wrap text-emerald-900 text-sm leading-relaxed">
              {result.advice}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
