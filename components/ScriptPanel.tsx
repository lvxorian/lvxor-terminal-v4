'use client';

import { useState, useEffect } from 'react';
import { FileText, Lightbulb, PencilLine, Check, X, RotateCcw } from 'lucide-react';
import { getScript, saveScript, resetScript, ScriptSection } from '@/app/data/script';

export default function ScriptPanel() {
  const [editing, setEditing] = useState(false);
  const [sections, setSections] = useState<ScriptSection[]>([]);
  const [draft, setDraft] = useState<ScriptSection[]>([]);

  useEffect(() => {
    setSections(getScript());
  }, []);

  function startEdit() {
    setDraft(sections.map((s) => ({ ...s })));
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft([]);
  }

  function saveEdit() {
    saveScript(draft);
    setSections(draft);
    setEditing(false);
    setDraft([]);
  }

  function handleReset() {
    resetScript();
    const restored = getScript();
    setSections(restored);
    setDraft(restored.map((s) => ({ ...s })));
  }

  function updateDraft(index: number, content: string) {
    setDraft((prev) => prev.map((s, i) => (i === index ? { ...s, content } : s)));
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800/60 bg-slate-900/60 p-3 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10">
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
          </span>
          <div>
            <h2 className="text-xs font-semibold text-white">Call Script</h2>
            <p className="text-[10px] text-slate-500 leading-tight">Postup pro první kontakt</p>
          </div>
        </div>

        {!editing && (
          <button
            onClick={startEdit}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-700/60 hover:text-indigo-400"
            title="Upravit skript"
          >
            <PencilLine className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 space-y-1.5 overflow-y-auto text-xs leading-relaxed text-slate-300">
        {editing
          ? draft.map((section, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-2.5"
              >
                <p className="mb-1 text-[10px] font-semibold tracking-wide text-indigo-400 uppercase">
                  {section.title}
                </p>
                <textarea
                  value={section.content}
                  onChange={(e) => updateDraft(i, e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-700/50 bg-slate-900/50 p-2 text-xs text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  rows={2}
                />
              </div>
            ))
          : sections.map((section, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-2.5"
              >
                <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-indigo-400 uppercase">
                  {section.title}
                </p>
                <p className="text-slate-300 whitespace-pre-wrap text-xs leading-relaxed line-clamp-2">
                  {section.content.startsWith('„') ? (
                    <>
                      <span className="text-indigo-400/50">„</span>
                      {section.content.slice(1, -1)}
                      <span className="text-indigo-400/50">“</span>
                    </>
                  ) : (
                    section.content
                  )}
                </p>
              </div>
            ))}

        {/* Tip box */}
        {!editing && (
          <div className="flex items-start gap-1.5 rounded-xl border border-slate-700/20 bg-slate-800/20 p-2">
            <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
            <p className="text-[10px] leading-relaxed text-slate-500">
              Poznámky píš vlevo. Po hovoru klikni na stav.
            </p>
          </div>
        )}
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-slate-700/30 pt-2 shrink-0">
          <button
            onClick={saveEdit}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:bg-green-500 active:scale-[0.97]"
          >
            <Check className="h-3 w-3" />
            Uložit
          </button>
          <button
            onClick={cancelEdit}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
          >
            <X className="h-3 w-3" />
            Zrušit
          </button>
          <button
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-500 transition-all duration-200 hover:bg-slate-800/60 hover:text-red-400"
            title="Obnovit výchozí skript"
          >
            <RotateCcw className="h-3 w-3" />
            Výchozí
          </button>
        </div>
      )}
    </div>
  );
}
