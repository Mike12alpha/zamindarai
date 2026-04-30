import Link from 'next/link';
import { Sprout, Brain, TrendingUp, ShieldCheck, Leaf, ArrowRight } from 'lucide-react';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = await Promise.resolve(params);

  const t = (key: string) => {
    const messages: any = {
      en: {
        'hero.title': 'Kisaan Ka Digital Muhaafiz',
        'hero.subtitle': 'AI-powered agricultural protection for Pakistani farmers',
        'hero.ctaPrimary': 'Get Started',
        'hero.ctaSecondary': 'Learn More',
        'dashboard.cropDoctorDesc': 'Diagnose crop diseases from photos',
        'dashboard.priceOracleDesc': 'Check fair market prices',
        'dashboard.soilAdvisorDesc': 'Get fertilizer recommendations',
        'dashboard.dealGuardianDesc': 'Generate secure sale contracts',
        'nav.login': 'Login',
      },
      ur: {
        'hero.title': 'کسان کا ڈیجیٹل محافظ',
        'hero.subtitle': 'پاکستانی کسانوں کے لیے اے آئی پر مبنی زرعی تحفظ',
        'hero.ctaPrimary': 'شروع کریں',
        'hero.ctaSecondary': 'مزید جانیں',
        'dashboard.cropDoctorDesc': 'تصویر سے فصل کی بیماری کی تشخیص',
        'dashboard.priceOracleDesc': 'منڈی کی درست قیمت جانچیں',
        'dashboard.soilAdvisorDesc': 'کھاد کی سفارشات حاصل کریں',
        'dashboard.dealGuardianDesc': 'محفوظ فروخت کا معاہدہ بنائیں',
        'nav.login': 'لاگ ان',
      }
    };
    return messages[locale]?.[key] || messages['en']?.[key] || key;
  };

  const features = [
    { icon: <Brain className="w-8 h-8 text-primary-600" />, title: 'Crop Doctor', desc: t('dashboard.cropDoctorDesc') },
    { icon: <TrendingUp className="w-8 h-8 text-primary-600" />, title: 'Price Oracle', desc: t('dashboard.priceOracleDesc') },
    { icon: <Leaf className="w-8 h-8 text-primary-600" />, title: 'Soil Advisor', desc: t('dashboard.soilAdvisorDesc') },
    { icon: <ShieldCheck className="w-8 h-8 text-primary-600" />, title: 'Deal Guardian', desc: t('dashboard.dealGuardianDesc') },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
            <Sprout className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/register`}
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              {t('hero.ctaPrimary')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
