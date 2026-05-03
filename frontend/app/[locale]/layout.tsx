import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import I18nProvider from '@/components/I18nProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

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
            <AuthProvider>
              <Navbar />
              {children}
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
