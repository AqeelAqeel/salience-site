'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'cross the bridge', href: '/cross-the-bridge' },
    { label: 'heaven\'s gate?', href: '/heavens-gate' },
    { label: 'chat analysis', href: '/chat-analysis' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 relative transform transition-transform duration-300 group-hover:scale-110">
              {/* Abstract sun logo */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg transform rotate-45"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-accent to-primary rounded-lg transform rotate-45 scale-75"></div>
            </div>
            <span className="text-2xl font-bold text-white">Salience</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white/70 hover:text-white transition-colors font-medium lowercase text-lg relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

        </div>
      </div>

    </header>
  );
};

export default Header; 