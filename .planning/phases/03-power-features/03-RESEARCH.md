# Phase 3: Power Features - Research

**Researched:** 2026-03-16
**Domain:** Command palette, templates, workspaces, search, image paste, date references, data export/import
**Confidence:** HIGH

## Summary

Phase 3 adds six feature clusters on top of the existing split-pane daily/weekly/permanent notes app: (1) a unified command palette (CMD+K), (2) template CRUD and auto-apply, (3) workspace isolation, (4) full-text search, (5) clipboard image paste with IndexedDB blob storage, (6) date reference links, and (7) markdown export/import with zip packaging. The existing codebase already uses TipTap 3.20, idb 8.x, and plain CSS -- all new features extend these foundations without introducing new frameworks.

The most complex aspects are the IndexedDB schema migration (adding stores for templates, images, and workspace metadata), the TipTap editor extension work (Image extension + custom DateReference inline node), and the TipTap-to-markdown conversion needed for export/import. All required libraries are MIT-licensed and well-maintained.

**Primary recommendation:** Build the command palette first as the central interaction hub, then layer workspace isolation (which touches all data hooks), then templates/search/images/date-refs/export in parallel waves.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Command palette (CMD+K) is the unified entry point: text searches notes, `>` prefix accesses commands
- Templates are for initial note creation only (daily/weekly auto-creation), not loading into existing notes
- Full template CRUD (save, list, rename, delete, edit) through CMD+K commands
- Workspaces created/switched via CMD+K only -- no dedicated UI element
- Subtle workspace name label top-left (informational only)
- Default "Personal" workspace from first launch
- Each workspace fully isolated: own daily notes, weekly notes, permanent notes, templates, and settings
- Left pane = main editor, shows today's daily note by default but can display ANY note
- Right pane permanent notes section refactored into note browser (list of notes, click to preview, "open in main editor" to send to left pane)
- Search results open in left pane main editor
- Date reference links ([[YYYY-MM-DD]]) open target daily note in left pane
- Persistent "Back to today" button when viewing non-today note
- Images stored as blobs in IndexedDB (not base64 inline)
- Export as zip: flat-by-type folders (daily/, weekly/, permanent/, images/)
- Full export scope: notes + images + templates + workspace settings
- TipTap JSON converted to markdown for export
- Import: append below existing content with "## Imported on [date]" heading -- no overwrites
- Import handles all exported content types

### Claude's Discretion
- Command palette styling and animation
- Search indexing strategy (simple text scan vs. pre-built index)
- Image size limits and format handling
- Date reference rendering style (chip, underline link, etc.)
- Template storage format in IndexedDB
- Workspace ID format and storage schema
- Note browser list sorting and display in right pane
- "Back to today" button styling and positioning
- Export zip library choice
- Markdown-to-TipTap and TipTap-to-markdown conversion approach

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TMPL-01 | Save current note content as a named template | Template storage schema in IndexedDB; CMD+K command pattern |
| TMPL-02 | Load a template into current note | Per CONTEXT.md: templates used ONLY for auto-creation, not loading into existing notes. This requirement is satisfied by the auto-apply mechanism |
| TMPL-03 | Set default daily template for weekdays | usePersistedState for template assignment per workspace |
| TMPL-04 | Set default daily template for weekends | usePersistedState for template assignment per workspace |
| TMPL-05 | Set default weekly template | usePersistedState for template assignment per workspace |
| WKSP-01 | Create named workspaces | IndexedDB schema for workspace metadata; CMD+K creation flow |
| WKSP-02 | Switch workspaces with content isolation | Workspace context provider; note ID prefixing or separate stores |
| WKSP-03 | Each workspace has own notes, templates, settings | All data hooks scoped by workspace ID prefix |
| SRCH-01 | Search across all notes in workspace | IndexedDB cursor scan with text extraction from TipTap JSON |
| SRCH-02 | Search results with highlighted snippets | Text snippet extraction and highlight rendering in palette |
| SRCH-03 | Click result to navigate to note | Navigation model: set active note in left pane main editor |
| DATA-02 | Export all data as markdown zip | fflate for zip creation; @tiptap/markdown for JSON-to-MD conversion |
| DATA-03 | Import markdown files to populate notes | Zip extraction with fflate; @tiptap/markdown for MD-to-JSON parsing |
| EDIT-03 | Paste images from clipboard, display inline | @tiptap/extension-image with custom handlePaste; IndexedDB blob store |
| EDIT-04 | [[YYYY-MM-DD]] renders as clickable date link | Custom TipTap inline Node extension with input rule |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tiptap/react | 3.20.2 | Rich text editor | Already in use; extend with Image + custom nodes |
| @tiptap/starter-kit | 3.20.2 | Base editor extensions | Already configured |
| idb | 8.0.3 | IndexedDB Promise wrapper | Already in use for all data storage |
| date-fns | 4.1.0 | Date formatting/manipulation | Already in use for daily/weekly note IDs |
| react | 19.2.4 | UI framework | Already in use |

