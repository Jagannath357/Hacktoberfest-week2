import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AppNav } from '@/components/app-nav';
import { ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SoloBooks AI — Your business finances. Organized privately.',
  description:
    'Turn receipts and invoices into organized financial records with local AI. Keep your documents on your computer and stay in control of your data.',
  keywords: [
    'SoloBooks AI',
    'freelance accounting',
    'privacy first finances',
    'local AI',
    'Ollama',
    'receipt OCR',
    'invoice management',
    'Hacktoberfest',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white`}
      >
        <ThemeProvider>
          <AppNav />
          <main className="flex-1 w-full">{children}</main>
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 py-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong>SoloBooks AI</strong> — Zero cloud dependencies. Your financial data stays local.
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <Link href="/settings" className="hover:underline">
                  Privacy Audit
                </Link>
                <span>•</span>
                <Link href="/reports" className="hover:underline">
                  Export Data
                </Link>
                <span>•</span>
                <span>Hacktoberfest 2026 Week 2: Side Hustle</span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
