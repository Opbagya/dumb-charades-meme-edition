"use client";

import React from 'react';

interface DubMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withSpeechBubble?: string;
}

export function DubMascot({
  size = 'md',
  className = '',
  withSpeechBubble,
}: DubMascotProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  }[size];

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${withSpeechBubble ? 'pt-8' : ''} ${className}`}>
      {withSpeechBubble && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-zinc-950 font-black text-[10px] px-2.5 py-1 rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_#000] whitespace-nowrap z-20 animate-bounce">
          {withSpeechBubble}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Dub Mascot"
        className={`${sizeClasses} object-contain select-none pointer-events-none drop-shadow-md`}
      />
    </div>
  );
}
