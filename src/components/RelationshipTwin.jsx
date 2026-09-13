import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, Sparkles, History, ChevronRight, Lock, RefreshCw, Share2, Check, Wrench, Info, Pencil, Trash2 } from 'lucide-react';
import TreeVisualizer from './TreeVisualizer';
import PatternCheck from './PatternCheck';
import SafetyBanner from './SafetyBanner';
import { INTENTS, getStreakInfo } from '../constants';
import { evaluateSafety } from '../services/safety';
import { anonymize } from '../services/anonymizer';
import { GEMINI_MODEL } from '../services/gemini';

/**
 * RelationshipTwin: The heart of WiseHer.
 * Displays living profile per contact, observations linked to check-ins,
 * "what changed since last time", and interactive timeline scrubbing.
 */
export default function RelationshipTwin({
  contact,
  checkIns = [],
  twinSnapshots = [],
  onBack,
  onOpenNewCheckIn,
  onRegenerate,
  isRegenerating = false,
  onEditCheckIn,
  onDeleteCheckIn
}) {
  const intentInfo = INTENTS[contact.intent] || INTENTS.dating;
  const streak = useMemo(() => getStreakInfo(checkIns), [checkIns]);
  const safetyStatus = useMemo(() => evaluateSafety(checkIns), [checkIns]);

  // Sort snapshots chronologically
  const sortedSnapshots = useMemo(() => {
    return [...twinSnapshots].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [twinSnapshots]);

  // Current active index on the timeline (defaults to latest snapshot)
  const [activeSnapshotIndex, setActiveSnapshotIndex] = useState(
    sortedSnapshots.length > 0 ? sortedSnapshots.length - 1 : 0
  );

  // Tab view: 'twin' or 'checkins'
  const [activeTab, setActiveTab] = useState('twin');
  const [selectedCheckInForModal, setSelectedCheckInForModal] = useState(null);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  const handleShareAnonymizedSummary = async () => {
    if (!currentSnapshot) return;

    const green = (currentSnapshot.patterns?.green || []).map(p => `• [Green] ${p}`).join('\n');
    const yellow = (currentSnapshot.patterns?.yellow || []).map(p => `• [Yellow] ${p}`).join('\n');
    const red = (currentSnapshot.patterns?.red || []).map(p => `• [Red] ${p}`).join('\n');
    const obs = (currentSnapshot.observations || []).map(o => `• ${o}`).join('\n');

    const raw = `WiseHer - Relationship Reflection Summary (Anonymized)
Snapshot Date: ${currentSnapshot.date}
Intent: ${intentInfo.label}
Tree Stage: ${currentSnapshot.stage || currentSnapshot.tree_stage}

Snapshot Headline:
${currentSnapshot.headline}

What Changed Since Last Time:
${currentSnapshot.whatChanged || currentSnapshot.what_changed || 'Initial check-in baseline.'}

Key Observations:
${obs || 'None'}

Identified Behavioral Patterns:
${[green, yellow, red].filter(Boolean).join('\n') || 'None'}

Reflection Question:
${currentSnapshot.reflectionQuestion || currentSnapshot.reflection_question || 'N/A'}

Next Step Aligned with Intent:
${currentSnapshot.nextStep || currentSnapshot.next_step || 'N/A'}
`;

    // Strictly anonymize before copying to clipboard (never de-anonymized)
    const { text: anonymizedSummary } = await anonymize(raw, [contact.nickname]);
    await navigator.clipboard.writeText(anonymizedSummary);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2500);
  };

  const currentSnapshot = sortedSnapshots[activeSnapshotIndex] || {
    stage: 'budding',
    headline: 'Initial Connection',
    observations: ['No observations recorded yet.'],
    whatChanged: 'First check-in is ready to be added.',
    patterns: { green: [], yellow: [], red: [] },
    reflectionQuestion: 'What are you hoping to discover with this person?',
    nextStep: 'Add your first check-in after your next interaction.'
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sand-800 hover:text-terracotta-600 bg-sand-200/60 hover:bg-sand-200 px-3 py-1.5 rounded-full transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Garden</span>
        </button>

        <div className="flex items-center gap-2">
          {contact.isDemo && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-warmamber-700 border border-warmamber-200">
              Demo Contact
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sand-500 bg-sand-200/50 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3 text-sage-600" />
            <span>anonymized before AI</span>
          </span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-sand-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-sand-900">
                {contact.nickname}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${intentInfo.color}`}>
                {intentInfo.icon} {intentInfo.label}
              </span>
            </div>
            <p className="text-xs text-sand-500 mt-0.5">
              Intent: {intentInfo.description}
            </p>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sand-100 text-sand-800 border border-sand-200">
              <span>{streak.emoji}</span>
              <span>{streak.label}</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-sand-200 pt-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('twin')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'twin'
                ? 'border-terracotta-500 text-terracotta-600 font-semibold'
                : 'border-transparent text-sand-500 hover:text-sand-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Relationship Twin</span>
          </button>
          <button
            onClick={() => setActiveTab('checkins')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'checkins'
                ? 'border-terracotta-500 text-terracotta-600 font-semibold'
                : 'border-transparent text-sand-500 hover:text-sand-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Check-in Log ({checkIns.length})</span>
          </button>
        </div>
      </div>

      {/* Safety Alert (Overrides pattern check if danger indicated) */}
      {safetyStatus.isTriggered && (
        <SafetyBanner reason={safetyStatus.detectedTrigger} />
      )}

      {/* TAB 1: RELATIONSHIP TWIN & TIMELINE */}
      {activeTab === 'twin' && (
        <div className="space-y-4">
          {/* Tree Visualization with Stage Label */}
          <div className="bg-white border border-sand-200/90 rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-3 left-3 text-[11px] font-medium text-sand-400">
              Relationship Health Stage
            </div>

            <TreeVisualizer
              stage={currentSnapshot.stage || 'budding'}
              size="lg"
              animated={true}
              showStageLabel={true}
            />

            <p className="text-xs text-sand-500 mt-2 max-w-xs mx-auto">
              Tree reflects the green/yellow/red mutuality balance over time.
            </p>
          </div>

          {/* TIMELINE SCRUBBER (The Heart of the App) */}
          <div className="bg-white border border-sand-200/90 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-terracotta-500" />
                <h3 className="font-serif font-semibold text-sm text-sand-900">
                  Timeline Scrubber
                </h3>
              </div>
              <span className="text-xs text-terracotta-700 font-medium bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                {currentSnapshot.weekLabel || `Check-in ${activeSnapshotIndex + 1}`}
              </span>
            </div>

            <p className="text-xs text-sand-500">
              Scrub through the weeks to watch how communication patterns and the tree evolved.
            </p>

            {/* Slider Scrubber */}
            {sortedSnapshots.length > 1 && (
              <div className="pt-2 pb-1">
                <input
                  type="range"
                  min="0"
                  max={sortedSnapshots.length - 1}
                  step="1"
                  value={activeSnapshotIndex}
                  onChange={(e) => setActiveSnapshotIndex(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-sand-200 rounded-lg appearance-none cursor-pointer accent-terracotta-600 focus:outline-none"
                />

                {/* Milestone pills */}
                <div className="flex justify-between items-center mt-2 px-1">
                  {sortedSnapshots.map((snap, idx) => (
                    <button
                      key={snap.id || idx}
                      onClick={() => setActiveSnapshotIndex(idx)}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition ${
                        activeSnapshotIndex === idx
                          ? 'bg-terracotta-600 text-white font-semibold shadow-xs'
                          : 'text-sand-500 hover:text-sand-800 hover:bg-sand-100'
                      }`}
                    >
                      {snap.weekLabel || `W${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LIVING TWIN OBSERVATIONS CARD */}
          <div className="bg-white border border-sand-200/90 rounded-2xl p-4 shadow-sm space-y-4">
            {/* Snapshot headline & Regenerate button */}
            <div className="border-b border-sand-100 pb-3 flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-sand-400 font-medium">
                    Snapshot • {currentSnapshot.date}
                  </span>
                  {currentSnapshot.isAIGenerated ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2 py-0.5 rounded-full shadow-2xs">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Generated by Gemini ({currentSnapshot.model || GEMINI_MODEL})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full shadow-2xs">
                      <Wrench className="w-3 h-3 text-slate-500" />
                      Offline fallback (rule-based)
                    </span>
                  )}
                </div>
                <h3 className="text-base font-serif font-bold text-sand-900 mt-1">
                  {currentSnapshot.headline}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Share anonymized summary button */}
                <button
                  onClick={handleShareAnonymizedSummary}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sand-700 bg-sand-100 hover:bg-sand-200 border border-sand-300 px-2.5 py-1.5 rounded-xl transition active:scale-95"
                  title="Copy anonymized summary to clipboard to share with a friend or therapist"
                >
                  {hasCopiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sage-600" />
                      <span className="text-sage-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Anonymized</span>
                    </>
                  )}
                </button>

                {onRegenerate && (
                  <button
                    onClick={() => onRegenerate(contact)}
                    disabled={isRegenerating || checkIns.length === 0}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 px-2.5 py-1.5 rounded-xl transition disabled:opacity-50"
                    title="Regenerate Relationship Twin using Gemini AI"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>{isRegenerating ? 'Analyzing...' : 'Regenerate'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Non-AI Rule-based banner if fallback */}
            {!currentSnapshot.isAIGenerated && (
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-xs text-slate-700 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 text-[11px]">Local Rule-based Reflection</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    This snapshot was computed using local heuristic rules without AI model inference.
                  </p>
                </div>
              </div>
            )}

            {/* What Changed Line */}
            {currentSnapshot.whatChanged && (
              <div className="bg-sand-50/90 border-l-3 border-terracotta-500 rounded-r-xl p-3">
                <span className="text-[10px] font-bold text-terracotta-700 tracking-wider uppercase block mb-0.5">
                  What changed since last time
                </span>
                <p className="text-xs text-sand-800 leading-relaxed italic">
                  "{currentSnapshot.whatChanged}"
                </p>
              </div>
            )}

            {/* 3-5 Short Observations linked to check-ins */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold tracking-wider text-sand-500 uppercase">
                Observations from your check-ins
              </h4>
              <ul className="space-y-1.5">
                {(currentSnapshot.observations || []).map((obs, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-sand-800 flex items-start gap-2 bg-sand-50/50 p-2 rounded-xl border border-sand-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3 Categories: Green, Yellow, Red Patterns with "can be a sign of" phrasing */}
            <div className="pt-2 border-t border-sand-100">
              <PatternCheck patterns={currentSnapshot.patterns || { green: [], yellow: [], red: [] }} />
            </div>

            {/* Reflection question */}
            {currentSnapshot.reflectionQuestion && (
              <div className="p-3.5 bg-sage-50/70 border border-sage-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-sage-800 tracking-wider uppercase block mb-1">
                  Gentle Reflection Question
                </span>
                <p className="text-xs text-sand-900 font-serif italic leading-relaxed">
                  "{currentSnapshot.reflectionQuestion}"
                </p>
              </div>
            )}

            {/* Intent-aligned next step */}
            {currentSnapshot.nextStep && (
              <div className="p-3.5 bg-sand-100/70 border border-sand-200 rounded-2xl flex items-start gap-2.5">
                <div className="p-1.5 bg-terracotta-100 text-terracotta-700 rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sand-500 tracking-wider uppercase block">
                    Next step aligned with "{contact.intent}"
                  </span>
                  <p className="text-xs text-sand-800 font-medium leading-relaxed mt-0.5">
                    {currentSnapshot.nextStep}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAST CHECK-INS LIST */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif font-semibold text-sm text-sand-900">
              Recorded Check-ins ({checkIns.length})
            </h3>
            <span className="text-xs text-sand-500">Chronological history</span>
          </div>

          {checkIns.length === 0 ? (
            <div className="bg-white border border-sand-200 rounded-2xl p-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-sand-400 mx-auto" />
              <p className="text-xs text-sand-600">No check-ins logged for this person yet.</p>
              <button
                onClick={onOpenNewCheckIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracotta-600 text-white rounded-xl text-xs font-medium hover:bg-terracotta-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log first check-in</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {checkIns.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white border border-sand-200/90 rounded-2xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-sand-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-sand-800 font-serif">
                        {item.date}
                      </span>
                      {item.weekLabel && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sand-100 text-sand-600 font-medium">
                          {item.weekLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-sand-400">Feeling:</span>
                        <span className="font-bold text-terracotta-600">
                          {item.rating}/5
                        </span>
                      </div>
                      {/* Edit and Delete Actions */}
                      <div className="flex items-center gap-0.5 border-l border-sand-200 pl-1.5 ml-1">
                        <button
                          onClick={() => onEditCheckIn && onEditCheckIn(item)}
                          className="p-1 text-sand-400 hover:text-sand-800 hover:bg-sand-100 rounded-md transition"
                          title="Edit check-in"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCheckIn && onDeleteCheckIn(item.id)}
                          className="p-1 text-sand-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete check-in"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-sand-600 block text-[11px]">1. What happened:</span>
                      <p className="text-sand-800 pl-2 leading-relaxed">{item.whatHappened}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-sand-600 block text-[11px]">2. How I felt:</span>
                      <p className="text-sand-800 pl-2 leading-relaxed">{item.feeling}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-sand-600 block text-[11px]">3. What stood out:</span>
                      <p className="text-sand-800 pl-2 leading-relaxed">{item.standout}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-sand-600 block text-[11px]">4. Communication & Tone:</span>
                      <p className="text-sand-800 pl-2 leading-relaxed">{item.communicationDynamics}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Add Check-In CTA Bar */}
      <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-20">
        <button
          onClick={onOpenNewCheckIn}
          className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium py-3 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Guided Check-In for {contact.nickname}</span>
        </button>
      </div>
    </div>
  );
}
