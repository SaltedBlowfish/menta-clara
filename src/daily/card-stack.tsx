import './card-stack.css';

import { format, parseISO } from 'date-fns';
// eslint-disable-next-line no-restricted-imports -- DOM event subscriptions
import { useCallback, useEffect, useRef, useState } from 'react';

import type { DailyNoteEntry } from './use-daily-notes-list';

interface CardStackProps {
  currentDate: string; // yyyy-MM-dd
  entries: DailyNoteEntry[];
  onClose: () => void;
  onSelect: (dateStr: string) => void;
}

const VISIBLE_CARDS = 5;
const SCROLL_THRESHOLD = 20;

export function CardStack({ currentDate, entries, onClose, onSelect }: CardStackProps) {
  const initialIndex = Math.max(0, entries.findIndex((e) => e.date === currentDate));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAccum = useRef(0);

  // Use refs for callbacks so event listeners always see the latest
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const touchStartY = useRef<number | null>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    scrollAccum.current += e.deltaY;

    if (Math.abs(scrollAccum.current) >= SCROLL_THRESHOLD) {
      const direction = scrollAccum.current > 0 ? 1 : -1;
      scrollAccum.current = 0;
      setActiveIndex((prev) => Math.max(0, Math.min(entriesRef.current.length - 1, prev + direction)));
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Touch swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchStartY.current = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dy = touch.clientY - touchStartY.current;
    touchStartY.current = null;
    if (Math.abs(dy) < 30) return;
    if (dy < 0) {
      setActiveIndex((prev) => Math.min(entriesRef.current.length - 1, prev + 1));
    } else {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(entriesRef.current.length - 1, prev + 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const entry = entriesRef.current[activeIndexRef.current];
        if (entry) onSelectRef.current(entry.date);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleCardClick = useCallback((index: number) => {
    if (index === activeIndexRef.current) {
      const entry = entriesRef.current[index];
      if (entry) onSelectRef.current(entry.date);
    } else {
      setActiveIndex(index);
    }
  }, []);

  return (
    <div className="card-stack-overlay" onTouchEnd={handleTouchEnd} onTouchStart={handleTouchStart} ref={containerRef}>
      <div className="card-stack-scene">
        {entries.map((entry, i) => {
          const offset = i - activeIndex;
          if (offset < -1 || offset > VISIBLE_CARDS) return null;

          const z = -offset * 40;
          const y = offset * 24;
          const scale = Math.max(0.85, 1 - offset * 0.03);
          const opacity = offset < 0 ? 0 : Math.max(0, 1 - offset * 0.15);
          const blur = offset > 0 ? Math.min(offset * 0.5, 2) : 0;

          const dateObj = parseISO(entry.date);
          const dayOfWeek = format(dateObj, 'EEEE');
          const dateFormatted = format(dateObj, 'MMMM d, yyyy');
          const isFront = offset === 0;

          return (
            <button
              aria-label={`${dateFormatted}${isFront ? ', press Enter to open' : ''}`}
              className={`card-stack-card${isFront ? ' card-front' : ''}`}
              key={entry.id}
              onClick={() => handleCardClick(i)}
              style={{
                filter: blur > 0 ? `blur(${String(blur)}px)` : 'none',
                opacity,
                transform: `translateZ(${String(z)}px) translateY(${String(y)}px) scale(${String(scale)})`,
                zIndex: entries.length - i,
              }}
              type="button"
            >
              <div className="card-date-label">{dayOfWeek}</div>
              <div className="card-date-full">{dateFormatted}</div>
              {isFront && (
                <div className="card-hint">Click or press Enter to open</div>
              )}
            </button>
          );
        })}
      </div>
      <div className="card-stack-counter">
        {activeIndex + 1} / {entries.length}
      </div>
    </div>
  );
}
