'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useT } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { Sprout, Menu, X, LogOut, User, Sparkles, LayoutDashboard, Stethoscope, TrendingUp, Leaf, ShieldCheck, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const _t = useT();
  const t = (key: string) => {
    const map: Record<string, string> = {
      dashboard: 'nav.dashboard',
      council: 'nav.council',
      login: 'nav.login',
      logout: 'nav.logout',
      profile: 'nav.profile',
    };
    return _t(map[key] || key);
  };

  const links = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: `/${locale}/dashboard/crop-doctor`, label: t('cropDoctor'), icon: <Stethoscope className="w-4 h-4" /> },
    { href: `/${locale}/dashboard/price-oracle`, label: t('priceOracle'), icon: <TrendingUp className="w-4 h-4" /> },
    { href: `/${locale}/dashboard/soil-advisor`, label: t('soilAdvisor'), icon: <Leaf className="w-4 h-4" /> },
    { href: `/${locale}/dashboard/deal-guardian`, label: t('dealGuardian'), icon: <ShieldCheck className="w-4 h-4" /> },
    { href: `/${locale}/dashboard/council`, label: t('council'), icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-lg group-hover:bg-primary-500/30 transition-all duration-500" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold gradient-text-animated tracking-tight">ZamindarAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {user && links.map((l) => (
              <Link 
                key={l.href} 
                href={l.href} 
                className="group relative text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300 py-1"
              >
                {l.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <User className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-sm text-slate-300 font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                href={`/${locale}/login`} 
                className="relative group overflow-hidden bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-500 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('login')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors" 
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {user && links.map((l) => (
                <Link 
                  key={l.href} 
                  href={l.href} 
                  className="flex items-center gap-3 text-slate-300 hover:text-white font-medium py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors" 
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="text-slate-500">{l.icon}</span>
                  {l.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 py-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              {user && (
                <button 
                  onClick={() => { logout(); setMobileOpen(false); }} 
                  className="flex items-center gap-2 text-red-400 font-medium py-2"
                >
                  <LogOut className="w-4 h-4" /> {t('logout')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
