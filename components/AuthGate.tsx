'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated } from '@/app/data/auth';
import Topbar from './Topbar';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (path === '/login') {
      setAuthed(true);
    } else if (isAuthenticated()) {
      setAuthed(true);
    } else {
      router.replace('/login');
    }
    setLoading(false);
  }, [path, router]);

  if (loading) return null;

  if (path === '/login') return <>{children}</>;

  if (!authed) return null;

  return (
    <>
      <Topbar />
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
