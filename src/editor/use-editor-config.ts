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

  const pendingNoteRef = useRef<string | undefined>(undefined);

  // When noteId changes, mark it as pending so we know to apply content when it arrives
  useEffect(() => {
    if (noteId !== appliedNoteRef.current) {
      pendingNoteRef.current = noteId;
    }
  }, [noteId]);

  useEffect(() => {
    if (!editor || content === null) return;
    if (pendingNoteRef.current !== undefined) {
      appliedNoteRef.current = noteId;
      pendingNoteRef.current = undefined;
      editor.commands.setContent(content);
    }
  }, [editor, content, noteId]);

  return editor;
}
