'use client';

import { useEffect, useMemo } from 'react';
import { PartyPopper, ArrowRight, LayoutDashboard } from 'lucide-react';
import { LeadStatus } from '@/app/types';

const COLORS = ['#34d399', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

export default function CelebrationScreen({
  phase,
  onContinue,
  onDashboard,
}: {
  phase: 'new' | 'follow-up';
  onContinue: () => void;
  onDashboard: () => void;
}) {
  const pieces = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
    }));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') onContinue();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onContinue]);

  const isNewPhase = phase === 'new';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      <div className="celebration-pop flex flex-col items-center gap-6 text-center max-w-md px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 celebration-glow">
          <PartyPopper className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white">
          {isNewPhase
            ? 'Gratulujeme!'
            : 'Skvělá práce!'}
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          {isNewPhase
            ? 'Všechny nové leady jsou obvolány!'
            : 'Všechny follow-up leady jsou hotové!'}
        </p>
        <p className="text-sm text-slate-500">
          {isNewPhase
            ? 'Můžeš pokračovat na follow-up leady (zavolat znovu / nezvedá) nebo se vrátit na Dashboard.'
            : 'Všechny leady v queue jsou zpracovány. Vrať se na Dashboard pro přehled.'}
        </p>

        <div className="flex flex-col gap-2 w-full mt-2">
          {isNewPhase && (
            <button
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:from-emerald-500 hover:to-green-500 hover:shadow-emerald-500/40 active:scale-[0.97]"
            >
              <ArrowRight className="h-5 w-5" />
              Pokračovat na follow-up
            </button>
          )}
          <button
            onClick={onDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3 text-base font-medium text-slate-200 transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
          >
            <LayoutDashboard className="h-5 w-5" />
            Zpět na Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
