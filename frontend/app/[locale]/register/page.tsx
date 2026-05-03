'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { useT } from '@/components/I18nProvider';
import { Sprout, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ComboInput from '@/components/ComboInput';
import { DISTRICTS, CROPS } from '@/lib/options';

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
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Account', fields: ['name', 'email', 'password'] },
    { label: 'Farm', fields: ['phone', 'district', 'farm_size_acres', 'primary_crop'] },
  ];
  const [activeStep, setActiveStep] = useState(0);

  const isStepValid = (step: number) => {
    if (step === 0) return form.name && form.email && form.password.length >= 6;
    return true;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl animate-pulse-glow" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border border-primary-400/30">
              <Sprout className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.registerTitle')}</h1>
          <p className="text-slate-500">Join the future of farming</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  i <= activeStep 
                    ? 'bg-primary-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}>
                  {i < activeStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs ${i <= activeStep ? 'text-primary-400' : 'text-slate-600'}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 rounded-full transition-colors duration-300 ${
                  i < activeStep ? 'bg-primary-600' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.name')}</label>
                  <input name="name" required value={form.name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.email')}</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.password')}</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.phone')}</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.district')}</label>
                    <ComboInput name="district" value={form.district} onChange={handleChange}
                      options={DISTRICTS} listId="district-list" placeholder={t('auth.district')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.farmSize')}</label>
                    <input name="farm_size_acres" type="number" step="0.5" value={form.farm_size_acres} onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 input-glow transition-all duration-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.primaryCrop')}</label>
                  <ComboInput name="primary_crop" value={form.primary_crop} onChange={handleChange}
                    options={CROPS} listId="crop-list" placeholder={t('auth.primaryCrop')} />
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              {activeStep > 0 && (
                <button type="button" onClick={() => setActiveStep(0)}
                  className="flex-1 py-3.5 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 transition-all duration-300">
                  Back
                </button>
              )}
              {activeStep < steps.length - 1 ? (
                <button type="button" onClick={() => isStepValid(0) && setActiveStep(1)}
                  disabled={!isStepValid(0)}
                  className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-500 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-500 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('auth.registerBtn')}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 relative z-10">
            {t('auth.hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-primary-400 font-medium hover:text-primary-300 transition-colors">
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
