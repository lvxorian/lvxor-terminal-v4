export enum LeadStatus {
  NEW = 'NEW',
  NO_ANSWER = 'NO_ANSWER',
  CALLBACK = 'CALLBACK',
  MEETING = 'MEETING',
  REJECTED = 'REJECTED',
}

export interface Lead {
  id: string;
  companyName: string;
  phone: string;
  industry: string;
  city: string;
  status: LeadStatus;
  lastContact: string;
  notes: string;
}
