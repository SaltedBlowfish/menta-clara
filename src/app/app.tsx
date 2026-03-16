import { useState } from 'react';

import './app.css';
import { DailyPane } from '../daily/daily-pane';
import { SplitPane } from '../layout/split-pane';
import { LiveRegion } from '../shared/live-region';
import { ThemeToggle } from '../theme/theme-toggle';

export function App() {
  const [selectedDate] = useState<Date>(() => new Date());
  const [announcement] = useState('');

  return (
    <>
      <ThemeToggle />
      <SplitPane
        left={<DailyPane date={selectedDate} />}
        right={<div />}
      />
      <LiveRegion message={announcement} />
    </>
  );
}
