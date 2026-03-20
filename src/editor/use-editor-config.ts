import type { JSONContent } from '@tiptap/react';

import { useEditor } from '@tiptap/react';
import { useRef } from 'react';

import { getWorkspaceDoc } from '../sync/doc-store';
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
  const initialAppliedRef = useRef<string | null>(null);

  const ydoc = getWorkspaceDoc();

  const editor = useEditor({
    extensions: createExtensions(ydoc, noteId),
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onUpdateRef.current?.(e.getJSON());
    },
  }, [noteId, ydoc]);

  if (editor && initialContent && initialAppliedRef.current !== noteId) {
    const fragment = ydoc.getXmlFragment(noteId);
    if (fragment.length === 0) {
      initialAppliedRef.current = noteId;
      editor.commands.setContent(initialContent);
    }
  }

  return editor;
}
