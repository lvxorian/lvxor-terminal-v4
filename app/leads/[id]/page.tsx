'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { LeadStatus } from '@/app/types';
import { useLeads } from '@/hooks/useLeads';
import CallActions from '@/components/CallActions';
import ScriptPanel from '@/components/ScriptPanel';
import CelebrationScreen from '@/components/CelebrationScreen';

export default function CallPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { leads, getLeadById, updateStatus } = useLeads();
  const [celebrate, setCelebrate] = useState<'new' | 'follow-up' | null>(null);

  const queue = useMemo(() => {
    const order = [LeadStatus.NEW, LeadStatus.CALLBACK, LeadStatus.NO_ANSWER];
    const sorted = [...leads]
      .filter((l) => order.includes(l.status))
      .sort((a, b) => {
        const ia = order.indexOf(a.status);
        const ib = order.indexOf(b.status);
        if (ia !== ib) return ia - ib;
        return new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
      });
    return sorted;
  }, [leads]);

  const queueIndex = queue.findIndex((l) => l.id === id);
  const newCount = queue.filter((l) => l.status === LeadStatus.NEW).length;

  const currentPhase = queueIndex < newCount ? 'new' : 'follow-up';

  useEffect(() => {
    if (!celebrate && queue.length > 0 && queueIndex === -1) {
      router.replace(`/leads/${queue[0].id}`);
    }
  }, [queue, queueIndex, celebrate, router]);

  const handleStatusChange = useCallback(
    async (status: LeadStatus) => {
      await updateStatus(id, status);

      if (queueIndex === -1) return;

      const remaining = queue.filter((_, i) => i > queueIndex);

      if (remaining.length === 0) {
        setCelebrate(currentPhase);
        return;
      }

      router.push(`/leads/${remaining[0].id}`);
    },
    [id, queue, queueIndex, currentPhase, updateStatus, router],
  );

  function goNext() {
    if (queueIndex < queue.length - 1) {
      router.push(`/leads/${queue[queueIndex + 1].id}`);
    }
  }

  function goPrev() {
    if (queueIndex > 0) {
      router.push(`/leads/${queue[queueIndex - 1].id}`);
    }
  }

  function handleCelebrationContinue() {
    setCelebrate(null);
    const remaining = queue.filter(
      (l) => l.status === LeadStatus.CALLBACK || l.status === LeadStatus.NO_ANSWER,
    );
    if (remaining.length > 0) {
      router.push(`/leads/${remaining[0].id}`);
    } else {
      router.push('/');
    }
  }

  function handleCelebrationDashboard() {
    router.push('/');
  }

  if (celebrate) {
    return (
      <CelebrationScreen
        phase={celebrate}
        onContinue={handleCelebrationContinue}
        onDashboard={handleCelebrationDashboard}
      />
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Žádné leady k volání</h2>
          <p className="mt-2 text-slate-400">Všechny leady jsou zpracované nebo žádné neexistují.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Zpět na Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (queueIndex === -1) {
    return null;
  }

  const lead = queue[queueIndex];

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-4rem)] flex-col gap-2 lg:flex-row min-h-0">
      <div className="flex-1 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm min-h-0">
        <CallActions
          key={lead.id}
          lead={lead}
          phase={currentPhase}
          queueIndex={queueIndex}
          queueLength={queue.length}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={queueIndex > 0}
          hasNext={queueIndex < queue.length - 1}
          onStatusChange={handleStatusChange}
        />
      </div>
      <div className="w-full shrink-0 lg:w-[360px] min-h-0">
        <ScriptPanel />
      </div>
    </div>
  );
}
