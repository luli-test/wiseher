import React from 'react';
import { TREE_STAGES } from '../constants';

/**
 * TreeVisualizer: Organic SVG representation of the relationship health.
 * Stages:
 * 1. bare: bare branches, winter dormancy, boundary distress
 * 2. budding: tender emerging green buds, new connection
 * 3. leafy: steady, rounded, healthy foliage
 * 4. blooming: vibrant flowers, deep warmth and mutual respect
 * 5. flourishing: blooming with birds and fluttering butterflies
 *
 * Absolutely NO human faces or avatars.
 */
export default function TreeVisualizer({
  stage = 'budding',
  size = 'md',
  animated = true,
  showStageLabel = false
}) {
  const currentStageInfo = TREE_STAGES[stage] || TREE_STAGES.budding;

  // Sizing configurations
  const dimensions = {
    sm: { width: 80, height: 80, viewBox: '0 0 100 100' },
    md: { width: 140, height: 140, viewBox: '0 0 160 160' },
    lg: { width: 220, height: 220, viewBox: '0 0 200 200' },
  }[size] || { width: 140, height: 140, viewBox: '0 0 160 160' };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className={`relative ${animated ? 'animate-gentle-sway' : ''}`}>
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-700 ease-out drop-shadow-sm"
        >
          {/* Defs for gradients & filters */}
          <defs>
            {/* Trunk Gradient */}
            <linearGradient id="trunkGrad" x1="80" y1="60" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8D7B68" />
              <stop offset="100%" stopColor="#5E4E42" />
            </linearGradient>

            {/* Leaf Gradient 1 */}
            <linearGradient id="leafGradMain" x1="40" y1="40" x2="120" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8DA489" />
              <stop offset="100%" stopColor="#546C50" />
            </linearGradient>

            {/* Leaf Gradient 2 (Highlights) */}
            <linearGradient id="leafGradLight" x1="60" y1="30" x2="100" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B1C2AE" />
              <stop offset="100%" stopColor="#6E886A" />
            </linearGradient>

            {/* Earth Ground Gradient */}
            <linearGradient id="earthGrad" x1="80" y1="140" x2="80" y2="155" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EAE1D7" />
              <stop offset="100%" stopColor="#D5C4B4" />
            </linearGradient>

            {/* Aura Glow */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Aura */}
          <circle cx="80" cy="80" r="70" fill="url(#sunGlow)" />

          {/* Gentle Soil Mound */}
          <ellipse cx="80" cy="146" rx="42" ry="7" fill="url(#earthGrad)" />
          <path d="M 60 146 Q 80 143 100 146" stroke="#B8A08C" strokeWidth="1.5" strokeLinecap="round" />

          {/* ================= STAGE: BARE ================= */}
          {stage === 'bare' && (
            <g className="transition-opacity duration-500">
              {/* Trunk and Bare Main Branches */}
              <path
                d="M 75 146 C 76 125 74 105 77 85 C 78 72 73 60 65 50"
                stroke="url(#trunkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 77 85 C 82 74 92 62 102 52"
                stroke="url(#trunkGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 80 146 C 82 120 83 95 81 85"
                stroke="url(#trunkGrad)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Fine Twigs */}
              <path d="M 68 54 Q 60 48 55 42" stroke="#8D7B68" strokeWidth="3" strokeLinecap="round" />
              <path d="M 70 65 Q 60 62 52 64" stroke="#8D7B68" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 94 60 Q 106 58 114 62" stroke="#8D7B68" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 100 54 Q 108 44 116 40" stroke="#8D7B68" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 77 75 Q 85 68 88 56" stroke="#8D7B68" strokeWidth="2.5" strokeLinecap="round" />

              {/* Few fallen dry leaves on the ground */}
              <ellipse cx="62" cy="146" rx="3.5" ry="1.5" fill="#B8A08C" transform="rotate(-15 62 146)" />
              <ellipse cx="98" cy="147" rx="3" ry="1.2" fill="#D5C4B4" transform="rotate(20 98 147)" />
            </g>
          )}

          {/* ================= STAGE: BUDDING ================= */}
          {stage === 'budding' && (
            <g className="transition-opacity duration-500">
              {/* Trunk */}
              <path
                d="M 76 146 C 77 125 76 102 78 88 C 80 75 75 66 68 56"
                stroke="url(#trunkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 78 88 C 84 78 94 68 100 60"
                stroke="url(#trunkGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path d="M 78 98 Q 88 90 94 82" stroke="url(#trunkGrad)" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 74 95 Q 64 88 58 80" stroke="url(#trunkGrad)" strokeWidth="3" strokeLinecap="round" />

              {/* Tender Leaf Buds */}
              <circle cx="67" cy="54" r="5" fill="#8DA489" />
              <circle cx="101" cy="58" r="4.5" fill="#8DA489" />
              <circle cx="94" cy="80" r="4" fill="#A3B899" />
              <circle cx="57" cy="78" r="4" fill="#A3B899" />
              <circle cx="78" cy="46" r="5.5" fill="#6E886A" />

              {/* Little sprout leaves */}
              <path d="M 78 46 C 74 38 82 34 82 44 Z" fill="#6E886A" />
              <path d="M 67 54 C 59 50 63 42 70 48 Z" fill="#8DA489" />
              <path d="M 101 58 C 109 54 107 46 99 52 Z" fill="#8DA489" />
            </g>
          )}

          {/* ================= STAGE: LEAFY ================= */}
          {(stage === 'leafy' || stage === 'blooming' || stage === 'flourishing') && (
            <g className="transition-opacity duration-500">
              {/* Trunk */}
              <path
                d="M 75 146 C 77 122 76 105 78 92 C 81 78 85 70 85 70"
                stroke="url(#trunkGrad)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path d="M 77 100 Q 64 85 58 78" stroke="url(#trunkGrad)" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 80 96 Q 96 84 104 76" stroke="url(#trunkGrad)" strokeWidth="4.5" strokeLinecap="round" />

              {/* Canopy Clusters (Sage Greens) */}
              <ellipse cx="80" cy="62" rx="36" ry="32" fill="url(#leafGradMain)" opacity="0.95" />
              <ellipse cx="60" cy="70" rx="26" ry="24" fill="url(#leafGradMain)" />
              <ellipse cx="102" cy="70" rx="26" ry="24" fill="url(#leafGradMain)" />
              <ellipse cx="78" cy="48" rx="28" ry="24" fill="url(#leafGradLight)" />
              <ellipse cx="62" cy="54" rx="18" ry="16" fill="url(#leafGradLight)" opacity="0.9" />
              <ellipse cx="96" cy="54" rx="20" ry="17" fill="url(#leafGradLight)" opacity="0.9" />
            </g>
          )}

          {/* ================= STAGE: BLOOMING ================= */}
          {(stage === 'blooming' || stage === 'flourishing') && (
            <g className="transition-opacity duration-500">
              {/* Blossom 1 (Top Center) */}
              <g transform="translate(76, 42)">
                <circle cx="0" cy="-4" r="3" fill="#EBB4A4" />
                <circle cx="4" cy="0" r="3" fill="#EBB4A4" />
                <circle cx="0" cy="4" r="3" fill="#EBB4A4" />
                <circle cx="-4" cy="0" r="3" fill="#EBB4A4" />
                <circle cx="0" cy="0" r="2.5" fill="#D26B50" />
              </g>

              {/* Blossom 2 (Left Mid) */}
              <g transform="translate(56, 62)">
                <circle cx="0" cy="-3.5" r="2.8" fill="#F4D4CA" />
                <circle cx="3.5" cy="0" r="2.8" fill="#F4D4CA" />
                <circle cx="0" cy="3.5" r="2.8" fill="#F4D4CA" />
                <circle cx="-3.5" cy="0" r="2.8" fill="#F4D4CA" />
                <circle cx="0" cy="0" r="2.2" fill="#E07A5F" />
              </g>

              {/* Blossom 3 (Right Mid) */}
              <g transform="translate(104, 60)">
                <circle cx="0" cy="-3.5" r="2.8" fill="#EBB4A4" />
                <circle cx="3.5" cy="0" r="2.8" fill="#EBB4A4" />
                <circle cx="0" cy="3.5" r="2.8" fill="#EBB4A4" />
                <circle cx="-3.5" cy="0" r="2.8" fill="#EBB4A4" />
                <circle cx="0" cy="0" r="2.2" fill="#D26B50" />
              </g>

              {/* Blossom 4 (Upper Left) */}
              <g transform="translate(68, 50)">
                <circle cx="0" cy="-3" r="2.5" fill="#FDF7F5" />
                <circle cx="3" cy="0" r="2.5" fill="#FDF7F5" />
                <circle cx="0" cy="3" r="2.5" fill="#FDF7F5" />
                <circle cx="-3" cy="0" r="2.5" fill="#FDF7F5" />
                <circle cx="0" cy="0" r="2" fill="#EBB4A4" />
              </g>

              {/* Blossom 5 (Upper Right) */}
              <g transform="translate(94, 48)">
                <circle cx="0" cy="-3" r="2.5" fill="#FAECE7" />
                <circle cx="3" cy="0" r="2.5" fill="#FAECE7" />
                <circle cx="0" cy="3" r="2.5" fill="#FAECE7" />
                <circle cx="-3" cy="0" r="2.5" fill="#FAECE7" />
                <circle cx="0" cy="0" r="2" fill="#DE8B74" />
              </g>

              {/* Blossom 6 (Lower Center) */}
              <g transform="translate(82, 74)">
                <circle cx="0" cy="-3" r="2.5" fill="#EBB4A4" />
                <circle cx="3" cy="0" r="2.5" fill="#EBB4A4" />
                <circle cx="0" cy="3" r="2.5" fill="#EBB4A4" />
                <circle cx="-3" cy="0" r="2.5" fill="#EBB4A4" />
                <circle cx="0" cy="0" r="2" fill="#D26B50" />
              </g>

              {/* Floating Petal */}
              <ellipse cx="118" cy="88" rx="3.5" ry="2" fill="#EBB4A4" transform="rotate(35 118 88)" opacity="0.8" />
              <ellipse cx="42" cy="85" rx="3" ry="1.8" fill="#F4D4CA" transform="rotate(-25 42 85)" opacity="0.7" />
            </g>
          )}

          {/* ================= STAGE: FLOURISHING (BIRDS & BUTTERFLIES) ================= */}
          {stage === 'flourishing' && (
            <g className="transition-opacity duration-500">
              {/* Fluttering Butterfly 1 (Left Upper) */}
              <g transform="translate(36, 42) rotate(-15)">
                {/* Left wing */}
                <ellipse cx="-4" cy="-4" rx="5" ry="3.5" fill="#E07A5F" opacity="0.9" />
                <ellipse cx="-3" cy="2" rx="3.5" ry="2.5" fill="#DE8B74" opacity="0.8" />
                {/* Right wing */}
                <ellipse cx="4" cy="-4" rx="5" ry="3.5" fill="#E07A5F" opacity="0.9" />
                <ellipse cx="3" cy="2" rx="3.5" ry="2.5" fill="#DE8B74" opacity="0.8" />
                {/* Body */}
                <line x1="0" y1="-6" x2="0" y2="4" stroke="#4A3E36" strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Fluttering Butterfly 2 (Right Upper) */}
              <g transform="translate(126, 46) rotate(20)">
                <ellipse cx="-3.5" cy="-3.5" rx="4.5" ry="3" fill="#F4A261" opacity="0.9" />
                <ellipse cx="3.5" cy="-3.5" rx="4.5" ry="3" fill="#F4A261" opacity="0.9" />
                <line x1="0" y1="-5" x2="0" y2="3" stroke="#4A3E36" strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Songbird Perched on High Branch */}
              <g transform="translate(108, 44)">
                {/* Bird Body */}
                <ellipse cx="0" cy="0" rx="6" ry="4" fill="#D26B50" />
                {/* Head */}
                <circle cx="-5" cy="-3" r="3.2" fill="#BF5539" />
                {/* Beak */}
                <polygon points="-8,-3 -11,-2.5 -8,-1" fill="#E5A122" />
                {/* Tail */}
                <polygon points="4,-1 11,2 6,2" fill="#9E422B" />
                {/* Eye dot */}
                <circle cx="-6" cy="-3.5" r="0.6" fill="#FAF7F2" />
              </g>

              {/* Sparkle notes */}
              <circle cx="102" cy="30" r="1.5" fill="#E5A122" opacity="0.75" />
              <circle cx="50" cy="28" r="1.2" fill="#E5A122" opacity="0.6" />
            </g>
          )}
        </svg>
      </div>

      {showStageLabel && (
        <div className="mt-1 text-center">
          <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-sand-200/80 text-sand-800">
            {currentStageInfo.label}
          </span>
        </div>
      )}
    </div>
  );
}
