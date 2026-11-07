"use client";

import React, { useRef, useState, useEffect } from 'react';
import { CLASSIC_MEMES } from '@/lib/memes';
import { MemeItem } from '@/types/game';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DubMascot } from './DubMascot';

export function MemeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMeme, setSelectedMeme] = useState<MemeItem | null>(null);
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
    <div className="w-full my-3 select-none">
      {/* Clean Header: Memes as the Main Focus */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#ff5500] text-white flex items-center justify-center text-xs font-black shadow-sm">
            🔥
          </span>
          <h3 className="font-[family-name:var(--font-display)] font-black text-sm uppercase text-[#121316] tracking-tight">
            Meme Vault Preview
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollBy(-220)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-7 h-7 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 shadow-[1.5px_1.5px_0px_#121316] active:translate-y-0.5"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            onClick={() => scrollBy(220)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-7 h-7 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 shadow-[1.5px_1.5px_0px_#121316] active:translate-y-0.5"
          >
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Pure Meme Focus - Smooth Edge-Faded Carousel */}
      <div className="relative w-full">
        {/* Left smooth fade gradient (visible when scrolled) */}
        <div 
          className={`absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-[#faf8f5] to-transparent z-10 pointer-events-none transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} 
        />
        {/* Right smooth fade gradient (visible when more cards to scroll) */}
        <div 
          className={`absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#faf8f5] to-transparent z-10 pointer-events-none transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} 
        />

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex items-center gap-3.5 overflow-x-auto hide-scrollbar px-3 py-2.5 cursor-grab active:cursor-grabbing scroll-smooth snap-x snap-mandatory"
          style={{ scrollPaddingLeft: '12px', scrollPaddingRight: '12px' }}
        >
          {CLASSIC_MEMES.map((meme, idx) => (
            <div
              key={meme.id || idx}
              onClick={() => {
                if (!isDragging) {
                  setSelectedMeme(meme);
                }
              }}
              className="group flex-shrink-0 w-36 sm:w-44 aspect-square bg-zinc-950 rounded-2xl border border-zinc-800/80 hover:border-[#ff5500] overflow-hidden shadow-[2.5px_2.5px_0px_#121316] hover:shadow-[3.5px_3.5px_0px_#ff5500] hover:-translate-y-1 transition-all duration-200 snap-start cursor-pointer relative"
            >
              {/* Full-Bleed Meme GIF - Format directly like main branch (no inner padding, no heavy double border) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meme.gifUrl}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Modal Preview */}
      {selectedMeme && (
        <div
          onClick={() => setSelectedMeme(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#18191e] border-2 border-zinc-800 shadow-[0_0_30px_rgba(255,85,0,0.25)] p-4 text-center relative select-none animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setSelectedMeme(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center border border-zinc-700"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-3">
              <DubMascot size="sm" />
              <span className="text-xs font-black uppercase text-[#ff5500] tracking-wider">
                Meme Preview
              </span>
            </div>

            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-zinc-700 my-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedMeme.gifUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 mt-2 text-center">
              <p className="text-xs text-amber-300 font-bold">
                🎭 Clue: {selectedMeme.clue || 'Act out the expressions and movements of this meme!'}
              </p>
            </div>

            <button
              onClick={() => setSelectedMeme(null)}
              className="mt-4 w-full py-2.5 rounded-xl dub-btn-orange text-xs font-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
