import type { JSONContent } from '@tiptap/react';

import Collaboration from '@tiptap/extension-collaboration';
import { useEditor } from '@tiptap/react';
import { useRef } from 'react';

import { getYDoc } from '../sync/yjs-provider';
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

  const ydoc = noteId ? getYDoc(noteId) : undefined;

  const editor = useEditor(
    {
      extensions: [
        ...editorExtensions,
        ...(ydoc
          ? [Collaboration.configure({ document: ydoc })]
          : []),
      ],
      immediatelyRender: false,
      onUpdate: ({ editor: e }) => {
        onUpdateRef.current(e.getJSON());
      },
    },
    // Re-create the editor when noteId changes so Collaboration binds to the new Y.Doc
    [noteId],
  );

  // Seed the Y.Doc with initial content if it's empty and we have content
  if (editor && ydoc && content !== null && appliedNoteRef.current !== noteId) {
    appliedNoteRef.current = noteId;
    const fragment = ydoc.getXmlFragment('default');
    if (fragment.length === 0) {
      editor.commands.setContent(content);
    }
  }

  return editor;
}
