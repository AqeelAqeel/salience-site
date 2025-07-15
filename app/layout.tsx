import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Salience - Modern Landing Page',
  description: 'A beautiful and modern landing page built with Next.js and Tailwind CSS.'
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
      className={`bg-gray-950/15 text-white ${inter.className}`}
    >
      <body className="min-h-[100dvh] bg-gradient-to-b from-gray-900/15 to-black/15">
        {children}
      </body>
    </html>
  );
}
