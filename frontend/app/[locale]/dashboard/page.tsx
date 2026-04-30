'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  TrendingUp,
  Leaf,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

const agents = [
  {
    key: 'cropDoctor',
    href: 'crop-doctor',
    icon: <Stethoscope className="w-6 h-6" />,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    key: 'priceOracle',
    href: 'price-oracle',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    key: 'soilAdvisor',
    href: 'soil-advisor',
    icon: <Leaf className="w-6 h-6" />,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    key: 'dealGuardian',
    href: 'deal-guardian',
    icon: <ShieldCheck className="w-6 h-6" />,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
];

export default function DashboardPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { user, loading } = useAuth();
  const router = useRouter();

  const t = (key: string) => {
    const messages: any = {
      en: {
        welcome: 'Welcome',
        agents: 'Your AI Agents',
        cropDoctorDesc: 'Diagnose crop diseases from photos',
        priceOracleDesc: 'Check fair market prices',
        soilAdvisorDesc: 'Get fertilizer recommendations',
        dealGuardianDesc: 'Generate secure sale contracts',
        ctaPrimary: 'Get Started',
        councilSubtitle: 'Ask anything. Our AI council will summon the right experts.',
      },
      ur: {
        welcome: 'خوش آمدید',
        agents: 'آپ کے اے آئی ایجنٹس',
        cropDoctorDesc: 'تصویر سے فصل کی بیماری کی تشخیص',
        priceOracleDesc: 'منڈی کی درست قیمت جانچیں',
        soilAdvisorDesc: 'کھاد کی سفارشات حاصل کریں',
        dealGuardianDesc: 'محفوظ فروخت کا معاہدہ بنائیں',
        ctaPrimary: 'شروع کریں',
        councilSubtitle: 'کچھ بھی پوچھیں۔ ہمارا اے آئی کونسل درست ماہرین کو بلائے گا۔',
      },
    };
    return messages[locale]?.[key] || messages['en']?.[key] || key;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, router, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {t('welcome')}, {user.name}
        </h1>
        <p className="text-slate-500 mt-1">{t('agents')}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={`/${locale}/dashboard/${agent.href}`}
              className={`block p-5 rounded-2xl border ${agent.color} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                {agent.icon}
                <ArrowRight className="w-4 h-4 opacity-50" />
              </div>
              <h3 className="font-semibold">{t(agent.key)}</h3>
              <p className="text-sm opacity-80 mt-1">{t(`${agent.key}Desc`)}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Kisan Council</h2>
            <p className="text-primary-100 max-w-lg">{t('councilSubtitle')}</p>
          </div>
          <MessageCircle className="w-10 h-10 text-primary-200" />
        </div>
        <Link
          href={`/${locale}/dashboard/council`}
          className="inline-flex items-center gap-2 mt-4 bg-white text-primary-700 px-5 py-2.5 rounded-xl font-medium hover:bg-primary-50 transition-colors"
        >
          {t('ctaPrimary')} <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
