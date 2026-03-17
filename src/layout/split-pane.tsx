import type { ReactNode } from 'react';

import './split-pane.css';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

export function SplitPane(props: SplitPaneProps) {
  const { left, right } = props;

  return (
    <div className="split-pane">
      <main className="split-pane-left" id="daily-pane">
        {left}
      </main>
      <div className="pane-divider" />
      <aside className="split-pane-right" id="right-pane">
        {right}
      </aside>
    </div>
  );
}
