import { highlightSnippet } from '../search/highlight-snippet';
import type { SearchResult } from '../search/search-notes';
import type { PaletteCommand } from './command-registry';

import './palette-results.css';

interface PaletteResultsProps {
  activeIndex: number;
  commands: ReadonlyArray<PaletteCommand>;
  isCommandMode: boolean;
  onSelectCommand: (cmd: PaletteCommand) => void;
  onSelectResult: (result: SearchResult) => void;
  query: string;
  results: ReadonlyArray<SearchResult>;
}

export function PaletteResults({
  activeIndex,
  commands,
  isCommandMode,
  onSelectCommand,
  onSelectResult,
  query,
  results,
}: PaletteResultsProps) {
  if (isCommandMode) {
    return (
      <div className="palette-results" id="palette-results" role="listbox">
        <div className="palette-section-header">Commands</div>
        {commands.length === 0 && (
          <div className="palette-empty">No matching commands</div>
        )}
        {commands.map((cmd, i) => (
          <div
            aria-selected={i === activeIndex}
            className={`palette-result-item${i === activeIndex ? ' active' : ''}`}
            id={`palette-item-${i}`}
            key={cmd.id}
            onClick={() => onSelectCommand(cmd)}
            role="option"
          >
            <span className="palette-result-title">{cmd.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="palette-results" id="palette-results" role="listbox">
      <div className="palette-section-header">Results</div>
      {results.length === 0 && (
        <div className="palette-empty">No matching notes</div>
      )}
      {results.map((result, i) => {
        const parts = highlightSnippet(result.snippet, query);
        return (
          <div
            aria-selected={i === activeIndex}
            className={`palette-result-item${i === activeIndex ? ' active' : ''}`}
            id={`palette-item-${i}`}
            key={result.noteId}
            onClick={() => onSelectResult(result)}
            role="option"
          >
            <span className="palette-result-title">{result.title}</span>
            <span className="palette-result-snippet">
              {parts.map((part, pi) =>
                part.highlight ? (
                  <mark className="palette-highlight" key={pi}>{part.text}</mark>
                ) : (
                  <span key={pi}>{part.text}</span>
                ),
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
