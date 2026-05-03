'use client';

import Link from 'next/link';
import { Sprout, Brain, TrendingUp, ShieldCheck, Leaf, ArrowRight, Zap, Cpu, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeContentProps {
  locale: string;
  t: (key: string) => string;
}

export default function HomeContent({ locale, t }: HomeContentProps) {
  const features = [
    { icon: <Brain className="w-7 h-7" />, title: t('cropDoctor.title'), desc: t('dashboard.cropDoctorDesc'), color: 'from-rose-500 to-pink-600', glow: 'group-hover:shadow-rose-500/20' },
    { icon: <TrendingUp className="w-7 h-7" />, title: t('priceOracle.title'), desc: t('dashboard.priceOracleDesc'), color: 'from-amber-500 to-orange-600', glow: 'group-hover:shadow-amber-500/20' },
    { icon: <Leaf className="w-7 h-7" />, title: t('soilAdvisor.title'), desc: t('dashboard.soilAdvisorDesc'), color: 'from-emerald-500 to-teal-600', glow: 'group-hover:shadow-emerald-500/20' },
    { icon: <ShieldCheck className="w-7 h-7" />, title: t('dealGuardian.title'), desc: t('dashboard.dealGuardianDesc'), color: 'from-blue-500 to-cyan-600', glow: 'group-hover:shadow-blue-500/20' },
  ];

  const stats = [
    { icon: <Globe className="w-5 h-5" />, value: '160+', label: t('stats.districts') },
    { icon: <Cpu className="w-5 h-5" />, value: '99.2%', label: t('stats.accuracy') },
    { icon: <Zap className="w-5 h-5" />, value: '50K+', label: t('stats.farmers') },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px]" />

      {/* Floating elements */}
      <div className="absolute top-32 left-[10%] w-2 h-2 bg-primary-400 rounded-full animate-float opacity-40" />
      <div className="absolute top-48 right-[15%] w-3 h-3 bg-violet-400 rounded-full animate-float-delayed opacity-30" />
      <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-emerald-400 rounded-full animate-float opacity-35" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-slate-300 font-medium">{t('hero.badge')}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-3xl blur-xl animate-pulse-glow" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border border-primary-400/30">
                <Sprout className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="text-white">{t('hero.title').split(' ').slice(0, -2).join(' ')}</span>
            <br />
            <span className="gradient-text-animated">{t('hero.title').split(' ').slice(-2).join(' ')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={`/${locale}/register`}
              className="group relative inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2">
                {t('hero.ctaPrimary')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center gap-2 glass text-slate-300 px-8 py-4 rounded-2xl font-semibold text-lg hover:text-white hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-20"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center border border-white/5 hover:border-white/10 transition-colors">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 mb-3">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">AI-Powered Tools</h2>
            <p className="text-slate-400">Cutting-edge technology at your fingertips</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="group"
              >
                <div className={`glass rounded-2xl p-6 border border-white/5 card-hover ${f.glow} relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-20 text-center"
        >
          <div className="glass rounded-3xl p-10 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-violet-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your farming?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join thousands of Pakistani farmers using AI to protect their crops and secure better deals.</p>
              <Link
                href={`/${locale}/register`}
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-2xl font-semibold hover:bg-slate-200 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {t('hero.ctaPrimary')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
