import './note-browser-item.css';

interface NoteBrowserItemProps {
  isSelected: boolean;
  name: string;
  noteId: string;
  onOpenInEditor: (noteId: string) => void;
  onSelect: (noteId: string) => void;
}

export function NoteBrowserItem({
  isSelected,
  name,
  noteId,
  onOpenInEditor,
  onSelect,
}: NoteBrowserItemProps) {
  const className = [
    'note-browser-item',
    isSelected ? 'note-browser-item--selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      aria-selected={isSelected}
      className={className}
      onClick={() => { onSelect(noteId); }}
      role="option"
    >
      <span className="note-browser-item__name">{name}</span>
      <button
        aria-label={`Open ${name} in editor`}
        className="note-browser-item__open-btn"
        onClick={(e) => {
          e.stopPropagation();
          onOpenInEditor(noteId);
        }}
        type="button"
      >
        <svg
          fill="none"
          height="16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="16"
        >
          <path d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      </button>
    </div>
  );
}
