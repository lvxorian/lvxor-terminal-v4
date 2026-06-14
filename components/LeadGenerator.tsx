'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Loader2,
  Check,
  Phone,
  Globe,
  AlertCircle,
  Database,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';
import { addLeads } from '@/app/data/leads';

interface FoundLead {
  companyName: string;
  phone: string;
  industry: string;
  city: string;
}

type PageState = 'idle' | 'loading' | 'results' | 'error' | 'imported';

export default function LeadGenerator() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [state, setState] = useState<PageState>('idle');
  const [foundLeads, setFoundLeads] = useState<FoundLead[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const [importCount, setImportCount] = useState(0);

  async function handleSearch() {
    if (!query.trim()) return;
    if (!city.trim() && !region.trim()) return;

    setState('loading');
    setFoundLeads([]);
    setSelected(new Set());
    setErrorMsg('');

    try {
      const res = await fetch('/api/generate-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          city: city.trim(),
          region: region.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Chyba při generování leadů.');
        setState('error');
        return;
      }

      setFoundLeads(data.leads);
      setSelected(new Set(data.leads.map((_: any, i: number) => i)));
      setState('results');
    } catch {
      setErrorMsg('Nepodařilo se připojit k serveru.');
      setState('error');
    }
  }

  function toggleSelect(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleImport() {
    const itemsToImport = foundLeads.filter((_, i) => selected.has(i));
    if (itemsToImport.length === 0) return;

    addLeads(itemsToImport);
    setImportCount(itemsToImport.length);
    setState('imported');
  }

  const canSubmit = query.trim().length > 0 && (city.trim().length > 0 || region.trim().length > 0) && state !== 'loading';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
          Generovat nové leady
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Automaticky vyhledej firmy bez webových stránek pomocí Google Places.
        </p>
      </div>

      {/* Search form */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="query" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <Briefcase className="h-4 w-4" />
              Obor / klíčová slova
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="např. restaurace, kadeřnictví"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
          <div>
            <label htmlFor="region" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <LayoutGrid className="h-4 w-4" />
              Kraj <span className="text-xs text-slate-500">(volitelný)</span>
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            >
              <option value="">— Nezadáno —</option>
              <option value="Hlavní město Praha">Hlavní město Praha</option>
              <option value="Středočeský kraj">Středočeský kraj</option>
              <option value="Jihočeský kraj">Jihočeský kraj</option>
              <option value="Plzeňský kraj">Plzeňský kraj</option>
              <option value="Karlovarský kraj">Karlovarský kraj</option>
              <option value="Ústecký kraj">Ústecký kraj</option>
              <option value="Liberecký kraj">Liberecký kraj</option>
              <option value="Královéhradecký kraj">Královéhradecký kraj</option>
              <option value="Pardubický kraj">Pardubický kraj</option>
              <option value="Kraj Vysočina">Kraj Vysočina</option>
              <option value="Jihomoravský kraj">Jihomoravský kraj</option>
              <option value="Olomoucký kraj">Olomoucký kraj</option>
              <option value="Moravskoslezský kraj">Moravskoslezský kraj</option>
              <option value="Zlínský kraj">Zlínský kraj</option>
            </select>
          </div>
          <div>
            <label htmlFor="city" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <MapPin className="h-4 w-4" />
              Město <span className="text-xs text-slate-500">(volitelné)</span>
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="např. Praha, Brno"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={!canSubmit}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] sm:w-auto"
        >
          {state === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Probíhá generování...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Vyhledat potenciální leady
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          <p className="mt-4 text-sm text-slate-400">
            Prohledávám Google Places pro {query.trim()}
            {city.trim() && `, ${city.trim()}`}
            {region.trim() && `, ${region.trim()}`}...
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Kontroluji až 10 míst, zda mají telefon a nemají web.
          </p>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-800/50 bg-red-900/20 py-12">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="mt-4 text-sm font-medium text-red-400">{errorMsg}</p>
          <button
            onClick={handleSearch}
            className="mt-4 rounded-xl bg-red-800 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700 active:scale-[0.97]"
          >
            Zkusit znovu
          </button>
        </div>
      )}

      {/* Results state */}
      {state === 'results' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">{foundLeads.length}</span> nalezených leadů
              {foundLeads.length > 0 && (
                <span className="ml-1 text-xs text-slate-500">
                  (bez webových stránek, s telefonem)
                </span>
              )}
            </p>
            {selected.size > 0 && (
              <p className="text-sm text-slate-400">
                Vybráno: <span className="font-semibold text-indigo-400">{selected.size}</span>
              </p>
            )}
          </div>

          {foundLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 py-16 backdrop-blur-sm">
              <Search className="h-10 w-10 text-slate-600" />
              <p className="mt-4 text-sm text-slate-400">
                Žádné firmy bez webu s telefonem nenalezeny.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Zkus jiná klíčová slova, město nebo kraj.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {foundLeads.map((lead, i) => (
                <button
                  key={i}
                  onClick={() => toggleSelect(i)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                    selected.has(i)
                      ? 'border-indigo-500/60 bg-indigo-900/20 shadow-sm shadow-indigo-500/10'
                      : 'border-slate-800/60 bg-slate-900/60 hover:border-slate-700/60 hover:bg-slate-900/80'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      selected.has(i)
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {selected.has(i) && <Check className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{lead.companyName}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {lead.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {lead.industry}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-400">
                    <Globe className="h-3 w-3" />
                    Bez webu
                  </div>
                </button>
              ))}
            </div>
          )}

          {foundLeads.length > 0 && selected.size > 0 && (
            <button
              onClick={handleImport}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:from-emerald-500 hover:to-green-500 hover:shadow-green-500/30 active:scale-[0.97] sm:w-auto"
            >
              <Database className="h-4 w-4" />
              Importovat vybrané ({selected.size})
            </button>
          )}
        </>
      )}

      {/* Imported state */}
      {state === 'imported' && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-green-800/50 bg-green-900/20 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600">
            <Check className="h-7 w-7 text-white" />
          </div>
          <p className="mt-4 text-lg font-semibold text-white">
            {importCount} lead{importCount !== 1 ? 'ů' : ''} importováno
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Byly přidány do seznamu leadů s statusem Nový.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setState('idle');
                setQuery('');
                setCity('');
                setRegion('');
              }}
              className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
            >
              Generovat další
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.97]"
            >
              Přejít na Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Idle state hint */}
      {state === 'idle' && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 py-16 backdrop-blur-sm">
          <Sparkles className="h-10 w-10 text-slate-600" />
          <p className="mt-4 text-sm text-slate-400">
            Zadej obor a alespoň město nebo kraj pro vyhledání potenciálních zákazníků.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Systém najde firmy s telefonem které nemají webové stránky.
          </p>
        </div>
      )}
    </div>
  );
}
