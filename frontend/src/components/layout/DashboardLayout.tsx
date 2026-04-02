'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { isAuthenticated, sidebarOpen } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-xc-black flex">
      <Sidebar />
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        sidebarOpen ? 'ml-60' : 'ml-16'
      )}>
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
