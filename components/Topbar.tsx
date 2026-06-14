'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Phone, LayoutDashboard, PhoneIncoming, Plus, LogOut } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { logout } from '@/app/data/auth';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads/generate', label: 'Nový', icon: Plus },
];

export default function Topbar() {
  const path = usePathname();
  const router = useRouter();
  const { getFirstLeadId } = useLeads();
  const firstLeadId = getFirstLeadId();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-indigo-500/40">
            <svg
              className="absolute inset-0 h-full w-full opacity-0 transition-all duration-700 group-hover:opacity-30"
              viewBox="0 0 40 40"
            >
              <circle
                cx="20" cy="20" r="18" fill="none" stroke="white" strokeWidth="0.4"
                className="origin-center animate-logo-spin"
              />
              <circle
                cx="20" cy="20" r="14" fill="none" stroke="white" strokeWidth="0.25"
                className="origin-center animate-logo-spin-reverse"
              />
            </svg>
            <div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-shimmer"
              style={{ transform: 'translateX(-100%) skewX(-15deg)' }}
            />
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 opacity-30 blur-xl transition-all duration-700 group-hover:opacity-70 group-hover:blur-2xl" />
            <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <svg viewBox="0 0 22 28" fill="none" className="relative h-4 w-3.5 sm:h-5.5 sm:w-4.5 z-10">
              <path
                d="M12.5 2L3 15h7.5L8 26l11-14H11.5L13 2z"
                fill="white"
                className="transition-all duration-500 group-hover:scale-110 origin-center"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold leading-tight tracking-[0.02em] text-white">
              LVXOR <span className="text-indigo-400">DESIGN</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium leading-tight tracking-[0.15em] text-indigo-400/70 uppercase">
              TERMINAL
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none ml-auto mr-1 sm:mr-0">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg border border-indigo-500/20 shadow-inner shadow-indigo-500/5" />
                )}
                <Icon className="relative h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="relative hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {firstLeadId ? (
            <Link
              href={`/leads/${firstLeadId}`}
              className={`relative flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                path.startsWith('/leads/') && path !== '/leads/generate'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {(path.startsWith('/leads/') && path !== '/leads/generate') && (
                <span className="absolute inset-0 rounded-lg border border-emerald-500/20 shadow-inner shadow-emerald-500/5" />
              )}
              <Phone className="relative h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="relative hidden sm:inline">Call Mode</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 sm:gap-2 rounded-lg bg-slate-800/50 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">
              <PhoneIncoming className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Call Mode</span>
            </span>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-slate-600 transition-all duration-200 hover:bg-slate-800/60 hover:text-red-400"
            title="Odhlásit se"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
