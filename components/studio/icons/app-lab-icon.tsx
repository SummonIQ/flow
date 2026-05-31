'use client';

import { motion } from 'framer-motion';

export function SummonIQIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        {/* Glass beaker gradient with transparency */}
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.3" />
        </linearGradient>
        {/* Liquid gradient - cyan/blue */}
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        {/* Bubble shine effect */}
        <radialGradient id="bubbleShine">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#a5f3fc" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      
      {/* Traditional Erlenmeyer flask body */}
      <path
        d="M20 6 L20 18 L8 36 C8 40 11 42 17 42 L31 42 C37 42 40 40 40 36 L28 18 L28 6 Z"
        fill="url(#glassGradient)"
        stroke="#6366f1"
        strokeWidth="1.5"
        opacity="0.8"
      />
      
      {/* Flask neck/rim */}
      <rect
        x="19"
        y="4"
        width="10"
        height="3"
        rx="1"
        fill="#6366f1"
        opacity="0.9"
      />
      
      {/* Liquid inside flask - matches beaker shape with consistent gap */}
      <path
        d="M20 22 L12 35 C12 38.5 15 40 19.5 40 L28.5 40 C33 40 36 38.5 36 35 L28 22 Z"
        fill="url(#liquidGradient)"
        opacity="0.85"
      />
      
      {/* Measurement lines on flask */}
      <line x1="9" y1="30" x2="12" y2="30" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="36" y1="30" x2="39" y2="30" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="10" y1="25" x2="12" y2="25" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="36" y1="25" x2="38" y2="25" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      
      {/* Animated bubbles rising and moving right */}
      <motion.circle 
        cx="15" 
        cy="35" 
        r="2" 
        fill="url(#bubbleShine)" 
        opacity="0.7"
        animate={{
          cx: [15, 20, 25],
          cy: [35, 28, 22],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.circle 
        cx="15" 
        cy="35" 
        r="2" 
        fill="none" 
        stroke="#22d3ee" 
        strokeWidth="0.5" 
        opacity="0.5"
        animate={{
          cx: [15, 20, 25],
          cy: [35, 28, 22],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.circle 
        cx="18" 
        cy="37" 
        r="1.5" 
        fill="url(#bubbleShine)" 
        opacity="0.6"
        animate={{
          cx: [18, 22, 28],
          cy: [37, 31, 24],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.circle 
        cx="12" 
        cy="33" 
        r="1.8" 
        fill="url(#bubbleShine)" 
        opacity="0.65"
        animate={{
          cx: [12, 18, 23],
          cy: [33, 27, 23],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      
      {/* Shine highlights on animated bubbles */}
      <motion.circle 
        cx="15.5" 
        cy="34" 
        r="0.6" 
        fill="#ffffff" 
        opacity="0.9"
        animate={{
          cx: [15.5, 20.5, 25.5],
          cy: [34, 27, 21],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}
