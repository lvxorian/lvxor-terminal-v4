'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Check,
  AlertCircle,
  FileText,
  ArrowRight,
  Loader2,
  Database,
} from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';

export default function ImportPage() {
  const router = useRouter();
  const { addLeads } = useLeads();
  const [raw, setRaw] = useState('');
  const [added, setAdded] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [state, setState] = useState<'idle' | 'importing' | 'done'>('idle');

  function handleImport() {
    const lines = raw
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

    setState('importing');

    const result = addLeads(items);
    setAdded(result.added.length);
    setSkipped(result.skipped);
    setState('done');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
          Hromadný import
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Vlož seznam leadů — každý na nový řádek: Název, Telefon, Obor, Město
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-sm">
        <label htmlFor="csv" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-400">
          <FileText className="h-4 w-4" />
          Seznam leadů
        </label>
        <textarea
          id="csv"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            if (state === 'done') setState('idle');
          }}
          rows={12}
          placeholder={
            'Restaurace U Zlaté Husy, +420 777 111 222, Gastronomie, Praha\n' +
            'Kadeřnictví Helena, +420 602 333 444, Služby, Brno\n' +
            'Autoopravna Novák, +420 725 555 666, Automotive, Ostrava'
          }
          className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-mono"
        />
        <p className="mt-2 text-xs text-slate-500">
          Formát: <code className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-400">Název, Telefon, Obor, Město</code> — každý lead na samostatný řádek
        </p>

        <button
          onClick={handleImport}
          disabled={state === 'importing' || !raw.trim()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:from-emerald-500 hover:to-green-500 hover:shadow-green-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] sm:w-auto"
        >
          {state === 'importing' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importuji...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Importovat leady
            </>
          )}
        </button>
      </div>

      {state === 'done' && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-green-800/50 bg-green-900/20 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600">
            <Check className="h-7 w-7 text-white" />
          </div>
          <p className="mt-4 text-lg font-semibold text-white">
            Import dokončen
          </p>
          <div className="mt-3 flex gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-green-400">
              <Database className="h-4 w-4" />
              Přidáno: <strong>{added}</strong>
            </span>
            {skipped > 0 && (
              <span className="flex items-center gap-1.5 text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                Přeskočeno (duplicita): <strong>{skipped}</strong>
              </span>
            )}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setRaw('');
                setState('idle');
              }}
              className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
            >
              Importovat další
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

      {state === 'idle' && !raw.trim() && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 py-16 backdrop-blur-sm">
          <FileText className="h-10 w-10 text-slate-600" />
          <p className="mt-4 text-sm text-slate-400">
            Vlož seznam leadů do textového pole výše.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Duplicitní telefonní čísla budou automaticky přeskočena.
          </p>
        </div>
      )}
    </div>
  );
}
