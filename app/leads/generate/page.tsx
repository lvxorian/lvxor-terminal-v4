'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Check,
  AlertCircle,
  UserPlus,
  Upload,
  ArrowRight,
  FileText,
  Briefcase,
  MapPin,
  Phone,
  Database,
} from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';

export default function GenerateLeadsPage() {
  const router = useRouter();
  const { addLeads } = useLeads();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');

  const [bulkRaw, setBulkRaw] = useState('');
  const [singleMsg, setSingleMsg] = useState<{ type: 'ok' | 'dup' | 'err'; text: string } | null>(null);
  const [bulkResult, setBulkResult] = useState<{ added: number; skipped: number } | null>(null);

  function handleAddSingle() {
    if (!name.trim() || !phone.trim()) {
      setSingleMsg({ type: 'err', text: 'Vyplň název firmy a telefon.' });
      return;
    }

    const { added, skipped } = addLeads([{
      companyName: name.trim(),
      phone: phone.trim(),
      industry: industry.trim() || '—',
      city: city.trim() || '—',
    }]);

    if (added.length > 0) {
      setSingleMsg({ type: 'ok', text: `Lead "${name.trim()}" přidán.` });
      setName('');
      setPhone('');
      setIndustry('');
      setCity('');
    } else if (skipped > 0) {
      setSingleMsg({ type: 'dup', text: `Telefon ${phone.trim()} už existuje.` });
    }
  }

  function handleAddBulk() {
    const lines = bulkRaw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const items = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        companyName: parts[0] || '',
        phone: parts[1] || '',
        industry: parts[2] || '',
        city: parts[3] || '',
      };
    }).filter((item) => item.companyName && item.phone);

    if (items.length === 0) return;

    const { added, skipped } = addLeads(items);
    setBulkResult({ added: added.length, skipped });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
          Nový lead
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Přidej lead ručně — jednotlivě nebo hromadně.
        </p>
      </div>

      {/* Single lead */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
          <UserPlus className="h-4 w-4 text-indigo-400" />
          Přidat jednotlivě
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <Briefcase className="h-3.5 w-3.5" />
              Název firmy <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !phone && document.getElementById('phone')?.focus()}
              placeholder="např. TechnoSoft s.r.o."
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <Phone className="h-3.5 w-3.5" />
              Telefon <span className="text-red-400">*</span>
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
              placeholder="+420 777 111 222"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-mono"
            />
          </div>
          <div>
            <label htmlFor="industry" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <Briefcase className="h-3.5 w-3.5" />
              Obor
            </label>
            <input
              id="industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="např. IT služby"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
          <div>
            <label htmlFor="city" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              Město
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
              placeholder="např. Praha"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleAddSingle}
            disabled={!name.trim() || !phone.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Přidat lead
          </button>

          {singleMsg && (
            <span
              className={`flex items-center gap-1.5 text-sm break-all ${
                singleMsg.type === 'ok' ? 'text-green-400' : singleMsg.type === 'dup' ? 'text-yellow-400' : 'text-red-400'
              }`}
            >
              {singleMsg.type === 'ok' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {singleMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* Bulk add */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
          <Upload className="h-4 w-4 text-indigo-400" />
          Přidat hromadně
        </h2>
        <label htmlFor="bulk" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-400">
          <FileText className="h-3.5 w-3.5" />
          Seznam (jeden lead na řádek)
        </label>
        <textarea
          id="bulk"
          value={bulkRaw}
          onChange={(e) => {
            setBulkRaw(e.target.value);
            setBulkResult(null);
          }}
          rows={6}
          placeholder={
            'TechnoSoft s.r.o., +420 777 111 222, IT služby, Praha\n' +
            'Möbel Design Studio, +420 602 333 444, Nábytkářství, Brno'
          }
          className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-mono"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Formát: <code className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-400">Název, Telefon, Obor, Město</code>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleAddBulk}
            disabled={!bulkRaw.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:from-emerald-500 hover:to-green-500 hover:shadow-green-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97]"
          >
            <Database className="h-4 w-4" />
            Importovat
          </button>

          {bulkResult && (
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-green-400">
                <Check className="h-4 w-4" />
                Přidáno: <strong>{bulkResult.added}</strong>
              </span>
              {bulkResult.skipped > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  Přeskočeno (duplicita): <strong>{bulkResult.skipped}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
        >
          <ArrowRight className="h-4 w-4" />
          Přejít na Dashboard
        </button>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.97]"
        >
          Call Mode
        </button>
      </div>
    </div>
  );
}
