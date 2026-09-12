import React from 'react';
import { RotateCcw, Smartphone, Monitor, Plus, HeartHandshake } from 'lucide-react';

import LeafSprig from './LeafSprig';

/**
 * Header: Brand header with tagline and key controls
 */
export default function Header({
  onResetDemo,
  onOpenAddContact,
  isPhonePreview,
  onTogglePhonePreview
}) {
  return (
    <header className="border-b border-sand-200/90 bg-sand-50/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <LeafSprig size={24} className="hover:rotate-6 transition-transform duration-300" />
            <h1 className="text-xl font-serif font-bold text-sand-900 tracking-tight">
              WiseHer
            </h1>
          </div>
          <p className="text-[11px] text-terracotta-700 font-medium tracking-wide">
            Know your patterns, trust your perception.
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5">
          {/* Phone preview toggle for desktop development */}
          <button
            onClick={onTogglePhonePreview}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-sand-600 hover:text-sand-900 bg-sand-200/60 hover:bg-sand-200 px-2.5 py-1.5 rounded-xl transition"
            title="Toggle phone viewport preview"
          >
            {isPhonePreview ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{isPhonePreview ? 'Full View' : 'Phone View'}</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetDemo}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-sand-600 hover:text-sand-900 bg-sand-200/60 hover:bg-sand-200 px-2.5 py-1.5 rounded-xl transition"
            title="Reset to 8-week demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xs:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
