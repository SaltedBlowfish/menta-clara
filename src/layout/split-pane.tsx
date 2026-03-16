import type { ReactNode } from 'react';

import './split-pane.css';
import { PaneDivider } from './pane-divider';
import { usePaneRatio } from './use-pane-ratio';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

export function SplitPane(props: SplitPaneProps) {
  const { left, right } = props;
  const { containerRef, onPointerDown, onPointerMove, onPointerUp, ratio, setRatio } =
    usePaneRatio();

  return (
    <div
      className="split-pane"
      ref={containerRef}
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- CSS custom property requires CSSProperties assertion
      style={{ '--pane-ratio': `${ratio}%` } as React.CSSProperties}
    >
      <main className="split-pane-left" id="daily-pane">
        {left}
      </main>
      <PaneDivider
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ratio={ratio}
        setRatio={setRatio}
      />
      <aside className="split-pane-right" id="right-pane">
        {right}
      </aside>
    </div>
  );
}
