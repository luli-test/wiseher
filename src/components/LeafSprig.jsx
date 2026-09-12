import React from 'react';

/**
 * LeafSprig: Delicate, organic green sprig matching the brand aesthetic.
 * Slender stem with five vibrant soft green leaves.
 */
export default function LeafSprig({ className = "w-6 h-6", size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 drop-shadow-xs ${className}`}
    >
      {/* Slender main stem */}
      <path
        d="M 9 27 C 12 21 16 14 20 5"
        stroke="#4B633D"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Terminal top leaf */}
      <path
        d="M 20 5 C 18 1 23 0.5 24 3.5 C 24.8 6.5 21.5 7.5 20 5 Z"
        fill="#8EC954"
        stroke="#3F5532"
        strokeWidth="0.8"
      />

      {/* Top right leaf */}
      <path
        d="M 19 9 C 24 7 28 10 27 13.5 C 25.5 16 21 14 19 9 Z"
        fill="#A2DB68"
        stroke="#3F5532"
        strokeWidth="0.8"
      />

      {/* Mid left leaf */}
      <path
        d="M 16 13 C 11 10.5 8 14 9.5 17.5 C 11.5 20 15.5 17 16 13 Z"
        fill="#8EC954"
        stroke="#3F5532"
        strokeWidth="0.8"
      />

      {/* Lower right leaf */}
      <path
        d="M 15 18 C 20 17 23.5 20.5 22 24 C 20 26 16.5 22.5 15 18 Z"
        fill="#98D65E"
        stroke="#3F5532"
        strokeWidth="0.8"
      />

      {/* Lower left leaf */}
      <path
        d="M 12 21 C 7 20 6 24 8 26.5 C 10.5 28 13 25 12 21 Z"
        fill="#7EB847"
        stroke="#3F5532"
        strokeWidth="0.8"
      />
    </svg>
  );
}
