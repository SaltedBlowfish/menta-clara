import './collapsible-section.css';

import type { ReactNode } from 'react';

import { useCallback, useState } from 'react';

interface CollapsibleSectionProps {
  children: ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  sectionId: string;
  title: string;
}

export function CollapsibleSection({
  children,
  defaultExpanded = true,
  onToggle,
  sectionId,
  title,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  }, [onToggle]);

  return (
    <section className="collapsible-section">
      <h3 className="collapsible-section-header">
        <button
          aria-controls={`${sectionId}-content`}
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
          className="collapsible-section-toggle"
          onClick={handleToggle}
          type="button"
        >
          <svg
            className={`collapsible-chevron${expanded ? ' collapsible-chevron-expanded' : ''}`}
            fill="none"
            height="12"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 12 12"
            width="12"
          >
            <polyline points="4,2 8,6 4,10" />
          </svg>
          {title}
        </button>
      </h3>
      <div
        className="collapsible-section-content"
        hidden={!expanded}
        id={`${sectionId}-content`}
      >
        {children}
      </div>
    </section>
  );
}