### New Dependencies
| Library | Version | Purpose | Why This One |
|---------|---------|---------|-------------|
| @tiptap/extension-image | 3.20.3 | Image node for TipTap | Official TipTap extension, MIT, matches installed TipTap version |
| @tiptap/markdown | 3.20.3 | TipTap JSON to/from markdown | Official TipTap extension, MIT, bidirectional conversion |
| fflate | 0.8.2 | Zip creation and extraction | 8KB, MIT, faster than JSZip, synchronous API for small archives |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fflate | JSZip | JSZip has simpler API but 40% slower and larger bundle; fflate preferred for local-first app |
| @tiptap/markdown | tiptap-markdown (community) | Community package is older (v0.9.0); official @tiptap/markdown is newer, maintained by TipTap team, MIT |
| Simple text scan | Lunr/FlexSearch | Pre-built index adds complexity; for workspace-scoped search over local data, cursor scan with debounced input is sufficient |

**Installation:**
```bash
pnpm add @tiptap/extension-image@^3.20.2 @tiptap/markdown@^3.20.0 fflate@^0.8.2
```

## Architecture Patterns

### Recommended New Folders
```
src/
├── command-palette/    # CMD+K palette component, command registry, search results
├── workspace/          # Workspace context provider, workspace CRUD hooks
├── template/           # Template CRUD hooks, template storage
├── search/             # Search index/scan logic, result formatting
├── export/             # Export/import logic, markdown conversion helpers
├── image/              # Image paste handler, blob storage hooks
```

### Pattern 1: Workspace Context Provider
**What:** React context that provides the current workspace ID to all data hooks
**When to use:** Every component that reads or writes data must be workspace-aware
**Example:**
```typescript
// src/workspace/workspace-context.ts
import { createContext } from 'react';

interface WorkspaceContextValue {
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  activeWorkspaceId: 'personal',
  setActiveWorkspaceId: () => {},
});
```

### Pattern 2: Workspace-Scoped Note IDs
**What:** Prefix all note IDs with workspace ID to achieve data isolation
**When to use:** All existing hooks (useNote, useDailyNote, useWeeklyNote, usePermanentNotes) must scope by workspace
**Example:**
```typescript
// Current: 'daily:2026-03-16'
// Workspace-scoped: 'ws:personal:daily:2026-03-16'
// Current: 'setting:permanentNames'
// Workspace-scoped: 'ws:personal:setting:permanentNames'
```
**Key insight:** This approach requires NO IndexedDB schema changes for notes -- just prefix modification in hooks. The existing single `notes` store handles it via key prefixing.

### Pattern 3: Command Registry
**What:** Centralized registry of palette commands with name, keywords, and action
**When to use:** All CMD+K commands (template ops, workspace ops, settings)
**Example:**
```typescript
interface PaletteCommand {
  action: () => void;
  id: string;
  keywords: ReadonlyArray<string>;
  name: string;
}
```

### Pattern 4: Navigation State in App
**What:** Lift the "which note is shown in the left pane" state to the App component
**When to use:** Left pane can now show any note type (daily, weekly, permanent, search result)
**Example:**
```typescript
interface ActiveNote {
  id: string;
  type: 'daily' | 'permanent' | 'weekly';
}
// Default: { id: 'daily:2026-03-16', type: 'daily' }
// After search click: { id: 'permanent:abc123', type: 'permanent' }
// "Back to today" resets to today's daily note
```

### Pattern 5: Image Blob Storage
**What:** Store pasted images as blobs in a separate IndexedDB object store
**When to use:** When user pastes an image from clipboard
**Example:**
```typescript
// New IndexedDB store: 'images' with keyPath 'id'
interface StoredImage {
  blob: Blob;
  id: string;        // 'ws:personal:img:<uuid>'
  mimeType: string;
  updatedAt: number;
}
// In editor: <img src="blob:..." data-image-id="ws:personal:img:abc123">
// On load: resolve data-image-id to blob URL via URL.createObjectURL()
```

