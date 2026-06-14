import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import AuthGate from '@/components/AuthGate';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LVXOR DESIGN — TERMINAL',
  description: 'Interní CRM studio LVXOR DESIGN pro správu leadů a cold calling',
  icons: {
    icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 28 28%22%3E%3Crect width=%2228%22 height=%2228%22 rx=%227%22 fill=%22%236366f1%22/%3E%3Cpath d=%22M14 4L5 16h8l-2 10 12-14h-8l1-8z%22 fill=%22white%22/%3E%3C/svg%3E',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="dark">
      <body className={`${outfit.className} min-h-screen antialiased`}>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
