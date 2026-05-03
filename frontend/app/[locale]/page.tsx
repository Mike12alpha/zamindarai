import HomeContent from '@/components/home/HomeContent';

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
        'cropDoctor.title': 'Crop Doctor',
        'priceOracle.title': 'Price Oracle',
        'soilAdvisor.title': 'Soil Advisor',
        'dealGuardian.title': 'Deal Guardian',
        'hero.badge': 'Next-Gen AI for Farmers',
        'stats.farmers': 'Farmers Protected',
        'stats.accuracy': 'AI Accuracy',
        'stats.districts': 'Districts Covered',
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
        'cropDoctor.title': 'فصل ڈاکٹر',
        'priceOracle.title': 'قیمت کا جانچ',
        'soilAdvisor.title': 'مٹی کے مشیر',
        'dealGuardian.title': 'سودے کا محافظ',
        'hero.badge': 'کسانوں کے لیے نئی نسل کا اے آئی',
        'stats.farmers': 'کسان محفوظ',
        'stats.accuracy': 'اے آئی درستگی',
        'stats.districts': 'اضلاع کا احاطہ',
      }
    };
    return messages[locale]?.[key] || messages['en']?.[key] || key;
  };

  return <HomeContent locale={locale} t={t} />;
}
