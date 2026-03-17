import './inline-title.css';
import { useCallback, useRef, useState } from 'react';

interface InlineTitleProps {
  name: string;
  onRename: (name: string) => void;
}

export function InlineTitle({ name, onRename }: InlineTitleProps) {
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevNameRef = useRef(name);

  if (prevNameRef.current !== name) {
    prevNameRef.current = name;
    setValue(name);
  }

  const handleBlur = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    } else if (!trimmed) {
      setValue(name);
    }
  }, [name, onRename, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        inputRef.current?.blur();
      } else if (e.key === 'Escape') {
        setValue(name);
        inputRef.current?.blur();
      }
    },
    [name],
  );

  return (
    <input
      aria-label="Note title"
      className="inline-title"
      onBlur={handleBlur}
      onChange={(e) => { setValue(e.target.value); }}
      onKeyDown={handleKeyDown}
      placeholder="Untitled"
      ref={inputRef}
      type="text"
      value={value}
    />
  );
}
