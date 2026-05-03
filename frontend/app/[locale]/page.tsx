import HomeContent from '@/components/home/HomeContent';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = await Promise.resolve(params);
  return <HomeContent locale={locale} />;
}
