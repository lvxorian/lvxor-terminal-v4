import { LeadStatus } from '@/app/types';

const statusConfig: Record<LeadStatus, { label: string; dot: string; bg: string }> = {
  [LeadStatus.NEW]: {
    label: 'Nový',
    dot: 'bg-slate-400',
    bg: 'bg-slate-800 text-slate-300 border border-slate-700/50',
  },
  [LeadStatus.NO_ANSWER]: {
    label: 'Nezvedá',
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-900/20 text-yellow-400 border border-yellow-700/30',
  },
  [LeadStatus.CALLBACK]: {
    label: 'Zavolat znovu',
    dot: 'bg-blue-400',
    bg: 'bg-blue-900/20 text-blue-400 border border-blue-700/30',
  },
  [LeadStatus.MEETING]: {
    label: 'Schůzka',
    dot: 'bg-green-400',
    bg: 'bg-green-900/20 text-green-400 border border-green-700/30',
  },
  [LeadStatus.REJECTED]: {
    label: 'Odmítnuto',
    dot: 'bg-red-400',
    bg: 'bg-red-900/20 text-red-400 border border-red-700/30',
  },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
