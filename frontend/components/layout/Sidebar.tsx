'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  Stethoscope,
  TrendingUp,
  Leaf,
  ShieldCheck,
  MessageCircle,
  Sprout,
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  'crop-doctor': <Stethoscope className="w-5 h-5" />,
  'price-oracle': <TrendingUp className="w-5 h-5" />,
  'soil-advisor': <Leaf className="w-5 h-5" />,
  'deal-guardian': <ShieldCheck className="w-5 h-5" />,
  council: <MessageCircle className="w-5 h-5" />,
};

const colorMap: Record<string, string> = {
  dashboard: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/20',
  'crop-doctor': 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/20',
  'price-oracle': 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20',
  'soil-advisor': 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20',
  'deal-guardian': 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20',
  council: 'from-primary-500/20 to-emerald-500/20 text-primary-400 border-primary-500/20',
};

export default function Sidebar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { user } = useAuth();

  const t = (key: string) => {
    const messages: any = {
      en: {
        dashboard: 'Dashboard',
        'crop-doctor': 'Crop Doctor',
        'price-oracle': 'Price Oracle',
        'soil-advisor': 'Soil Advisor',
        'deal-guardian': 'Deal Guardian',
        council: 'Kisan Council',
      },
      ur: {
        dashboard: 'ڈیش بورڈ',
        'crop-doctor': 'فصل ڈاکٹر',
        'price-oracle': 'قیمت کا جانچ',
        'soil-advisor': 'مٹی کے مشیر',
        'deal-guardian': 'سودے کا محافظ',
        council: 'کسان کونسل',
      },
    };
    return messages[locale]?.[key] || messages['en']?.[key] || key;
  };

  const items = [
    { key: 'dashboard', href: `/${locale}/dashboard` },
    { key: 'crop-doctor', href: `/${locale}/dashboard/crop-doctor` },
    { key: 'price-oracle', href: `/${locale}/dashboard/price-oracle` },
    { key: 'soil-advisor', href: `/${locale}/dashboard/soil-advisor` },
    { key: 'deal-guardian', href: `/${locale}/dashboard/deal-guardian` },
    { key: 'council', href: `/${locale}/dashboard/council` },
  ];

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 glass border-r border-white/5 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/20 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-white">{user.name}</p>
            <p className="text-xs text-slate-500">{user.district} &middot; {user.primary_crop}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item, index) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  active
                    ? `bg-gradient-to-r ${colorMap[item.key]} border`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`}>
                  {iconMap[item.key]}
                </span>
                {t(item.key)}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <p className="text-xs text-slate-500 mb-1">AI Powered</p>
          <p className="text-xs text-slate-400">Kisaan Ka Digital Muhaafiz</p>
        </div>
      </div>
    </aside>
  );
}
