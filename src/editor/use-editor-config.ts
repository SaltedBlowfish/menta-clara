import type { JSONContent } from '@tiptap/react';

import { useEditor } from '@tiptap/react';

import { editorExtensions } from './extensions';

interface UseEditorConfigOptions {
  content: JSONContent | null;
  onUpdate: (content: JSONContent) => void;
}

export function useEditorConfig(options: UseEditorConfigOptions) {
  const { content, onUpdate } = options;

  return useEditor(
    {
      autofocus: true,
      content: content ?? '',
      extensions: editorExtensions,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        onUpdate(editor.getJSON());
      },
    },
    [content],
  );
}
