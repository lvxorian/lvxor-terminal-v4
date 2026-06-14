export interface ScriptSection {
  title: string;
  content: string;
}

const STORAGE_KEY = 'lvxor_call_script';

const defaultSections: ScriptSection[] = [
  {
    title: '1. Otevření',
    content:
      '„Dobrý den, tady [Vaše jméno] ze studia LVXOR DESIGN. Volám ohledně vašeho webu — narazil jsem na něj při průzkumu a chtěl bych vám nezávisle posoudit, jestli vám pomáhá v podnikání, nebo vás naopak brzdí. Máte 2 minuty?“',
  },
  {
    title: '2. Value prop',
    content:
      '„Specializujeme se na weby, které prodávají — nejen hezky vypadají. Děláme to pro klienty v podobném oboru. Díky redizajnu a SEO jsme klientům zvýšili poptávky v průměru o 40 % během 3 měsíců.“',
  },
  {
    title: '3. Kvalifikace',
    content:
      '„Jak jste spokojeni s vaším současným webem? Dostáváte přes něj pravidelně poptávky, nebo by to chtělo zlepšit?“',
  },
  {
    title: '4. Call to Action',
    content:
      '„Udělejme si 15minutový call, kde vám ukážu 3 konkrétní věci, které bychom na vašem webu zlepšili. Co říkáte na příští týden — vyhovuje vám spíš úterý nebo středa dopoledne?“',
  },
];

export function getScript(): ScriptSection[] {
  if (typeof window === 'undefined') return defaultSections;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ScriptSection[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return defaultSections;
}

export function saveScript(sections: ScriptSection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
}

export function resetScript(): void {
  localStorage.removeItem(STORAGE_KEY);
}
