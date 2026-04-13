"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export default function FooterSpotlight() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-xl font-bold">
              <span className="gold-accent">Salience</span>
            </p>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Custom AI admin systems for service businesses that live in calls, forms, and follow-ups.
            </p>
          </div>

          {/* Services */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-4">Services</p>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/services#healthcare" className="hover:text-blue-700 transition-colors">Healthcare</Link></li>
              <li><Link href="/services#real-estate" className="hover:text-blue-700 transition-colors">Real Estate</Link></li>
              <li><Link href="/services#insurance" className="hover:text-blue-700 transition-colors">Insurance</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-4">Company</p>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/case-studies" className="hover:text-blue-700 transition-colors">Case Studies</Link></li>
              <li><Link href="/team" className="hover:text-blue-700 transition-colors">Team</Link></li>
              <li><Link href="/referrals" className="hover:text-blue-700 transition-colors">Referrals</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-4">Contact</p>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <a href="tel:+14087180712" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                  <Phone className="w-4 h-4" />
                  +1 (408) 718-0712
                </a>
              </li>
              <li>
                <a href="mailto:aqeel@aqeelali.com" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                  <Mail className="w-4 h-4" />
                  aqeel@aqeelali.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; 2026 <span className="gold-accent font-semibold">Salience</span>. All rights reserved.
          </p>
          <Link
            href="/i-want-my-time-and-energy-back"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Chat with our AI assistant &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
