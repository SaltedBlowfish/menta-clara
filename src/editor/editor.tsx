import type { JSONContent } from '@tiptap/react';

import { EditorContent } from '@tiptap/react';

import { useEditorConfig } from './use-editor-config';

interface NoteEditorProps {
  content: JSONContent | null;
  noteId?: string;
  onUpdate: (content: JSONContent) => void;
}

export function NoteEditor(props: NoteEditorProps) {
  const { content, noteId, onUpdate } = props;
  const editor = useEditorConfig({ content, noteId, onUpdate });

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
