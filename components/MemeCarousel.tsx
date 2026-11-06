"use client";

import React, { useRef, useState, useEffect } from 'react';
import { CLASSIC_MEMES } from '@/lib/memes';
import { MemeItem } from '@/types/game';
import { ChevronLeft, ChevronRight, Sparkles, X, Maximize2 } from 'lucide-react';

export function MemeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMeme, setSelectedMeme] = useState<MemeItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollBy = (offset: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full my-4 select-none">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-black border border-zinc-900 shadow-xs">
            {CLASSIC_MEMES.length}
          </span>
          <h3 className="font-[family-name:var(--font-display)] font-black text-lg text-zinc-900 tracking-tight flex items-center gap-1.5">
            Meme Vault
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-600 bg-zinc-200/80 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
            Swipe to explore &rarr;
          </span>
          <button
            onClick={() => scrollBy(-300)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-white flex items-center justify-center text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 active:scale-95 transition-all shadow-[2px_2px_0px_#18181b]"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            onClick={() => scrollBy(300)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-white flex items-center justify-center text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 active:scale-95 transition-all shadow-[2px_2px_0px_#18181b]"
          >
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Ultra Smooth Horizontal Scrolling Rail (Pure GIFs, No Names) */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex gap-3.5 overflow-x-auto hide-scrollbar px-4 sm:px-6 pb-4 pt-1 snap-x snap-mandatory ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        {CLASSIC_MEMES.map((meme, idx) => (
          <div
            key={meme.id}
            onClick={() => {
              if (!isDragging) {
                setSelectedMeme(meme);
                setSelectedIndex(idx + 1);
              }
            }}
            className="group flex-shrink-0 w-40 sm:w-48 aspect-square bg-zinc-950 rounded-2xl border-3 border-zinc-900 overflow-hidden shadow-[4px_4px_0px_#18181b] hover:shadow-[6px_6px_0px_#18181b] hover:-translate-y-1 transition-all duration-200 snap-start cursor-pointer relative"
          >
            {/* Meme GIF (Full bleed visual, no name) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meme.gifUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            />

            {/* Subtle Index Badge */}
            <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20">
              #{idx + 1}
            </span>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/95 text-zinc-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-zinc-900">
                <Maximize2 className="w-3.5 h-3.5" /> Preview
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded GIF Preview Modal (No Names) */}
      {selectedMeme && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedMeme(null)}
        >
          <div
            className="bg-white rounded-3xl border-4 border-zinc-900 shadow-[8px_8px_0px_#18181b] max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-red-600 text-white p-3.5 flex items-center justify-between border-b-3 border-zinc-900">
              <span className="font-mono font-black text-xs uppercase tracking-wider bg-zinc-950 px-2.5 py-0.5 rounded-full text-white">
                Meme #{selectedIndex}
              </span>
              <button
                onClick={() => setSelectedMeme(null)}
                aria-label="Close modal"
                className="w-7 h-7 rounded-full bg-white text-zinc-900 border-2 border-zinc-900 flex items-center justify-center hover:bg-zinc-100 active:scale-95"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Pure GIF Display */}
            <div className="aspect-square bg-zinc-950 relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedMeme.gifUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-amber-50">
              <p className="text-xs text-zinc-600 font-medium text-center">
                Act this out with facial expressions and body language!
              </p>
              <button
                onClick={() => setSelectedMeme(null)}
                className="mt-3 w-full py-2.5 rounded-xl bg-zinc-900 text-white font-black text-xs border-2 border-zinc-900 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
