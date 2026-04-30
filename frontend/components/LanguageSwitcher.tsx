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
        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        <option value="en">English</option>
        <option value="ur">اردو</option>
      </select>
    </div>
  );
}
