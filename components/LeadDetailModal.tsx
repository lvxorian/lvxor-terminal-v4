'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Phone,
  MapPin,
  Building2,
  PhoneOff,
  Clock,
  CalendarCheck,
  XCircle,
  ChevronRight,
  ArrowLeft,
  PhoneCall,
  Save,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/app/types';
import { useLeads } from '@/hooks/useLeads';
import StatusBadge from './StatusBadge';

const miniStatusButtons = [
  {
    status: LeadStatus.NO_ANSWER,
    label: 'Nezvedá',
    icon: PhoneOff,
    classes: 'bg-yellow-600/80 hover:bg-yellow-500 text-white',
  },
  {
    status: LeadStatus.CALLBACK,
    label: 'Zavolat znovu',
    icon: Clock,
    classes: 'bg-blue-600/80 hover:bg-blue-500 text-white',
  },
  {
    status: LeadStatus.MEETING,
    label: 'Schůzka',
    icon: CalendarCheck,
    classes: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white',
  },
  {
    status: LeadStatus.REJECTED,
    label: 'Odmítnuto',
    icon: XCircle,
    classes: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white',
  },
  {
    status: LeadStatus.NEW,
    label: 'Zpět na Nový',
    icon: ArrowLeft,
    classes: 'bg-slate-600/80 hover:bg-slate-500 text-white',
  },
];

export default function LeadDetailModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const router = useRouter();
  const { updateStatus, updateNotes } = useLeads();
  const [notes, setNotes] = useState(lead.notes);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function handleStatusChange(newStatus: LeadStatus) {
    updateNotes(lead.id, notes);
    updateStatus(lead.id, newStatus);
    onClose();
  }

  function handleSaveNotes() {
    updateNotes(lead.id, notes);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 p-4 sm:p-6 shadow-2xl shadow-black/40">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">{lead.companyName}</h2>
            <StatusBadge status={lead.status} />
          </div>

          <div className="mt-4 space-y-2.5">
            <a
              href={`tel:${lead.phone}`}
              className="group flex items-center gap-3 text-base text-slate-300 transition-colors hover:text-indigo-400"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Phone className="h-3.5 w-3.5" />
              </span>
              <span className="font-mono tracking-tight">{lead.phone}</span>
            </a>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                <Building2 className="h-3.5 w-3.5" />
              </span>
              {lead.industry}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              {lead.city}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide">
            Poznámky
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Poznámky k tomuto leadovi..."
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          />
          <button
            onClick={handleSaveNotes}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
          >
            <Save className="h-3 w-3" />
            Uložit poznámky
          </button>
        </div>

        {/* Quick status buttons */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Rychlá změna statusu
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {miniStatusButtons.map(({ status, label, icon: Icon, classes }) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${classes}`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </button>
            ))}
          </div>
        </div>

        {/* Call button */}
        <button
          onClick={() => {
            onClose();
            router.push(`/leads/${lead.id}`);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 active:scale-[0.97]"
        >
          <PhoneCall className="h-4 w-4" />
          Otevřít v Call Mode
        </button>
      </div>
    </div>
  );
}
