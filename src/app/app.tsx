import './app.css';
import { NoteEditor } from '../editor/editor';
import { useNote } from '../storage/use-note';
import { StorageWarning } from './storage-warning';

export function App() {
  const { content, error, loading, saveContent } = useNote();

  if (loading) {
    return null;
  }

  return (
    <>
      <div className="editor-container">
        <NoteEditor content={content} onUpdate={saveContent} />
      </div>
      {error ? <StorageWarning message={error} /> : null}
    </>
  );
}
