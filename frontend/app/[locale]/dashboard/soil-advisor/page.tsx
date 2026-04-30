'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Loader2 } from 'lucide-react';

export default function SoilAdvisorPage() {
  const t = useT();
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
        body: JSON.stringify(form),
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
            <input name="current_crop" value={form.current_crop} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('soilAdvisor.previousCrop')}</label>
            <select name="previous_crop" value={form.previous_crop} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              {['None', 'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('soilAdvisor.soilType')}</label>
            <select name="soil_type" value={form.soil_type} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              {['Loamy', 'Sandy', 'Clay', 'Silty', 'Unknown'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('soilAdvisor.question')}</label>
            <input name="question" value={form.question} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
