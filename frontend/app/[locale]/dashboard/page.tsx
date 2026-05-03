'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useT, useLocale } from '@/components/I18nProvider';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  TrendingUp,
  Leaf,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Activity,
} from 'lucide-react';

const agents = [
  {
    key: 'cropDoctor',
    href: 'crop-doctor',
    icon: <Stethoscope className="w-6 h-6" />,
    gradient: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/20',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/5',
  },
  {
    key: 'priceOracle',
    href: 'price-oracle',
    icon: <TrendingUp className="w-6 h-6" />,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
  },
  {
    key: 'soilAdvisor',
    href: 'soil-advisor',
    icon: <Leaf className="w-6 h-6" />,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
  {
    key: 'dealGuardian',
    href: 'deal-guardian',
    icon: <ShieldCheck className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/20',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
];

export default function DashboardPage() {
  const locale = useLocale();
  const t = useT();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, router, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t('dashboard.welcome')}, <span className="gradient-text">{user.name}</span>
            </h1>
          </div>
        </div>
        <p className="text-slate-500 ml-[52px]">{t('dashboard.agents')}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={`/${locale}/dashboard/${agent.href}`}
              className={`group block glass rounded-2xl border ${agent.border} p-6 card-hover relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${agent.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-15 transition-opacity duration-500`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white shadow-lg`}>
                  {agent.icon}
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-all duration-300 group-hover:translate-x-1" />
              </div>
              <h3 className="font-semibold text-white mb-1">{t(`nav.${agent.key}`)}</h3>
              <p className="text-sm text-slate-500">{t(`dashboard.${agent.key}Desc`)}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6 border border-primary-500/10 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-emerald-500/5" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-bold text-white">{t('dashboard.councilTitle')}</h2>
            </div>
            <p className="text-slate-400 max-w-lg text-sm leading-relaxed">{t('dashboard.councilSubtitle')}</p>
          </div>
          <div className="hidden sm:block w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary-400" />
          </div>
        </div>
        <Link
          href={`/${locale}/dashboard/council`}
          className="inline-flex items-center gap-2 mt-5 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
        >
          {t('hero.ctaPrimary')} <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl border border-white/5 p-6 relative overflow-hidden"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">{t('dashboard.whatsappTitle')}</h2>
            <p className="text-slate-500 text-sm mb-4">{t('dashboard.whatsappDesc')}</p>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium">
              <span>{t('dashboard.whatsappNumber')}:</span>
              <span className="font-mono font-semibold">+92-300-XXXXXXX</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
