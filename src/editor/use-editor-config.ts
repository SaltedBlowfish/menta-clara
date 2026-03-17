import type { JSONContent } from '@tiptap/react';

import { useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';

import { editorExtensions } from './extensions';

interface UseEditorConfigOptions {
  content: JSONContent | null;
  noteId?: string | undefined;
  onUpdate: (content: JSONContent) => void;
}

export function useEditorConfig(options: UseEditorConfigOptions) {
  const { content, noteId, onUpdate } = options;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const appliedNoteRef = useRef<string | undefined>(undefined);

  const editor = useEditor({
    content: '',
    extensions: editorExtensions,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onUpdateRef.current(e.getJSON());
    },
  });

  useEffect(() => {
    if (!editor || content === null) return;
    if (appliedNoteRef.current !== noteId) {
      appliedNoteRef.current = noteId;
      editor.commands.setContent(content);
    }
  }, [editor, content, noteId]);

  return editor;
}
