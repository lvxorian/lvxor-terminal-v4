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
    <div className="h-full rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
            <FileText className="h-5 w-5 text-indigo-400" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">Call Script</h2>
            <p className="text-xs text-slate-500">Postup pro první kontakt</p>
          </div>
        </div>

        {!editing && (
          <button
            onClick={startEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-700/60 hover:text-indigo-400"
            title="Upravit skript"
          >
            <PencilLine className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-5 text-sm leading-relaxed text-slate-300">
        {editing
          ? draft.map((section, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4"
              >
                <p className="mb-2 text-xs font-semibold tracking-wide text-indigo-400 uppercase">
                  {section.title}
                </p>
                <textarea
                  value={section.content}
                  onChange={(e) => updateDraft(i, e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-700/50 bg-slate-900/50 p-2.5 text-sm text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/50 focus:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  rows={3}
                />
              </div>
            ))
          : sections.map((section, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4"
              >
                <p className="mb-1 text-xs font-semibold tracking-wide text-indigo-400 uppercase">
                  {section.title}
                </p>
                <p className="text-slate-300 whitespace-pre-wrap">
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
          <div className="flex items-start gap-2 rounded-xl border border-slate-700/20 bg-slate-800/20 p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-slate-500">
              Dělej si poznámky do levého panelu. Po skončení hovoru jedním kliknutím zaloguj stav.
            </p>
          </div>
        )}
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="mt-5 flex items-center gap-2 border-t border-slate-700/30 pt-4">
          <button
            onClick={saveEdit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:bg-green-500 active:scale-[0.97]"
          >
            <Check className="h-4 w-4" />
            Uložit
          </button>
          <button
            onClick={cancelEdit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600 active:scale-[0.97]"
          >
            <X className="h-4 w-4" />
            Zrušit
          </button>
          <button
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-slate-800/60 hover:text-red-400"
            title="Obnovit výchozí skript"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Výchozí
          </button>
        </div>
      )}
    </div>
  );
}
