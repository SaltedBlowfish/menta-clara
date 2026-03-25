interface BackupEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export function BackupEditor(props: BackupEditorProps) {
  const { code, onChange } = props;

  return (
    <textarea
      className="backup-editor"
      onChange={(e) => onChange(e.target.value)}
      placeholder="// Write your backup script here.&#10;// The 'payload' variable contains your notes, images, and history.&#10;// Use fetch(), console.log(), etc. freely."
      spellCheck={false}
      value={code}
    />
  );
}
