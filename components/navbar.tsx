'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Phone, Mail } from 'lucide-react';

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Services',
    dropdown: [
      {
        label: 'AI Automation Consulting',
        href: '/services/consulting',
        description: 'Workflow audits and strategy planning',
      },
      {
        label: 'Custom AI Deployment',
        href: '/services/deployment',
        description: 'Tailored AI solutions for your practice',
      },
      {
        label: 'Managed AI Operations',
        href: '/services/managed',
        description: 'Ongoing support and optimization',
      },
    ],
  },
  {
    label: 'Products',
    dropdown: [
      {
        label: 'Insurance Automation',
        href: '/products/insurance',
        description: 'Full AI automation for insurance brokerages',
      },
      {
        label: 'Healthcare Automation',
        href: '/products/healthcare',
        description: 'AI solutions for healthcare practices',
      },
    ],
  },
  {
    label: 'Team',
    href: '/team',
  },
];

function DropdownMenu({
  items,
  isOpen,
  onClose
}: {
  items: DropdownItem[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-72 bg-[#141414] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      <div className="py-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="block px-4 py-3 hover:bg-white/5 transition-colors group"
          >
            <span className="text-white font-medium group-hover:text-amber-400 transition-colors">
              {item.label}
            </span>
            {item.description && (
              <span className="block text-sm text-white/50 mt-0.5">
                {item.description}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleMobileDropdown = (label: string) => {
    setMobileOpenDropdown(mobileOpenDropdown === label ? null : label);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src="/assets/assets-eye-logo.svg"
                alt="Salience Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">Salience</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className="flex items-center gap-1 px-4 py-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href || '/'}
                    className="px-4 py-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    {item.label}
                  </Link>
                )}
                {item.dropdown && (
                  <DropdownMenu
                    items={item.dropdown}
                    isOpen={openDropdown === item.label}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="mailto:aqeel@aqeelali.com"
              className="flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm hidden xl:inline">aqeel@aqeelali.com</span>
            </a>
            <a
              href="tel:+14087180712"
              className="flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm hidden xl:inline">+1 (408) 718-0712</span>
            </a>
            <a href="mailto:aqeel@aqeelali.com?subject=I'm ready to make more money and get my time back">
              <Button className="cta-button text-sm px-4 py-2 rounded-lg font-medium">
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => toggleMobileDropdown(item.label)}
                      className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                      <span className="font-medium">{item.label}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          mobileOpenDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {mobileOpenDropdown === item.label && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-amber-500/30 pl-4">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2 text-white/60 hover:text-amber-400 transition-colors"
                          >
                            <span className="font-medium">{subItem.label}</span>
                            {subItem.description && (
                              <span className="block text-xs text-white/40 mt-0.5">
                                {subItem.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || '/'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 text-white/80 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/5"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile Contact Links */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
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

export default Navbar;
