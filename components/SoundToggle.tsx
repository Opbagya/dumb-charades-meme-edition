"use client";

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound';

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(!isSoundEnabled());
  }, []);

  const toggle = () => {
    const nextState = !muted;
    setMuted(nextState);
    setSoundEnabled(!nextState);
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
      className="fixed top-4 right-4 z-40 w-9 h-9 rounded-full bg-white/95 border-2 border-zinc-900 text-zinc-800 shadow-[2px_2px_0px_#18181b] flex items-center justify-center hover:bg-zinc-100 active:translate-x-0.5 active:translate-y-0.5 transition-all"
    >
      {muted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
    </button>
  );
}
