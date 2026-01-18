'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap, Phone, Mail } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 md:w-10 md:h-10 relative transform transition-transform duration-300 group-hover:scale-110">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg transform rotate-45"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-black transform -rotate-45" />
              </div>
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">Salience</span>
          </Link>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="mailto:aqeel@aqeelali.com"
              className="flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">aqeel@aqeelali.com</span>
            </a>
            <a
              href="tel:+14087180712"
              className="flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">+1 (408) 718-0712</span>
            </a>
            <a href="mailto:aqeel@aqeelali.com?subject=I'm ready to make more money and get my time back">
              <Button className="cta-button text-sm px-4 py-2 rounded-lg font-medium">
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            <a
              href="mailto:aqeel@aqeelali.com"
              className="flex items-center gap-3 text-white/70 hover:text-amber-400 transition-colors py-2"
            >
              <Mail className="w-5 h-5" />
              <span>aqeel@aqeelali.com</span>
            </a>
            <a
              href="tel:+14087180712"
              className="flex items-center gap-3 text-white/70 hover:text-amber-400 transition-colors py-2"
            >
              <Phone className="w-5 h-5" />
              <span>+1 (408) 718-0712</span>
            </a>
            <div className="pt-4 border-t border-white/10">
              <a
                href="mailto:aqeel@aqeelali.com?subject=I'm ready to make more money and get my time back"
                className="block w-full"
              >
                <Button className="w-full cta-button py-3 rounded-lg font-medium">
                  Get Started
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
