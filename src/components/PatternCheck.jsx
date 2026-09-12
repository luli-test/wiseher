import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, HelpCircle, Compass } from 'lucide-react';

/**
 * PatternCheck:
 * - Communication patterns grouped green / yellow / red
 * - Strictly phrased as "can be a sign of", never as a verdict
 * - Quoting the check-in it is based on
 * - Plus one reflection question and one next step aligned with intent
 */
export default function PatternCheck({
  patterns = { green: [], yellow: [], red: [] },
  reflectionQuestion = '',
  nextStep = '',
  intent = 'dating'
}) {
  const hasPatterns =
    (patterns.green && patterns.green.length > 0) ||
    (patterns.yellow && patterns.yellow.length > 0) ||
    (patterns.red && patterns.red.length > 0);

  return (
    <div className="space-y-4">
      {/* Pattern Classification */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold tracking-wider text-sand-500 uppercase flex items-center justify-between">
          <span>Communication Pattern Signals</span>
          <span className="text-[10px] font-normal text-sand-400 lowercase">
            phrased as tendencies, not verdicts
          </span>
        </h4>

        {/* Green Patterns */}
        {patterns.green && patterns.green.length > 0 && (
          <div className="bg-sage-50/70 border border-sage-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-sage-700 font-medium text-xs">
              <ShieldCheck className="w-4 h-4 text-sage-600 flex-shrink-0" />
              <span>Green Signals (Healthy mutuality & care)</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-xs text-sand-800 leading-relaxed">
              {patterns.green.map((p, idx) => (
                <li key={`green-${idx}`} className="leading-snug">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Yellow Patterns */}
        {patterns.yellow && patterns.yellow.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-warmamber-700 font-medium text-xs">
              <AlertTriangle className="w-4 h-4 text-warmamber-600 flex-shrink-0" />
              <span>Yellow Signals (Potential ambivalence or pace mismatch)</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-xs text-sand-800 leading-relaxed">
              {patterns.yellow.map((p, idx) => (
                <li key={`yellow-${idx}`} className="leading-snug">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red Patterns */}
        {patterns.red && patterns.red.length > 0 && (
          <div className="bg-red-50/80 border border-red-200/90 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-warmred-700 font-medium text-xs">
              <AlertCircle className="w-4 h-4 text-warmred-600 flex-shrink-0" />
              <span>Red Signals (Boundary strain, withdrawal, or deflection)</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-xs text-sand-800 leading-relaxed">
              {patterns.red.map((p, idx) => (
                <li key={`red-${idx}`} className="leading-snug">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasPatterns && (
          <p className="text-xs text-sand-500 italic p-2 bg-sand-50 rounded-lg">
            No distinct communication patterns identified yet. Add more check-ins to track recurring themes.
          </p>
        )}
      </div>

      {/* Coach Reflection Question */}
      {reflectionQuestion && (
        <div className="bg-sand-50 border border-sand-200/90 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-terracotta-700 font-medium text-xs">
            <HelpCircle className="w-4 h-4 text-terracotta-500 flex-shrink-0" />
            <span>Reflection for You</span>
          </div>
          <p className="text-xs italic text-sand-800 pl-6 leading-relaxed">
            "{reflectionQuestion}"
          </p>
        </div>
      )}

      {/* Next Step Aligned with Intent */}
      {nextStep && (
        <div className="bg-terracotta-50/60 border border-terracotta-200/70 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-terracotta-800 font-medium text-xs">
            <Compass className="w-4 h-4 text-terracotta-600 flex-shrink-0" />
            <span>Suggested Next Step (Aligned with {intent})</span>
          </div>
          <p className="text-xs text-sand-800 pl-6 leading-relaxed">
            {nextStep}
          </p>
        </div>
      )}
    </div>
  );
}
