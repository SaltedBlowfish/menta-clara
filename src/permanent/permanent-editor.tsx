import { NoteEditor } from '../editor/editor';
import { useNote } from '../storage/use-note';

interface PermanentEditorProps {
  noteId: string;
}

export function PermanentEditor({ noteId }: PermanentEditorProps) {
  const { content, loading, saveContent } = useNote(noteId);

  if (loading) return null;

  return (
    <NoteEditor
      initialContent={content}
      key={noteId}
      noteId={noteId}
      onUpdate={saveContent}
    />
  );
}
