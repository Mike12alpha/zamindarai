'use client';

import { useState, useRef } from 'react';
import { apiUpload } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Stethoscope, Loader2, ImageIcon, X } from 'lucide-react';
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
    try {
      const data = await apiUpload('/diagnoses/', formData);
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
          <Stethoscope className="w-7 h-7 text-rose-500" /> {t('cropDoctor.title')}
        </h1>
        <p className="text-slate-500">{t('cropDoctor.subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('cropDoctor.cropType')}</label>
            <div className="flex gap-2 mb-4">
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

            <label className="block text-sm font-medium text-slate-700 mb-2">{t('cropDoctor.upload')}</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="preview" className="max-h-48 rounded-lg" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">{t('cropDoctor.upload')}</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <button
              onClick={handleDiagnose}
              disabled={!file || loading}
              className="w-full mt-4 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
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
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h3 className="font-semibold text-slate-900 mb-2">{t('cropDoctor.result')}</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.vision_analysis}</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                    <h3 className="font-semibold text-rose-800 mb-2">{t('cropDoctor.treatment')}</h3>
                    <p className="text-sm text-rose-900 whitespace-pre-wrap">{result.treatment}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!result && (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                {t('cropDoctor.noImage')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
