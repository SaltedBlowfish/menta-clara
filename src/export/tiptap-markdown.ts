import type { JSONContent } from '@tiptap/react';

import { MarkdownManager } from '@tiptap/markdown';

import { editorExtensions } from '../editor/extensions';

const manager = new MarkdownManager({ extensions: editorExtensions });

export function jsonToMarkdown(json: JSONContent): string {
  const md = manager.serialize(json);

  // Replace blob URLs for images with data-image-id references
  return md.replace(
    /!\[([^\]]*)\]\(blob:[^)]+\)/g,
    (_, alt: string) => `![${alt}](image)`,
  );
}

export function markdownToJson(markdown: string): JSONContent {
  return manager.parse(markdown);
}
