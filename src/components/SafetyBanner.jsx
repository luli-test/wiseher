import React from 'react';
import { PhoneCall, ShieldAlert, ExternalLink, HeartHandshake } from 'lucide-react';
import { HELPLINE_INFO } from '../services/safety';

/**
 * SafetyBanner: Shown calmly and respectfully when check-ins reflect indicators
 * of violence, threats, or coercive control.
 * Displays the German helpline 116 016 instead of a pattern analysis.
 */
export default function SafetyBanner({ reason = null }) {
  return (
    <div className="bg-sand-50 border-2 border-warmred-500/40 rounded-2xl p-5 shadow-sm space-y-4 my-3 text-sand-900">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-warmred-50 text-warmred-600 mt-0.5">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-base text-sand-900">
            Your safety and well-being come first
          </h3>
          <p className="text-xs text-sand-700 mt-1 leading-relaxed">
            Your recent notes mention behaviors that go beyond relationship communication patterns
            and may indicate coercive control, threats, or risk to your physical or emotional safety.
            You do not have to navigate this alone.
          </p>
        </div>
      </div>

      {/* Helpline Contact Card */}
      <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-sand-500">
              Hilfetelefon Gewalt gegen Frauen (Germany)
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-serif font-bold text-warmred-600 tracking-wide">
                {HELPLINE_INFO.number}
              </span>
              <span className="text-xs text-sand-600">
                • 24/7 • Free • Anonymous
              </span>
            </div>
          </div>

          <a
            href={`tel:${HELPLINE_INFO.number.replace(/\s+/g, '')}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-warmred-600 hover:bg-warmred-700 text-white font-medium text-xs transition shadow-sm active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 116 016</span>
          </a>
        </div>

        <p className="text-[11px] text-sand-600 border-t border-sand-100 pt-2.5 flex items-center justify-between">
          <span>Advice in 18 languages, sign language, and online text chat.</span>
          <a
            href={HELPLINE_INFO.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-terracotta-600 hover:underline font-medium ml-2"
          >
            <span>hilfetelefon.de</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-sand-600">
        <HeartHandshake className="w-4 h-4 text-terracotta-500 flex-shrink-0" />
        <span>
          Pattern analysis is paused here to protect your emotional clarity. Trust your perception.
        </span>
      </div>
    </div>
  );
}
