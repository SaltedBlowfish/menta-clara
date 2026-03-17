import { forwardRef } from 'react';

interface PaletteInputProps {
  activeDescendant: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  value: string;
}

export const PaletteInput = forwardRef<HTMLInputElement, PaletteInputProps>(
  function PaletteInput({ activeDescendant, onChange, onKeyDown, value }, ref) {
    return (
      <div className="palette-input-wrapper">
        <svg
          aria-hidden="true"
          className="palette-search-icon"
          fill="none"
          height="16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="16"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" x2="16.65" y1="21" y2="16.65" />
        </svg>
        <input
          aria-activedescendant={activeDescendant || undefined}
          aria-controls="palette-results"
          aria-expanded={true}
          autoFocus
          className="palette-input"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search notes or type > for commands..."
          ref={ref}
          role="combobox"
          type="text"
          value={value}
        />
      </div>
    );
  },
);
