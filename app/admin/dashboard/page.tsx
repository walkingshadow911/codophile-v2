'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, ShieldAlert, Zap, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [statsData, setStatsData] = useState({
    totalAdmins: 0,
    activeSessions: 0,
    securityAlerts: 0,
    operations24h: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { name: 'Total Administrators', value: statsData.totalAdmins.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Active Sessions', value: statsData.activeSessions.toString(), icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
    { name: 'Security Alerts', value: statsData.securityAlerts.toString(), icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
    { name: 'Operations (24h)', value: statsData.operations24h.toString(), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-400 mt-1">Welcome to your administrative command center.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-md flex flex-col hover:bg-zinc-900/80 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-md \${stat.bg} \${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-zinc-400 font-medium text-sm">{stat.name}</h3>
                <p className="text-3xl font-semibold text-white mt-1 tracking-tight">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 lg:col-span-2 p-6 bg-zinc-900/50 border border-white/5 rounded-md h-96 flex items-center justify-center flex-col text-center"
        >
          <Activity className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-xl font-medium text-zinc-300">Activity Chart Placeholder</h3>
          <p className="text-zinc-500 max-w-sm mt-2">
            Detailed analytics and charts will appear here as more administrative actions are performed system-wide.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 p-6 bg-zinc-900/50 border border-white/5 rounded-md h-96 flex flex-col"
        >
          <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-sm bg-indigo-500 shrink-0" />
                <div>
                  <p className="text-sm text-zinc-300">Admin auth refresh</p>
                  <p className="text-xs text-zinc-500 mt-0.5">2 mins ago • System</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