### Anti-Patterns to Avoid
- **Storing images as base64 in TipTap JSON:** Bloats note content, slows saves. Use IndexedDB blob store with object URLs.
- **Separate IndexedDB databases per workspace:** Creates migration nightmares. Use key prefixing in a single database.
- **Building search with a full-text index library:** Overkill for local single-user data. Simple cursor scan with text extraction is sufficient and avoids index maintenance.
- **Putting command palette state in global context:** Keep palette open/close state local to the palette component. Only the command actions need to reach app state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TipTap JSON to markdown | Custom recursive JSON walker | @tiptap/markdown `editor.markdown.serialize()` | Handles all node types including code blocks, lists, nested structures correctly |
| Markdown to TipTap JSON | Custom markdown parser | @tiptap/markdown `editor.markdown.parse()` | CommonMark-compliant, handles edge cases |
| Zip file creation | Manual blob assembly | fflate `zipSync()` | Handles compression, directory structure, cross-browser edge cases |
| Zip file extraction | Custom unzip logic | fflate `unzipSync()` | Handles all compression methods, validates CRC |
| Image rendering in editor | Custom image node | @tiptap/extension-image | Handles resize, inline/block modes, alt text, drag-and-drop |
| Date parsing from [[YYYY-MM-DD]] | Custom regex + parser | date-fns `parse()` + `isValid()` | Handles date validation, edge cases (Feb 29, etc.) |

**Key insight:** The export/import feature is the most deceptively complex -- markdown conversion must handle images (rewriting blob URLs to relative paths), custom nodes (date references), and code blocks with language markers. Using @tiptap/markdown avoids building a fragile custom converter.

## Common Pitfalls

### Pitfall 1: Blob URL Lifecycle Management
**What goes wrong:** `URL.createObjectURL()` creates blob URLs that persist until revoked or page unload. Loading many images without revoking old URLs causes memory leaks.
**Why it happens:** Each blob URL holds a reference to the blob in memory.
**How to avoid:** Revoke blob URLs when the component unmounts or when the image is removed. Track active blob URLs in a Map and clean up in useEffect cleanup.
**Warning signs:** Growing memory usage over time, especially after navigating between notes with images.

### Pitfall 2: IndexedDB Schema Migration
**What goes wrong:** Adding new object stores (images, templates) requires incrementing the DB version and handling the upgrade path.
**Why it happens:** IndexedDB only allows schema changes in the `upgrade` callback during `openDB`.
**How to avoid:** Increment `DB_VERSION` to 2 in database.ts. In the upgrade callback, check `oldVersion` and create new stores conditionally. Existing data in the `notes` store is preserved automatically.
**Warning signs:** "InvalidStateError" or empty stores after deployment.

### Pitfall 3: Workspace Migration for Existing Users
**What goes wrong:** Existing users have notes without workspace prefixes. After workspace feature ships, those notes become invisible.
**Why it happens:** New code expects `ws:personal:daily:...` but existing data has `daily:...`.
**How to avoid:** Run a one-time migration in the DB upgrade callback that prefixes all existing keys with `ws:personal:`. Alternatively, have the "personal" workspace use unprefixed keys as a fallback.
**Warning signs:** Users lose all existing notes after update.

### Pitfall 4: TipTap Editor Content Race Condition
**What goes wrong:** When switching notes in the left pane (e.g., clicking a search result), the editor may not update if the content prop changes but the editor instance is stale.
**Why it happens:** TipTap's useEditor has a deps array that controls recreation. If content changes are not properly tracked, the editor shows stale content.
**How to avoid:** Pass the note ID as part of the useEditor deps array so the editor recreates when the displayed note changes. The current `use-editor-config.ts` already uses `[content]` as deps -- ensure the new navigation model passes the correct content for the active note.
**Warning signs:** Clicking a search result shows the previous note's content.

### Pitfall 5: Command Palette Focus Trap
**What goes wrong:** Opening CMD+K steals focus from the editor, but closing it doesn't restore focus to the correct element.
**Why it happens:** Multiple focusable areas (editor, palette input, palette results), and the palette is an overlay.
**How to avoid:** Save `document.activeElement` before opening palette. On close, restore focus to the saved element. Use `role="dialog"` and proper ARIA attributes for the palette.
**Warning signs:** Focus is lost after closing palette; keyboard navigation stops working.

