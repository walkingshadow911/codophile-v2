'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  UserCircle,
  Code,
  Wand2
} from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Auth check error', err);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Effects', href: '/admin/dashboard/effects', icon: Wand2 },
    { label: 'Administrators', href: '/admin/dashboard/administrators', icon: Users },
    { label: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-zinc-950 border-r border-white/5 z-50 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
             <Code className="w-6 h-6 text-indigo-500" />
             Codophile
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-zinc-400 hover:text-white rounded-md hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group \${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 \${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-md"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-md bg-white/5">
            <UserCircle className="w-10 h-10 text-indigo-400 bg-indigo-500/10 rounded p-1" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 bg-zinc-950/50 backdrop-blur-md border-b border-white/5 z-30 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-sm font-medium text-zinc-300 capitalize hidden sm:block">
              {pathname.split('/').pop() || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Admin Workspace
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
