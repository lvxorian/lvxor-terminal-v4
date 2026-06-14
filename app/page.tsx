'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Phone, Users, TrendingUp } from 'lucide-react';
import { Lead, LeadStatus } from '@/app/types';
import { getLeads, deleteLead } from '@/app/data/leads';
import FilterBar from '@/components/FilterBar';
import LeadTable from '@/components/LeadTable';
import LeadDetailModal from '@/components/LeadDetailModal';

export default function Dashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [refresh, setRefresh] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const leads = getLeads();
  const filteredLeads =
    filter === 'ALL' ? leads : leads.filter((l) => l.status === filter);

  function handleDelete(id: string) {
    if (window.confirm('Opravdu chcete smazat tento lead?')) {
      deleteLead(id);
      setSelectedLead((prev) => (prev?.id === id ? null : prev));
      setRefresh((r) => r + 1);
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
    <div className="space-y-8" key={refresh}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Přehled a správa leadů pro cold calling.
          </p>
        </div>
        <button
          onClick={() => router.push('/leads/generate')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          Nový lead
        </button>
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