### Pitfall 6: Export Image Path Rewriting
**What goes wrong:** Images in notes reference blob URLs (`blob:http://...`) which are meaningless outside the browser. Export produces markdown with broken image links.
**Why it happens:** Blob URLs are session-specific and not portable.
**How to avoid:** During export, scan each note's TipTap JSON for image nodes, extract the `data-image-id`, fetch the blob from IndexedDB, write it to the `images/` folder in the zip, and rewrite the image `src` to a relative path like `../images/<filename>.png`.
**Warning signs:** Exported markdown files have `blob:` URLs instead of relative paths.

## Code Examples

### Custom Date Reference Node (TipTap Extension)
```typescript
// Source: TipTap Node API docs (https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/node)
import { mergeAttributes, Node } from '@tiptap/core';

export const DateReference = Node.create({
  name: 'dateReference',

  addAttributes() {
    return {
      date: { default: null },
    };
  },

  addInputRules() {
    return [
      // Match [[YYYY-MM-DD]] pattern
      {
        find: /\[\[(\d{4}-\d{2}-\d{2})\]\]$/,
        handler: ({ match, range, state }) => {
          const dateStr = match[1];
          state.tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ date: dateStr }),
          );
        },
      },
    ];
  },

  group: 'inline',
  inline: true,

  parseHTML() {
    return [{ tag: 'span[data-date-ref]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'date-reference',
        'data-date-ref': node.attrs.date,
      }),
      `[[${node.attrs.date}]]`,
    ];
  },
});
```

### Image Paste Handler
```typescript
// Source: TipTap Image extension docs + GitHub issues
// In editor extensions, extend Image with custom paste handling
import Image from '@tiptap/extension-image';

export const ImageWithPaste = Image.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imagePaste'),
        props: {
          handlePaste: (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of items) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;
                // Store blob in IndexedDB, get image ID
                // Insert image node with data-image-id attribute
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
```

### fflate Zip Creation for Export
```typescript
// Source: fflate README (https://github.com/101arrowz/fflate)
import { strToU8, zipSync } from 'fflate';

function createExportZip(
  files: Record<string, string>,
  images: Record<string, Uint8Array>,
): Blob {
  const zipData: Record<string, Uint8Array> = {};

  for (const [path, content] of Object.entries(files)) {
    zipData[path] = strToU8(content);
  }

  for (const [path, data] of Object.entries(images)) {
    zipData[path] = data;
  }

  const zipped = zipSync(zipData);
  return new Blob([zipped], { type: 'application/zip' });
}
```

### IndexedDB Schema Migration (v1 to v2)
```typescript
// Source: idb docs + existing database.ts pattern
import { openDB } from 'idb';

const DB_VERSION = 2;

export async function getDatabase() {
  return openDB('paneful-notes', DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
    },
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tiptap-markdown (community) | @tiptap/markdown (official) | Late 2025 | Official support, better maintenance, MIT license |
| JSZip for browser zips | fflate | 2021+ | 8KB vs 100KB+, faster, sync API |
| Base64 images inline | IndexedDB blob store + object URLs | Best practice | Dramatically smaller note payloads, faster saves |
| Separate DB per workspace | Key-prefixed single DB | N/A (architecture choice) | Simpler migrations, shared connection pool |

**Deprecated/outdated:**
- `tiptap-markdown` community package: Still works but @tiptap/markdown is the official replacement
- @tiptap/markdown is labeled "early release" -- edge cases may exist, but it handles the common node types (paragraphs, headings, lists, code blocks, images, bold, italic, links)

## Open Questions

1. **@tiptap/markdown Image Node Serialization**
   - What we know: @tiptap/markdown handles standard nodes. Image nodes with custom attributes (data-image-id) may need custom serializer config.
   - What's unclear: Whether the extension automatically handles image nodes or requires custom tokenizer registration.
   - Recommendation: Test with a simple image node first. If custom handling is needed, use the extension's custom serializer API. Worst case, manually scan TipTap JSON for image nodes during export.

2. **Workspace Key Migration Strategy**
   - What we know: Existing users have unprefixed note keys (e.g., `daily:2026-03-16`).
   - What's unclear: Whether to migrate all keys on DB upgrade or use fallback logic in hooks.
   - Recommendation: Use the simpler approach -- have the default "personal" workspace NOT use a prefix. Only additional workspaces use `ws:<id>:` prefix. This avoids migration entirely and existing data works as-is.

3. **Search Performance at Scale**
   - What we know: Simple cursor scan works well for hundreds of notes. A single workspace is unlikely to have thousands.
   - What's unclear: Performance with very large notes (100KB+ TipTap JSON).
   - Recommendation: Start with simple scan. Debounce search input at 200ms. If performance issues arise, add a text cache alongside notes to avoid parsing TipTap JSON on every search.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vite.config.ts (test section) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TMPL-01 | Save note content as template | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "save template"` | Wave 0 |
