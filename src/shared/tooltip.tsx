import type { CSSProperties, ReactNode } from 'react';

import { useId, useRef } from 'react';

import './tooltip.css';

interface TooltipProps {
  children: ReactNode;
  label: string;
}

export function Tooltip({ children, label }: TooltipProps) {
  const id = useId();
  const anchorName = `--tt-${id.replace(/:/g, '')}`;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const popoverRef = useRef<HTMLDivElement>(null);

  function show() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      popoverRef.current?.showPopover();
    }, 400);
  }

  function hide() {
    clearTimeout(timerRef.current);
    popoverRef.current?.hidePopover();
  }

  return (
    <span
      aria-describedby={id}
      className="tooltip-anchor"
      onBlur={hide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={hide}
      onPointerDown={hide}
      style={{ anchorName } as CSSProperties}
    >
      {children}
      <div
        className="tooltip"
        id={id}
        popover="manual"
        ref={popoverRef}
        role="tooltip"
        style={{ positionAnchor: anchorName } as CSSProperties}
      >
        {label}
      </div>
    </span>
  );
}
