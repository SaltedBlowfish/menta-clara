import type { JSONContent } from '@tiptap/react';

import { EditorContent } from '@tiptap/react';

import { useEditorConfig } from './use-editor-config';

interface NoteEditorProps {
  content: JSONContent | null;
  onUpdate: (content: JSONContent) => void;
}

export function NoteEditor(props: NoteEditorProps) {
  const { content, onUpdate } = props;
  const editor = useEditorConfig({ content, onUpdate });

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
