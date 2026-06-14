'use client';

import { useRouter } from 'next/navigation';
import { Phone, ChevronRight, Trash2 } from 'lucide-react';
import { Lead } from '@/app/types';
import StatusBadge from './StatusBadge';

export default function LeadTable({
  leads,
  onDelete,
  onSelect,
}: {
  leads: Lead[];
  onDelete: (id: string) => void;
  onSelect: (lead: Lead) => void;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/60 bg-slate-950/30">
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide text-slate-500 uppercase text-[11px]">
                Firma
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide text-slate-500 uppercase text-[11px]">
                Telefon
              </th>
              <th className="hidden px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide text-slate-500 uppercase text-[11px] md:table-cell">
                Obor
              </th>
              <th className="hidden px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide text-slate-500 uppercase text-[11px] md:table-cell">
                Město
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide text-slate-500 uppercase text-[11px]">
                Status
              </th>
              <th className="hidden px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide text-slate-500 uppercase text-[11px] lg:table-cell">
                Poslední kontakt
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide text-slate-500 uppercase text-[11px]">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-sm text-slate-500">
                  Žádné leady neodpovídají zvolenému filtru.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="group transition-all duration-200 hover:bg-slate-800/40"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <button
                      onClick={() => onSelect(lead)}
                      className="font-medium text-white transition-colors hover:text-indigo-400 text-left text-sm leading-snug"
                    >
                      {lead.companyName}
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm">
                    <a
                      href={`tel:${lead.phone}`}
                      className="phone-number"
                    >
                      {lead.phone}
                    </a>
                  </td>
                  <td className="hidden px-3 sm:px-6 py-3 sm:py-4 text-slate-400 md:table-cell">{lead.industry}</td>
                  <td className="hidden px-3 sm:px-6 py-3 sm:py-4 text-slate-400 md:table-cell">{lead.city}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="hidden px-3 sm:px-6 py-3 sm:py-4 text-slate-500 lg:table-cell">{lead.lastContact}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/leads/${lead.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/15 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25 active:scale-[0.97]"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Zavolat
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 sm:text-slate-600 sm:opacity-0 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 sm:group-hover:opacity-100"
                        title="Smazat lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
