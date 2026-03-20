import type { JSONContent } from '@tiptap/react';

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });
}

export function formatFull(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

interface HistoryPreviewProps {
  content: JSONContent;
}

export function HistoryPreview(props: HistoryPreviewProps) {
  const blocks = extractBlocks(props.content);

  return (
    <div className="history-preview-content">
      {blocks.map((block, i) => (
        <p key={i}>{block}</p>
      ))}
    </div>
  );
}

function extractBlocks(node: JSONContent): Array<string> {
  const blocks: Array<string> = [];

  function walk(n: JSONContent): string {
    if (n.type === 'text' && n.text) {
      return n.text;
    }
    if (!n.content) return '';
    const text = n.content.map(walk).join('');
    if (n.type === 'paragraph' || n.type === 'heading' || n.type === 'listItem') {
      if (text) blocks.push(text);
      return '';
    }
    return text;
  }

  walk(node);
  return blocks;
}
