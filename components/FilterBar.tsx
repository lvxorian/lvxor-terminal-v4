'use client';

import { LeadStatus } from '@/app/types';

const filters: { value: LeadStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Vše' },
  { value: LeadStatus.NEW, label: 'Nový' },
  { value: LeadStatus.NO_ANSWER, label: 'Nezvedá' },
  { value: LeadStatus.CALLBACK, label: 'Zavolat znovu' },
  { value: LeadStatus.MEETING, label: 'Schůzka' },
  { value: LeadStatus.REJECTED, label: 'Odmítnuto' },
];

const activeStyle: Record<string, string> = {
  ALL: 'bg-white/10 text-white border-white/20 shadow-sm',
  NEW: 'bg-slate-500/20 text-slate-200 border-slate-500/30 shadow-sm',
  NO_ANSWER: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-sm shadow-yellow-500/10',
  CALLBACK: 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-sm shadow-blue-500/10',
  MEETING: 'bg-green-500/20 text-green-300 border-green-500/30 shadow-sm shadow-green-500/10',
  REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30 shadow-sm shadow-red-500/10',
};

export default function FilterBar({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: LeadStatus | 'ALL';
  onFilterChange: (filter: LeadStatus | 'ALL') => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ value, label }) => {
        const active = activeFilter === value;
        return (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              active
                ? activeStyle[value]
                : 'border border-transparent text-slate-500 hover:border-slate-700/50 hover:bg-slate-800/50 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
