import type { ReactNode } from 'react';

import './pane.css';

interface PaneProps {
  actions?: ReactNode;
  children: ReactNode;
  title: string;
}

export function Pane({ actions, children, title }: PaneProps) {
  return (
    <div className="pane">
      <div className="pane-header">
        <span className="section-title">{title}</span>
        {actions}
      </div>
      {children}
    </div>
  );
}

interface PaneContentProps {
  children: ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function PaneContent({ children, onMouseDown }: PaneContentProps) {
  return (
    <div className="pane-content" onMouseDown={onMouseDown}>
      {children}
    </div>
  );
}
