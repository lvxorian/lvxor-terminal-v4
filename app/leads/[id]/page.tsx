'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getLeadById, getNextLeadId, getPrevLeadId, getLeadPosition } from '@/app/data/leads';
import CallActions from '@/components/CallActions';
import ScriptPanel from '@/components/ScriptPanel';

export default function CallPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const lead = getLeadById(id);
  const nextId = getNextLeadId(id);
  const prevId = getPrevLeadId(id);
  const position = getLeadPosition(id);

  const goPrev = useCallback(() => {
    if (prevId) router.push(`/leads/${prevId}`);
  }, [prevId, router]);

  const goNext = useCallback(() => {
    if (nextId) router.push(`/leads/${nextId}`);
  }, [nextId, router]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goPrev, goNext]);

  if (!lead) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Lead nenalezen</h2>
          <p className="mt-2 text-slate-400">Tento lead neexistuje nebo byl smazán.</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
            <ChevronLeft className="h-4 w-4" />
            Zpět na Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row">
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-sm">
        <CallActions
          key={lead.id}
          lead={lead}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={!!prevId}
          hasNext={!!nextId}
          position={position}
        />
      </div>
      <div className="w-full overflow-y-auto lg:w-[420px]">
        <ScriptPanel />
      </div>
    </div>
  );
}
