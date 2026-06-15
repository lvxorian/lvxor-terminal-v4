'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Lead, LeadStatus } from '@/app/types';
import { supabase } from '@/lib/supabase';

interface DbRow {
  id: string;
  company_name: string;
  phone: string;
  industry: string;
  city: string;
  status: string;
  last_contact: string;
  notes: string;
  created_at: string;
}

function toLead(r: DbRow): Lead {
  return {
    id: r.id,
    companyName: r.company_name,
    phone: r.phone,
    industry: r.industry,
    city: r.city,
    status: (r.status in LeadStatus ? r.status : LeadStatus.NEW) as LeadStatus,
    lastContact: r.last_contact,
    notes: r.notes,
  };
}

const PRIORITY: Record<LeadStatus, number> = {
  [LeadStatus.NEW]: 0,
  [LeadStatus.CALLBACK]: 1,
  [LeadStatus.NO_ANSWER]: 2,
  [LeadStatus.MEETING]: 3,
  [LeadStatus.REJECTED]: 4,
};

interface AddResult {
  added: Lead[];
  skipped: number;
}

interface LeadsContextValue {
  leads: Lead[];
  loading: boolean;
  addLeads: (items: { companyName: string; phone: string; industry: string; city: string }[]) => Promise<AddResult>;
  deleteLead: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: LeadStatus) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  getLeadById: (id: string) => Lead | undefined;
  getNextLeadId: (id: string) => string | null;
  getPrevLeadId: (id: string) => string | null;
  getLeadPosition: (id: string) => { index: number; total: number } | null;
  getFirstLeadId: () => string | null;
  getCallQueue: () => Lead[];
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setLeads((data as DbRow[]).map(toLead));
        } else {
          console.error('Failed to load leads:', error);
        }
        setLoading(false);
      });
  }, []);

  const addLeads = useCallback(async (
    items: { companyName: string; phone: string; industry: string; city: string }[],
  ): Promise<AddResult> => {
    const existingPhones = new Set(leads.map((l) => l.phone.trim().toLowerCase()));
    const toInsert: any[] = [];
    let skipped = 0;

    for (const item of items) {
      if (existingPhones.has(item.phone.trim().toLowerCase())) {
        skipped++;
        continue;
      }
      toInsert.push({
        company_name: item.companyName.trim(),
        phone: item.phone.trim(),
        industry: item.industry.trim() || '',
        city: item.city.trim() || '',
        status: LeadStatus.NEW,
        last_contact: new Date().toISOString().split('T')[0],
        notes: '',
      });
      existingPhones.add(item.phone.trim().toLowerCase());
    }

    if (toInsert.length === 0) return { added: [], skipped };

    const { data, error } = await supabase.from('leads').insert(toInsert).select();
    if (error) {
      console.error('Failed to add leads:', error);
      return { added: [], skipped: items.length };
    }

    const added = (data as DbRow[]).map(toLead);
    setLeads((prev) => [...prev, ...added]);
    return { added, skipped };
  }, [leads]);

  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete lead:', error);
      return false;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    return true;
  }, []);

  const updateStatus = useCallback(async (id: string, status: LeadStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('leads')
      .update({ status, last_contact: today })
      .eq('id', id);
    if (error) {
      console.error('Failed to update status:', error);
      return;
    }
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status, lastContact: today } : l)),
    );
  }, []);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ notes })
      .eq('id', id);
    if (error) {
      console.error('Failed to update notes:', error);
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
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

  const getCallQueue = useCallback(() => {
    return [...leads].sort((a, b) => {
      const pa = PRIORITY[a.status];
      const pb = PRIORITY[b.status];
      if (pa !== pb) return pa - pb;
      return new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
    });
  }, [leads]);

  if (loading) return null;

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loading,
        addLeads,
        deleteLead,
        updateStatus,
        updateNotes,
        getLeadById,
        getNextLeadId,
        getPrevLeadId,
        getLeadPosition,
        getFirstLeadId,
        getCallQueue,
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
