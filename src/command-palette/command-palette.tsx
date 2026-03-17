import { forwardRef, useCallback, useContext, useImperativeHandle, useMemo, useRef } from 'react';

import { type ActiveNote, ActiveNoteContext } from '../app/active-note-context';
import type { SearchResult } from '../search/search-notes';
import { type PaletteCommand, filterCommands } from './command-registry';
import './command-palette.css';
import { PaletteInput } from './palette-input';
import { PaletteResults } from './palette-results';
import { usePalette } from './use-palette';

export interface CommandPaletteHandle {
  close: () => void;
  open: () => void;
}

interface CommandPaletteProps {
  commands: ReadonlyArray<PaletteCommand>;
  onAnnounce: (message: string) => void;
  onNavigateDaily?: (dateStr: string) => void;
}

function parseActiveNote(result: SearchResult): ActiveNote {
  const id = result.noteId;
  const base = id.startsWith('ws:') ? id.split(':').slice(2).join(':') : id;
  if (base.startsWith('daily:')) return { id, type: 'daily' };
  if (base.startsWith('weekly:')) return { id, type: 'weekly' };
  return { id, type: 'permanent' };
}

export const CommandPalette = forwardRef<CommandPaletteHandle, CommandPaletteProps>(
  function CommandPalette({ commands, onAnnounce, onNavigateDaily }, ref) {
    const palette = usePalette();
    const { navigateToNote } = useContext(ActiveNoteContext);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({ close: palette.close, open: palette.open }), [palette]);

    const query = palette.isCommandMode ? palette.inputValue.slice(1).trim() : palette.inputValue;
    const filteredCommands = useMemo(
      () => (palette.isCommandMode ? filterCommands(commands, query) : []),
      [commands, palette.isCommandMode, query],
    );
    const items = palette.isCommandMode ? filteredCommands : palette.results;

    const handleSelectResult = useCallback(
      (result: SearchResult) => {
        const note = parseActiveNote(result);
        navigateToNote(note);
        if (note.type === 'daily' && onNavigateDaily) {
          const dateStr = note.id.includes(':daily:')
            ? note.id.split(':daily:')[1]
            : note.id.split('daily:')[1];
          if (dateStr) onNavigateDaily(dateStr);
        }
        onAnnounce(`Navigated to ${result.title}`);
        palette.close();
      },
      [navigateToNote, onAnnounce, onNavigateDaily, palette],
    );

    const handleSelectCommand = useCallback(
      (cmd: PaletteCommand) => {
        cmd.action();
        onAnnounce(`Executed ${cmd.name}`);
        palette.close();
      },
      [onAnnounce, palette],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          palette.close();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          palette.moveSelection('down');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          palette.moveSelection('up');
        } else if (e.key === 'Enter' && items.length > 0) {
          e.preventDefault();
          const cmd = filteredCommands[palette.activeIndex];
          const result = palette.results[palette.activeIndex];
          if (palette.isCommandMode && cmd) {
            handleSelectCommand(cmd);
          } else if (result) {
            handleSelectResult(result);
          }
        }
      },
      [palette, items.length, filteredCommands, handleSelectCommand, handleSelectResult],
    );

    if (!palette.isOpen) return null;
    const activeDescendant = items.length > 0 ? `palette-item-${palette.activeIndex}` : '';

    return (
      <>
        <div className="palette-backdrop" onClick={palette.close} />
        <div aria-label="Command palette" aria-modal="true" className="palette-surface" role="dialog">
          <PaletteInput
            activeDescendant={activeDescendant}
            onChange={palette.setInputValue}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            value={palette.inputValue}
          />
          {(palette.inputValue.trim() || palette.isCommandMode) && (
            <PaletteResults
              activeIndex={palette.activeIndex}
              commands={filteredCommands}
              isCommandMode={palette.isCommandMode}
              onSelectCommand={handleSelectCommand}
              onSelectResult={handleSelectResult}
              query={query}
              results={palette.results}
            />
          )}
          <div className="palette-hint">esc to close</div>
        </div>
      </>
    );
  },
);
