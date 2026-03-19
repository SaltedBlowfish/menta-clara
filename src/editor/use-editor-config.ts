import type { JSONContent } from '@tiptap/react';

import { useEditor } from '@tiptap/react';
import { useRef } from 'react';

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
  const appliedContentRef = useRef<JSONContent | null>(null);

  const editor = useEditor({
    content: '',
    extensions: editorExtensions,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onUpdateRef.current(e.getJSON());
    },
  });

  if (editor && content !== null) {
    const noteChanged = appliedNoteRef.current !== noteId;
    const contentChanged = appliedContentRef.current !== content;
    if (noteChanged || (contentChanged && !editor.isFocused)) {
      appliedNoteRef.current = noteId;
      appliedContentRef.current = content;
      editor.commands.setContent(content);
    }
  }

  return editor;
}
