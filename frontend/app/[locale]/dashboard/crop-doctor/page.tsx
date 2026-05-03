'use client';

import { useState, useRef } from 'react';
import { apiUpload } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Stethoscope, Loader2, ImageIcon, X, Scan, Sparkles } from 'lucide-react';
import VoiceInputButton from '@/components/VoiceInputButton';
import ComboInput from '@/components/ComboInput';
import { CROPS } from '@/lib/options';

export default function CropDoctorPage() {
  const t = useT();
  const locale = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState('Wheat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const handleDiagnose = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('crop_type', cropType);
    formData.append('language', locale);
    setError('');
    try {
      const data = await apiUpload('/diagnoses/', formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('cropDoctor.title')}</h1>
        </div>
        <p className="text-slate-500 ml-[52px]">{t('cropDoctor.subtitle')}</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 p-6 mb-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('cropDoctor.cropType')}</label>
            <div className="flex gap-2 mb-5">
              <ComboInput
                name="cropType"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                options={CROPS}
                listId="crop-doctor-crops"
                placeholder={t('cropDoctor.cropType')}
              />
              <VoiceInputButton
                locale={locale}
                onResult={(text) => {
                  const match = CROPS.find(c => c.toLowerCase() === text.toLowerCase() || (t(`cropDoctor.${c.toLowerCase()}`) || '').toLowerCase() === text.toLowerCase());
                  if (match) setCropType(match);
                }}
                disabled={loading}
              />
            </div>

            <label className="block text-sm font-medium text-slate-300 mb-2">{t('cropDoctor.upload')}</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/40 hover:bg-white/[0.02] transition-all duration-300 group relative overflow-hidden"
            >
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="preview" className="max-h-48 rounded-lg" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="absolute -top-2 -right-2 bg-black rounded-full p-1 shadow-lg border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Scan className="w-6 h-6 text-slate-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-500">{t('cropDoctor.upload')}</p>
                  <p className="text-xs text-slate-600 mt-1">Click or drag to upload</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}
            <button
              onClick={handleDiagnose}
              disabled={!file || loading}
              className="w-full mt-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-rose-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(225,29,72,0.2)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {t('cropDoctor.diagnose')}
            </button>
          </div>

          <div>
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="glass rounded-xl p-5 border border-white/5">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Scan className="w-4 h-4 text-primary-400" />
                      {t('cropDoctor.result')}
                    </h3>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result.vision_analysis}</p>
                  </div>
                  <div className="glass rounded-xl p-5 border border-rose-500/10 bg-rose-500/[0.03]">
                    <h3 className="font-semibold text-rose-400 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('cropDoctor.treatment')}
                    </h3>
                    <p className="text-sm text-rose-200/80 whitespace-pre-wrap leading-relaxed">{result.treatment}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!result && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <p>{t('cropDoctor.noImage')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
