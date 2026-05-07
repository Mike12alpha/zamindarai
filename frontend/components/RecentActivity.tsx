'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, TrendingUp, ShieldCheck, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useT } from '@/components/I18nProvider';

interface Activity {
  type: 'diagnosis' | 'price_check' | 'contract';
  title: string;
  detail: string;
  created_at: string;
}

const iconMap = {
  diagnosis: <Stethoscope className="w-4 h-4 text-rose-400" />,
  price_check: <TrendingUp className="w-4 h-4 text-amber-400" />,
  contract: <ShieldCheck className="w-4 h-4 text-blue-400" />,
};

const colorMap = {
  diagnosis: 'bg-rose-500/10 border-rose-500/20',
  price_check: 'bg-amber-500/10 border-amber-500/20',
  contract: 'bg-blue-500/10 border-blue-500/20',
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function RecentActivity() {
  const t = useT();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/impact/recent')
      .then((data) => setActivities(data.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-400">{t('dashboard.recentActivity')}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-400">{t('dashboard.recentActivity')}</h3>
      </div>
      <div className="space-y-2">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className={`flex items-center gap-3 p-3 rounded-xl border ${colorMap[activity.type]} transition-colors hover:bg-white/5`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              {iconMap[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{activity.title}</p>
              <p className="text-xs text-slate-500 truncate">{activity.detail}</p>
            </div>
            <span className="text-xs text-slate-600 shrink-0">{formatTimeAgo(activity.created_at)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
