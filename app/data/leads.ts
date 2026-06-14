import { Lead, LeadStatus } from '@/app/types';

export const leadsData: Lead[] = [
  {
    id: '1',
    companyName: 'TechnoSoft s.r.o.',
    phone: '+420 777 111 222',
    industry: 'IT služby',
    city: 'Praha',
    status: LeadStatus.NEW,
    lastContact: '2026-06-10',
    notes: '',
  },
  {
    id: '2',
    companyName: 'Möbel Design Studio',
    phone: '+420 602 333 444',
    industry: 'Nábytkářství',
    city: 'Brno',
    status: LeadStatus.NO_ANSWER,
    lastContact: '2026-06-12',
    notes: 'Zkoušet ve čtvrtek dopoledne.',
  },
  {
    id: '3',
    companyName: 'GreenLeaf Eko s.r.o.',
    phone: '+420 725 555 666',
    industry: 'Ekologie',
    city: 'Ostrava',
    status: LeadStatus.CALLBACK,
    lastContact: '2026-06-13',
    notes: 'Mají zájem o redizajn webu. Poslat cenovou nabídku.',
  },
  {
    id: '4',
    companyName: 'LegalConsult v.o.s.',
    phone: '+420 737 777 888',
    industry: 'Právní služby',
    city: 'Plzeň',
    status: LeadStatus.MEETING,
    lastContact: '2026-06-11',
    notes: 'Schůzka domluvena na 20.6. v 10:00 v jejich kanceláři.',
  },
  {
    id: '5',
    companyName: 'FreshBake s.r.o.',
    phone: '+420 605 999 000',
    industry: 'Pekárenství',
    city: 'Liberec',
    status: LeadStatus.REJECTED,
    lastContact: '2026-06-09',
    notes: 'Nemají zájem, už mají dodavatele.',
  },
  {
    id: '6',
    companyName: 'AutoMoto Centrum a.s.',
    phone: '+420 733 123 456',
    industry: 'Automotive',
    city: 'Hradec Králové',
    status: LeadStatus.NEW,
    lastContact: '2026-06-14',
    notes: '',
  },
];

let leads = [...leadsData];

export function getLeads(): Lead[] {
  return leads;
}

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}

export function updateLeadStatus(id: string, status: LeadStatus): Lead | undefined {
  const lead = leads.find((l) => l.id === id);
  if (lead) {
    lead.status = status;
    lead.lastContact = new Date().toISOString().split('T')[0];
  }
  return lead;
}

export function updateLeadNotes(id: string, notes: string): Lead | undefined {
  const lead = leads.find((l) => l.id === id);
  if (lead) {
    lead.notes = notes;
  }
  return lead;
}

export function getNextLeadId(currentId: string): string | null {
  const currentIndex = leads.findIndex((l) => l.id === currentId);
  if (currentIndex === -1) return null;
  if (currentIndex >= leads.length - 1) return null;
  return leads[currentIndex + 1].id;
}

export function getPrevLeadId(currentId: string): string | null {
  const currentIndex = leads.findIndex((l) => l.id === currentId);
  if (currentIndex <= 0) return null;
  return leads[currentIndex - 1].id;
}

export function getLeadPosition(currentId: string): { index: number; total: number } | null {
  const currentIndex = leads.findIndex((l) => l.id === currentId);
  if (currentIndex === -1) return null;
  return { index: currentIndex + 1, total: leads.length };
}

export function getFirstLeadId(): string | null {
  return leads.length > 0 ? leads[0].id : null;
}

export function deleteLead(id: string): boolean {
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return false;
  leads.splice(index, 1);
  return true;
}

export function addLeads(newLeads: Array<{
  companyName: string;
  phone: string;
  industry: string;
  city: string;
}>): Lead[] {
  const maxId = leads.reduce((max, l) => Math.max(max, Number(l.id)), 0);
  const created: Lead[] = newLeads.map((item, i) => ({
    id: String(maxId + 1 + i),
    companyName: item.companyName,
    phone: item.phone,
    industry: item.industry,
    city: item.city,
    status: LeadStatus.NEW,
    lastContact: new Date().toISOString().split('T')[0],
    notes: '',
  }));
  leads.push(...created);
  return created;
}
