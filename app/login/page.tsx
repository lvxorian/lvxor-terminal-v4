'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '@/app/data/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) { setError('Vyplň přihlašovací údaje.'); return; }

    setBusy(true);
    setError('');

    setTimeout(() => {
      if (login(username, password)) {
        router.replace('/');
      } else {
        setError('Nesprávné jméno nebo heslo.');
        setBusy(false);
      }
    }, 400);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.06), transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30">
            <svg viewBox="0 0 22 28" fill="none" className="h-6 w-5">
              <path d="M12.5 2L3 15h7.5L8 26l11-14H11.5L13 2z" fill="white" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">LVXOR <span className="text-indigo-400">DESIGN</span></h1>
          <p className="mt-1 text-xs font-medium tracking-[0.15em] text-indigo-400/60 uppercase">TERMINAL</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wide">Uživatel</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wide">Heslo</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-900/20 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 disabled:opacity-60 active:scale-[0.97]"
          >
            <LogIn className="h-4 w-4" />
            {busy ? 'Přihlašuji...' : 'Přihlásit se'}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-600">
          Interní CRM studio LVXOR DESIGN
        </p>
      </div>
    </div>
  );
}
