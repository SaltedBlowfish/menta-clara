import type { JSONContent } from '@tiptap/react';

import { useEditor } from '@tiptap/react';
import { useRef } from 'react';

import { createExtensions } from './extensions';

interface UseEditorConfigOptions {
  initialContent?: JSONContent | null | undefined;
  noteId: string;
  onUpdate?: ((content: JSONContent) => void) | undefined;
}

export function useEditorConfig(options: UseEditorConfigOptions) {
  const { initialContent, noteId, onUpdate } = options;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const editor = useEditor({
    ...(initialContent ? { content: initialContent } : {}),
    extensions: createExtensions(),
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onUpdateRef.current?.(e.getJSON());
    },
  }, [noteId]);

  return editor;
}
