import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Heart,
  Target,
  MessageSquareQuote,
  Copy,
  Check,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import LeafSprig from './LeafSprig';
import { generateGardenCoachSynthesis } from '../services/gemini';

const CACHE_KEY = 'wiseher_garden_coach_cache';

export default function GardenCoachView({
  contacts = [],
  checkIns = [],
  twinSnapshots = {}
}) {
  const [coachData, setCoachData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopiedNvc, setHasCopiedNvc] = useState(false);

  // Optional video URL from environment variable
  const coachVideoUrl = import.meta.env.VITE_COACH_VIDEO_URL;

  // Load from cache or generate on initial mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setCoachData(JSON.parse(cached));
      } else {
        handleRefresh();
      }
    } catch (e) {
      handleRefresh();
    }
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await generateGardenCoachSynthesis(contacts, checkIns, twinSnapshots);
      setCoachData(result);
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    } catch (err) {
      console.error('Garden Coach refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyNvc = () => {
    if (!coachData?.nvc_template) return;
    navigator.clipboard.writeText(coachData.nvc_template);
    setHasCopiedNvc(true);
    setTimeout(() => setHasCopiedNvc(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Coach Introduction Header */}
      <div className="bg-gradient-to-br from-terracotta-50 via-white to-sand-50 rounded-3xl p-5 border border-terracotta-100/80 shadow-xs relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <LeafSprig size={140} />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-sm">
              <LeafSprig size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-sand-900">
                  Garden Coach
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800 border border-terracotta-200">
                  Constanze
                </span>
              </div>
              <p className="text-xs text-sand-600 mt-0.5">
                Holistic reflection over your relational habits and needs
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 active:scale-95 px-3 py-1.5 rounded-xl border border-terracotta-200 transition disabled:opacity-50"
            title="Refresh Coach Synthesis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Optional Coach Video (render nothing if unset) */}
        {coachVideoUrl && coachVideoUrl.trim() !== '' && (
          <div className="mt-4 rounded-2xl overflow-hidden bg-sand-900 border border-sand-300 shadow-sm relative">
            <div className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs z-10 border border-white/20">
              pre-rendered for demo
            </div>
            <video
              src={coachVideoUrl}
              controls
              className="w-full aspect-video object-cover"
              poster=""
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Affirming Headline */}
        {coachData?.summary_headline && (
          <div className="mt-4 pt-4 border-t border-terracotta-100/60">
            <p className="text-sm font-serif italic text-sand-800 leading-relaxed">
              "{coachData.summary_headline}"
            </p>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && !coachData && (
        <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-xs space-y-4 animate-pulse">
          <div className="h-4 bg-sand-200 rounded w-1/3"></div>
          <div className="h-16 bg-sand-100 rounded-2xl"></div>
          <div className="h-24 bg-sand-100 rounded-2xl"></div>
        </div>
      )}

      {coachData && (
        <>
          {/* Card 1: Repeating Patterns Across Relationships */}
          <div className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-warmamber-50 text-warmamber-700 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-sm text-sand-900">
                Patterns Across My Relationships
              </h3>
            </div>
            <p className="text-[11px] text-sand-500">
              Reflective observations about your own habits, timing, and needs — never clinical labels.
            </p>

            <div className="space-y-2.5 pt-1">
              {(coachData.cross_relationship_patterns || []).map((pattern, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-sand-50 rounded-2xl border border-sand-200/60 text-xs text-sand-800 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-sand-200 text-sand-700 flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="flex-1">{pattern}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: 3 Observed Strengths */}
          <div className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sage-50 text-sage-700 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-sm text-sand-900">
                3 Strengths You Bring
              </h3>
            </div>

            <div className="space-y-2 pt-1">
              {(coachData.strengths || []).map((strength, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-sage-50/70 border border-sage-200/70 rounded-2xl flex items-start gap-2.5"
                >
                  <ShieldCheck className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-sage-900 leading-relaxed font-medium">
                    {strength}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: 1 Thing to Practise */}
          <div className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-terracotta-50 text-terracotta-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-sm text-sand-900">
                1 Thing to Practise
              </h3>
            </div>

            <div className="p-3.5 bg-terracotta-50/60 border border-terracotta-200/70 rounded-2xl">
              <p className="text-xs text-terracotta-900 leading-relaxed">
                {coachData.practice_area}
              </p>
            </div>
          </div>

          {/* Card 4: Nonviolent-Communication Sentence Template */}
          <div className="bg-sand-900 text-sand-50 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-terracotta-400" />
                <h3 className="font-serif font-bold text-sm text-sand-100">
                  NVC Sentence for Your Next Conversation
                </h3>
              </div>
              <button
                onClick={handleCopyNvc}
                className="flex items-center gap-1 text-[11px] font-medium text-sand-300 hover:text-white bg-sand-800 hover:bg-sand-700 px-2.5 py-1 rounded-xl transition"
                title="Copy Nonviolent Communication Template"
              >
                {hasCopiedNvc ? (
                  <>
                    <Check className="w-3 h-3 text-sage-400" />
                    <span className="text-sage-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-sand-800/80 border border-sand-700/80 rounded-2xl">
              <p className="text-xs text-sand-200 font-serif leading-relaxed italic">
                "{coachData.nvc_template}"
              </p>
            </div>

            <p className="text-[10px] text-sand-400 leading-tight">
              Formula: When <span className="text-sand-300">[observation]</span>, I feel <span className="text-sand-300">[emotion]</span> because I need <span className="text-sand-300">[need]</span>. Would you be willing to <span className="text-sand-300">[request]</span>?
            </p>
          </div>
        </>
      )}
    </div>
  );
}
