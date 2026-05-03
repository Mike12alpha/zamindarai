'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-500" />
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer text-slate-300 hover:border-white/20 transition-colors"
      >
        <option value="en" className="bg-black text-white">English</option>
        <option value="ur" className="bg-black text-white">اردو</option>
      </select>
    </div>
  );
}
