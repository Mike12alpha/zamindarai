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

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  'crop-doctor': <Stethoscope className="w-5 h-5" />,
  'price-oracle': <TrendingUp className="w-5 h-5" />,
  'soil-advisor': <Leaf className="w-5 h-5" />,
  'deal-guardian': <ShieldCheck className="w-5 h-5" />,
  council: <MessageCircle className="w-5 h-5" />,
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
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-primary-700">
          <Sprout className="w-5 h-5" />
          <span className="font-semibold">{user.name}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{user.district} &middot; {user.primary_crop}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {iconMap[item.key]}
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
