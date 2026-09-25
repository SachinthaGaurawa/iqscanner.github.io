"use client";

import { useId } from "react";
import { motion } from "motion/react";

interface LogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function Logo({ size = 40, animated = false, className }: LogoProps) {
  const uid = useId().replace(/[:]/g, "");
  const bgId = `qs-bg-${uid}`;
  const scanId = `qs-scan-${uid}`;
  const glowId = `qs-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Quick Scanner"
      className={className}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={scanId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="64" height="64" rx="15" fill={`url(#${bgId})`} />

      <g transform="rotate(-6 32 31)">
        <rect x="20" y="15" width="24" height="32" rx="3" fill="#F8FAFC" />
        <path d="M36 15 L44 15 L44 23 Z" fill="#CBD5E1" />
        <rect x="24" y="22" width="16" height="2.2" rx="1.1" fill="#94A3B8" />
        <rect x="24" y="27.5" width="16" height="2.2" rx="1.1" fill="#94A3B8" />
        <rect x="24" y="33" width="10" height="2.2" rx="1.1" fill="#CBD5E1" />
        {animated ? (
          <motion.rect
            x="17"
            width="30"
            height="3"
            rx="1.5"
            fill={`url(#${scanId})`}
            filter={`url(#${glowId})`}
            initial={{ y: 18 }}
            animate={{ y: [18, 42, 18] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <rect x="17" y="28.5" width="30" height="3" rx="1.5" fill={`url(#${scanId})`} filter={`url(#${glowId})`} />
        )}
      </g>

      <g stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.95">
        <path d="M10 18 L10 10 L18 10" />
        <path d="M46 10 L54 10 L54 18" />
        <path d="M10 46 L10 54 L18 54" />
        <path d="M54 46 L54 54 L46 54" />
      </g>
    </svg>
  );
}
