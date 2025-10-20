import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Salience Event - Transform consciousness into creation',
  description: 'New AI Tools, reimagined Vector Editing, and Analytics updates with A/B testing, funnels, and click tracking. Available right now.'
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
