import type { JSONContent } from '@tiptap/react';

import { EditorContent } from '@tiptap/react';
import { useCallback } from 'react';

import { HistoryDialog } from '../sync/history-dialog';
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

  const handleRestore = useCallback(
    (content: JSONContent) => {
      editor?.commands.setContent(content);
    },
    [editor],
  );

  if (!editor) {
    return null;
  }

  return (
    <>
      <EditorToolbar editor={editor} historyButton={<HistoryDialog noteId={noteId} onRestore={handleRestore} />} />
      <EditorContent editor={editor} />
    </>
  );
}
