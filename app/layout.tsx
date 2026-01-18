import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Salience - AI Automation for Private Practices',
  description: 'Run your practice like you have 10 versions of yourself. AI that handles client intake, follow-ups, scheduling, and admin work for insurance agencies, healthcare practices, and professional services.',
  keywords: ['AI automation', 'private practice', 'insurance agency', 'healthcare automation', 'client intake', 'scheduling automation', 'business automation'],
  authors: [{ name: 'Aqeel Ali' }],
  openGraph: {
    title: 'Salience - AI Automation for Private Practices',
    description: 'Run your practice like you have 10 versions of yourself. AI-powered automation for client intake, scheduling, and administrative tasks.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-[#0a0a0a] ${inter.className}`}
    >
      <body className="min-h-[100dvh] bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