| TMPL-03 | Set default weekday template | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "default weekday"` | Wave 0 |
| TMPL-04 | Set default weekend template | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "default weekend"` | Wave 0 |
| TMPL-05 | Set default weekly template | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "default weekly"` | Wave 0 |
| WKSP-01 | Create named workspaces | unit | `pnpm vitest run src/workspace/__tests__/use-workspaces.test.ts -t "create"` | Wave 0 |
| WKSP-02 | Switch workspaces, content isolated | unit | `pnpm vitest run src/workspace/__tests__/use-workspaces.test.ts -t "switch"` | Wave 0 |
| WKSP-03 | Workspace data isolation | unit | `pnpm vitest run src/workspace/__tests__/use-workspaces.test.ts -t "isolation"` | Wave 0 |
| SRCH-01 | Search across workspace notes | unit | `pnpm vitest run src/search/__tests__/search.test.ts -t "search across"` | Wave 0 |
| SRCH-02 | Highlighted search snippets | unit | `pnpm vitest run src/search/__tests__/search.test.ts -t "highlight"` | Wave 0 |
| DATA-02 | Export as markdown zip | unit | `pnpm vitest run src/export/__tests__/export.test.ts -t "export zip"` | Wave 0 |
| DATA-03 | Import markdown files | unit | `pnpm vitest run src/export/__tests__/import.test.ts -t "import"` | Wave 0 |
| EDIT-03 | Paste images, display inline | manual-only | Manual: paste image from clipboard in browser | N/A |
| EDIT-04 | [[YYYY-MM-DD]] clickable link | unit | `pnpm vitest run src/editor/__tests__/date-reference.test.ts -t "date reference"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/template/__tests__/use-templates.test.ts` -- covers TMPL-01, TMPL-03, TMPL-04, TMPL-05
- [ ] `src/workspace/__tests__/use-workspaces.test.ts` -- covers WKSP-01, WKSP-02, WKSP-03
- [ ] `src/search/__tests__/search.test.ts` -- covers SRCH-01, SRCH-02
- [ ] `src/export/__tests__/export.test.ts` -- covers DATA-02
- [ ] `src/export/__tests__/import.test.ts` -- covers DATA-03
- [ ] `src/editor/__tests__/date-reference.test.ts` -- covers EDIT-04

## Sources

### Primary (HIGH confidence)
- TipTap Image Extension docs: https://tiptap.dev/docs/editor/extensions/nodes/image -- inline mode, configuration, setImage command
- TipTap Node API docs: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/node -- custom inline node creation
- TipTap Markdown docs: https://tiptap.dev/docs/editor/markdown -- bidirectional conversion API
- fflate GitHub: https://github.com/101arrowz/fflate -- zipSync/unzipSync API, bundle size
- npm registry: @tiptap/extension-image 3.20.3 (MIT), @tiptap/markdown 3.20.3 (MIT), fflate 0.8.2 (MIT)

### Secondary (MEDIUM confidence)
- @tiptap/markdown is labeled "early release" by TipTap team -- edge cases may exist but core functionality (paragraphs, headings, lists, code, images) is stable
- TipTap GitHub issue #2912 -- community patterns for clipboard image paste handling

### Tertiary (LOW confidence)
- Search performance at scale -- no benchmarks found for IndexedDB cursor scan over large TipTap JSON datasets; recommendation based on architectural reasoning

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries verified on npm with current versions and MIT licenses
- Architecture: HIGH - patterns derived from existing codebase conventions and TipTap official docs
- Pitfalls: HIGH - blob URL lifecycle, schema migration, and key prefixing are well-documented challenges
- @tiptap/markdown fidelity: MEDIUM - official but labeled "early release"; core features work, custom node serialization may need testing

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable ecosystem, pinned TipTap version)
