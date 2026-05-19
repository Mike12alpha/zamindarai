import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import I18nProvider from '@/components/I18nProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import QueryProvider from '@/components/QueryProvider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZamindarAI – AI for Pakistani Farmers',
  description: 'AI-powered agricultural protection system for Pakistani farmers. Crop diagnosis, fair prices, soil advice, and contract protection.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={locale === 'ur' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="antialiased min-h-screen transition-colors duration-400">
        <ThemeProvider>
          <I18nProvider messages={messages} locale={locale}>
            <QueryProvider>
              <AuthProvider>
                <Navbar />
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                    },
                  }}
                />
              </AuthProvider>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
