import type { JSONContent } from '@tiptap/react';

import { EditorContent } from '@tiptap/react';

import { EditorToolbar } from './editor-toolbar';
import { useEditorConfig } from './use-editor-config';

interface NoteEditorProps {
  initialContent?: JSONContent | null | undefined;
  noteId: string;
  onUpdate?: ((content: JSONContent) => void) | undefined;
}

export function NoteEditor(props: NoteEditorProps) {
  const { initialContent, noteId, onUpdate } = props;
  const editor = useEditorConfig({ initialContent, noteId, onUpdate });

  if (!editor) {
    return null;
  }

  return (
    <>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
}
