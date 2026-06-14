'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Lead, LeadStatus } from '@/app/types';

const STORAGE_KEY = 'lvxor-leads';

const defaultLeads: Lead[] = [
  { id: '1', companyName: 'TechnoSoft s.r.o.', phone: '+420 777 111 222', industry: 'IT služby', city: 'Praha', status: LeadStatus.NEW, lastContact: '2026-06-10', notes: '' },
  { id: '2', companyName: 'Möbel Design Studio', phone: '+420 602 333 444', industry: 'Nábytkářství', city: 'Brno', status: LeadStatus.NO_ANSWER, lastContact: '2026-06-12', notes: 'Zkoušet ve čtvrtek dopoledne.' },
  { id: '3', companyName: 'GreenLeaf Eko s.r.o.', phone: '+420 725 555 666', industry: 'Ekologie', city: 'Ostrava', status: LeadStatus.CALLBACK, lastContact: '2026-06-13', notes: 'Mají zájem o redizajn webu. Poslat cenovou nabídku.' },
  { id: '4', companyName: 'LegalConsult v.o.s.', phone: '+420 737 777 888', industry: 'Právní služby', city: 'Plzeň', status: LeadStatus.MEETING, lastContact: '2026-06-11', notes: 'Schůzka domluvena na 20.6. v 10:00 v jejich kanceláři.' },
  { id: '5', companyName: 'FreshBake s.r.o.', phone: '+420 605 999 000', industry: 'Pekárenství', city: 'Liberec', status: LeadStatus.REJECTED, lastContact: '2026-06-09', notes: 'Nemají zájem, už mají dodavatele.' },
  { id: '6', companyName: 'AutoMoto Centrum a.s.', phone: '+420 733 123 456', industry: 'Automotive', city: 'Hradec Králové', status: LeadStatus.NEW, lastContact: '2026-06-14', notes: '' },
];

function loadLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  const initial = defaultLeads;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveLeads(leads: Lead[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function nextId(leads: Lead[]): string {
  const max = leads.reduce((m, l) => Math.max(m, Number(l.id)), 0);
  return String(max + 1);
}

interface AddResult {
  added: Lead[];
  skipped: number;
}

interface LeadsContextValue {
  leads: Lead[];
  addLeads: (items: { companyName: string; phone: string; industry: string; city: string }[]) => AddResult;
  deleteLead: (id: string) => boolean;
  updateStatus: (id: string, status: LeadStatus) => void;
  updateNotes: (id: string, notes: string) => void;
  getLeadById: (id: string) => Lead | undefined;
  getNextLeadId: (id: string) => string | null;
  getPrevLeadId: (id: string) => string | null;
  getLeadPosition: (id: string) => { index: number; total: number } | null;
  getFirstLeadId: () => string | null;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLeads(loadLeads());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveLeads(leads);
  }, [leads, ready]);

  const addLeadsFn = useCallback((items: { companyName: string; phone: string; industry: string; city: string }[]): AddResult => {
    let added: Lead[] = [];
    let skipped = 0;
    setLeads((prev) => {
      const existingPhones = new Set(prev.map((l) => l.phone.trim().toLowerCase()));
      const newLeads: Lead[] = [];
      for (const item of items) {
        if (existingPhones.has(item.phone.trim().toLowerCase())) {
          skipped++;
          continue;
        }
        const lead: Lead = {
          id: nextId([...prev, ...newLeads]),
          companyName: item.companyName,
          phone: item.phone,
          industry: item.industry,
          city: item.city,
          status: LeadStatus.NEW,
          lastContact: new Date().toISOString().split('T')[0],
          notes: '',
        };
        newLeads.push(lead);
        existingPhones.add(item.phone.trim().toLowerCase());
        added.push(lead);
      }
      return [...prev, ...newLeads];
    });
    return { added, skipped };
  }, []);

  const deleteLeadFn = useCallback((id: string): boolean => {
    let found = false;
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (next.length < prev.length) found = true;
      return next;
    });
    return found;
  }, []);

  const updateStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status, lastContact: new Date().toISOString().split('T')[0] } : l,
      ),
    );
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes } : l)),
    );
  }, []);

  const getLeadById = useCallback((id: string) => leads.find((l) => l.id === id), [leads]);

  const getNextLeadId = useCallback((id: string) => {
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1 || idx >= leads.length - 1) return null;
    return leads[idx + 1].id;
  }, [leads]);

  const getPrevLeadId = useCallback((id: string) => {
    const idx = leads.findIndex((l) => l.id === id);
    if (idx <= 0) return null;
    return leads[idx - 1].id;
  }, [leads]);

  const getLeadPosition = useCallback((id: string) => {
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    return { index: idx + 1, total: leads.length };
  }, [leads]);

  const getFirstLeadId = useCallback(() => leads.length > 0 ? leads[0].id : null, [leads]);

  if (!ready) return null;

  return (
    <LeadsContext.Provider
      value={{
        leads,
        addLeads: addLeadsFn,
        deleteLead: deleteLeadFn,
        updateStatus,
        updateNotes,
        getLeadById,
        getNextLeadId,
        getPrevLeadId,
        getLeadPosition,
        getFirstLeadId,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within a LeadsProvider');
  return ctx;
}
