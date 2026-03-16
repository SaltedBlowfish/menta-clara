import type { JSONContent } from '@tiptap/react';

import { format } from 'date-fns';

export function formatDateHeading(date: Date): JSONContent {
  const headingText = format(date, 'MMMM d, yyyy');

  return {
    content: [
      {
        attrs: { level: 1 },
        content: [{ text: headingText, type: 'text' }],
        type: 'heading',
      },
    ],
    type: 'doc',
  };
}

export function formatDateLabel(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}
