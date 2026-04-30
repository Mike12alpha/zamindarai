'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Sprout, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = (key: string) => {
    const messages: any = {
      en: { dashboard: 'Dashboard', council: 'Kisan Council', login: 'Login', logout: 'Logout', profile: 'Profile' },
      ur: { dashboard: 'ڈیش بورڈ', council: 'کسان کونسل', login: 'لاگ ان', logout: 'لاگ آؤٹ', profile: 'پروفائل' },
    };
    return messages[locale]?.[key] || messages['en']?.[key] || key;
  };

  const links = [
    { href: `/${locale}/dashboard`, label: t('dashboard') },
    { href: `/${locale}/dashboard/council`, label: t('council') },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Sprout className="w-7 h-7 text-primary-600" />
            <span className="text-xl font-bold text-slate-800">ZamindarAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user && links.map((l) => (
              <Link key={l.href} href={l.href} className="text-slate-600 hover:text-primary-600 transition-colors font-medium">
                {l.label}
              </Link>
            ))}
            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <User className="w-4 h-4" /> {user.name}
                </span>
                <button onClick={logout} className="text-slate-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href={`/${locale}/login`} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                {t('login')}
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          {user && links.map((l) => (
            <Link key={l.href} href={l.href} className="block text-slate-600 font-medium" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <LanguageSwitcher />
          </div>
          {user && (
            <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 text-red-600 font-medium">
              <LogOut className="w-4 h-4" /> {t('logout')}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
