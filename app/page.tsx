'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Phone, Users, TrendingUp, Download } from 'lucide-react';
import { Lead, LeadStatus } from '@/app/types';
import { useLeads } from '@/hooks/useLeads';
import FilterBar from '@/components/FilterBar';
import LeadTable from '@/components/LeadTable';
import LeadDetailModal from '@/components/LeadDetailModal';

function exportCSV(leads: Lead[]) {
  const header = 'companyName,phone,industry,city,status,lastContact,notes';
  const rows = leads.map((l) =>
    [
      `"${l.companyName}"`,
      l.phone,
      `"${l.industry}"`,
      l.city,
      l.status,
      l.lastContact,
      `"${l.notes.replace(/"/g, '""')}"`,
    ].join(','),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lvxor-leady-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const router = useRouter();
  const { leads, deleteLead } = useLeads();
  const [filter, setFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads =
    filter === 'ALL' ? leads : leads.filter((l) => l.status === filter);

  function handleDelete(id: string) {
    if (window.confirm('Opravdu chcete smazat tento lead?')) {
      deleteLead(id);
      setSelectedLead((prev) => (prev?.id === id ? null : prev));
    }
  }

  const total = leads.length;
  const newCount = leads.filter((l) => l.status === LeadStatus.NEW).length;
  const meetingCount = leads.filter((l) => l.status === LeadStatus.MEETING).length;
  const callbackCount = leads.filter((l) => l.status === LeadStatus.CALLBACK).length;

  const stats = [
    { label: 'Celkem leadů', value: total, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Nových', value: newCount, icon: Plus, color: 'text-slate-300', bg: 'bg-slate-500/10' },
    { label: 'Schůzka', value: meetingCount, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Zavolat znovu', value: callbackCount, icon: Phone, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Přehled a správa leadů pro cold calling.
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => exportCSV(leads)}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-700/50 active:scale-[0.97]"
            title="Exportovat vše do CSV"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => router.push('/leads/generate')}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Nový lead</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="group rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700/60 hover:bg-slate-900/80"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <FilterBar activeFilter={filter} onFilterChange={setFilter} />
      <LeadTable leads={filteredLeads} onDelete={handleDelete} onSelect={setSelectedLead} />

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
