import type { ReactNode } from 'react';

import { useCallback, useRef, useState } from 'react';

import './mobile-layout.css';

interface MobileLayoutProps {
  calendar: ReactNode;
  daily: ReactNode;
  onTodayTab?: () => void;
  panelRef?: React.RefObject<{ goToDaily: () => void } | null>;
  weekly: ReactNode;
}

const SWIPE_THRESHOLD = 50;

export function MobileLayout({ calendar, daily, onTodayTab, panelRef, weekly }: MobileLayoutProps) {
  const [panel, setPanel] = useState(1); // 0=calendar, 1=daily, 2=weekly
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Expose goToDaily for parent to call when calendar date is clicked
  if (panelRef) {
    (panelRef as React.MutableRefObject<{ goToDaily: () => void } | null>).current = {
      goToDaily: () => setPanel(1),
    };
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;

    if (dx > 0 && panel > 0) {
      setPanel(panel - 1);
    } else if (dx < 0 && panel < 2) {
      setPanel(panel + 1);
    }
  }, [panel]);

  const handleTodayTab = useCallback(() => {
    setPanel(1);
    onTodayTab?.();
  }, [onTodayTab]);

  return (
    <div className="mobile-layout">
      <div
        className="mobile-panels"
        data-panel={panel}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <div className="mobile-panel">{calendar}</div>
        <div className="mobile-panel" id="daily-pane">{daily}</div>
        <div className="mobile-panel" id="right-pane">{weekly}</div>
      </div>

      <nav className="mobile-tabbar">
        <button className={`mobile-tab${panel === 0 ? ' active' : ''}`} onClick={() => setPanel(0)} type="button">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect height="16" rx="2" width="16" x="4" y="4" />
            <line x1="4" x2="20" y1="10" y2="10" />
            <line x1="10" x2="10" y1="4" y2="20" />
          </svg>
          Calendar
        </button>
        <button className={`mobile-tab${panel === 1 ? ' active' : ''}`} onClick={handleTodayTab} type="button">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 8v4l2 2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Today
        </button>
        <button className={`mobile-tab${panel === 2 ? ' active' : ''}`} onClick={() => setPanel(2)} type="button">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
          </svg>
          Weekly
        </button>
      </nav>
    </div>
  );
}
