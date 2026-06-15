'use client';

import { useState } from 'react';
import {
  Phone,
  MapPin,
  Building2,
  Save,
  PhoneOff,
  Clock,
  CalendarCheck,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ArrowLeftFromLine,
  ChevronsRight,
  SkipForward,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useLeads } from '@/hooks/useLeads';
import StatusBadge from './StatusBadge';

const statusButtons = [
  {
    status: LeadStatus.NO_ANSWER,
    label: 'Nezvedá',
    icon: PhoneOff,
    classes: 'bg-yellow-600/90 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/15',
  },
  {
    status: LeadStatus.CALLBACK,
    label: 'Zavolat znovu',
    icon: Clock,
    classes: 'bg-blue-600/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/15',
  },
  {
    status: LeadStatus.MEETING,
    label: 'Schůzka',
    icon: CalendarCheck,
    classes: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-600/15',
  },
  {
    status: LeadStatus.REJECTED,
    label: 'Odmítnuto',
    icon: XCircle,
    classes: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/15',
  },
];

const PHASE_LABELS: Record<string, string> = {
  'new': 'Nové leady',
  'follow-up': 'Follow-up',
};

export default function CallActions({
  lead,
  phase,
  queueIndex,
  queueLength,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onStatusChange,
}: {
  lead: Lead;
  phase: 'new' | 'follow-up';
  queueIndex: number;
  queueLength: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onStatusChange: (status: LeadStatus) => void;
}) {
  const router = useRouter();
  const { updateNotes } = useLeads();
  const [notes, setNotes] = useState(lead.notes);
  const [saved, setSaved] = useState(false);

  async function handleSaveNotes() {
    await updateNotes(lead.id, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const remaining = queueLength - queueIndex - 1;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Top bar: phase + navigation */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <ArrowLeftFromLine className="h-3.5 w-3.5" />
            Zpět
          </button>
          <span className="text-slate-700 text-xs">|</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
            <ChevronsRight className="h-3 w-3" />
            {PHASE_LABELS[phase]}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-all duration-200 hover:bg-slate-700/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="min-w-[3rem] text-center text-xs font-medium text-slate-500 tabular-nums">
            {queueIndex + 1}<span className="text-slate-600">/{queueLength}</span>
          </span>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-all duration-200 hover:bg-slate-700/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lead detail card */}
      <div className="shrink-0 rounded-xl border border-slate-800/40 bg-slate-800/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-white leading-tight">{lead.companyName}</h1>
          <StatusBadge status={lead.status} />
        </div>

        <a href={`tel:${lead.phone}`} className="group mt-2 block">
          <span className="phone-number text-3xl font-bold tracking-tight leading-none">
            {lead.phone}
          </span>
        </a>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            {lead.industry}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            {lead.city}
          </span>
        </div>

        <p className="mt-2 text-[11px] text-slate-600 italic">
          {remaining > 0
            ? `${remaining} lead${remaining > 1 ? 'ů' : ''} zbývá v této fázi`
            : 'Poslední lead v této fázi'}
        </p>
      </div>

      {/* Notes */}
      <div className="shrink-0">
        <label htmlFor="notes" className="mb-1 block text-xs font-medium text-slate-400">
          Poznámky k hovoru
        </label>
        <div className="flex gap-2">
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSaved(false);
            }}
            placeholder="Co říkal? Dohodli jste se na něčem?"
            className="h-16 w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 p-2.5 text-xs text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          />
          <button
            onClick={handleSaveNotes}
            className="self-start inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600 active:scale-[0.97] shrink-0"
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? 'Uloženo' : 'Uložit'}
          </button>
        </div>
      </div>

      {/* Action buttons section */}
      <div className="flex-1 min-h-0">
        <p className="mb-1.5 text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Označit výsledek hovoru
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {statusButtons.map(({ status, label, icon: Icon, classes }) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${classes}`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </button>
          ))}
        </div>

        {/* Skip */}
        {hasNext && (
          <button
            onClick={onNext}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700/50 px-4 py-2 text-xs font-medium text-slate-500 transition-all duration-200 hover:border-slate-600/50 hover:text-slate-300 active:scale-[0.97]"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Přeskočit — volat později
          </button>
        )}
      </div>
    </div>
  );
}
