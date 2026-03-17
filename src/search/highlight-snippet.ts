export interface HighlightedPart {
  highlight: boolean;
  text: string;
}

export function highlightSnippet(
  snippet: string,
  query: string,
): ReadonlyArray<HighlightedPart> {
  if (!query) return [{ highlight: false, text: snippet }];

  const parts: HighlightedPart[] = [];
  const lowerSnippet = snippet.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let cursor = 0;

  while (cursor < snippet.length) {
    const idx = lowerSnippet.indexOf(lowerQuery, cursor);
    if (idx === -1) {
      parts.push({ highlight: false, text: snippet.slice(cursor) });
      break;
    }
    if (idx > cursor) {
      parts.push({ highlight: false, text: snippet.slice(cursor, idx) });
    }
    parts.push({ highlight: true, text: snippet.slice(idx, idx + query.length) });
    cursor = idx + query.length;
  }

  return parts;
}
