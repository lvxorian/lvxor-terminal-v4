'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  MapPin,
  Building2,
  Save,
  ArrowLeft,
  PhoneOff,
  Clock,
  CalendarCheck,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ArrowLeftFromLine,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/app/types';
import { useLeads } from '@/hooks/useLeads';

const statusButtons = [
  {
    status: LeadStatus.NO_ANSWER,
    label: 'Nezvedá',
    icon: PhoneOff,
    classes: 'bg-yellow-600/90 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/20',
  },
  {
    status: LeadStatus.CALLBACK,
    label: 'Zavolat znovu',
    icon: Clock,
    classes: 'bg-blue-600/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20',
  },
  {
    status: LeadStatus.MEETING,
    label: 'Schůzka',
    icon: CalendarCheck,
    classes: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-green-600/20',
  },
  {
    status: LeadStatus.REJECTED,
    label: 'Odmítnuto',
    icon: XCircle,
    classes: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20',
  },
  {
    status: LeadStatus.NEW,
    label: 'Zpět na seznam',
    icon: ArrowLeft,
    classes: 'bg-slate-600/90 hover:bg-slate-500 text-white shadow-lg shadow-slate-600/20',
  },
];

export default function CallActions({
  lead,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  position,
}: {
  lead: Lead;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  position: { index: number; total: number } | null;
}) {
  const router = useRouter();
  const { updateStatus, updateNotes, getNextLeadId } = useLeads();
  const [notes, setNotes] = useState(lead.notes);
  const [saved, setSaved] = useState(false);

  function handleStatusChange(newStatus: LeadStatus) {
    updateNotes(lead.id, notes);
    updateStatus(lead.id, newStatus);

    if (newStatus === LeadStatus.NEW) {
      router.push('/');
      return;
    }

    const nextId = getNextLeadId(lead.id);
    if (nextId) {
      router.push(`/leads/${nextId}`);
    } else {
      router.push('/');
    }
  }

  function handleSaveNotes() {
    updateNotes(lead.id, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          <ArrowLeftFromLine className="h-4 w-4" />
          Zpět
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-all duration-200 hover:bg-slate-700/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {position && (
            <span className="min-w-[3rem] text-center text-xs font-medium text-slate-500 tabular-nums">
              {position.index}/{position.total}
            </span>
          )}

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-all duration-200 hover:bg-slate-700/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lead detail */}
      <div>
        <h1 className="text-3xl font-bold text-white">{lead.companyName}</h1>
        <div className="mt-4 space-y-3">
          <a
            href={`tel:${lead.phone}`}
            className="group flex items-center gap-3 text-lg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
              <Phone className="h-4 w-4" />
            </span>
            <span className="phone-number font-mono tracking-tight">{lead.phone}</span>
          </a>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
              <Building2 className="h-4 w-4" />
            </span>
            {lead.industry}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
              <MapPin className="h-4 w-4" />
            </span>
            {lead.city}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1">
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-400">
          Poznámky
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          placeholder="Průběžné poznámky z hovoru..."
          className="h-32 w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
        />
        <button
          onClick={handleSaveNotes}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
        >
          <Save className="h-3.5 w-3.5" />
          {saved ? 'Uloženo' : 'Uložit poznámky'}
        </button>
      </div>

      {/* Status buttons */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[11px]">
          One-Click Logging
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {statusButtons.map(({ status, label, icon: Icon, classes }) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`flex items-center justify-between rounded-xl px-5 py-4 text-base font-semibold transition-all duration-200 active:scale-[0.97] ${classes}`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {label}
              </span>
              <ChevronRight className="h-5 w-5 opacity-70" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
