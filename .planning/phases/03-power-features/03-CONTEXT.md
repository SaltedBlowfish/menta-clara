# Phase 3: Power Features - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Templates, workspaces, search, image paste, date references, and data export/import. This phase adds power-user features on top of the complete split-pane daily/weekly/permanent notes experience built in Phase 2. It also introduces a unified command palette (CMD+K) that serves as the central interaction point for all non-editor actions, and refactors the permanent notes section into a note browser list with an "open in main editor" navigation model.

</domain>

<decisions>
## Implementation Decisions

### Command Palette (CMD+K)
- Unified palette for search AND commands: typing text searches notes, typing `>` prefix accesses commands
- Real-time search results that update with each keystroke (debounced)
- Search results show note title/date + highlighted text snippet around the match
- Small floating search/magnifying glass icon button for discoverability (like the existing theme toggle)
- All template management, workspace switching, and settings accessed through `>` commands in the palette

### Template System
- Templates used ONLY for initial note creation (daily/weekly auto-creation), not for loading into existing notes
- Save current note content as a named template via CMD+K > "Save as template"
- Full CRUD in palette: list, rename, delete, edit templates — all through CMD+K commands
- Assign default templates via palette commands: "Set weekday template", "Set weekend template", "Set weekly template"
- Each command shows a list of saved templates to pick from

### Workspaces
- Create and switch workspaces via CMD+K palette commands only — no dedicated UI element
- Instant switch: content swaps immediately, pending saves flush first, no confirmation dialog
- Subtle non-interactive workspace name label displayed top-left (informational only, switching via CMD+K)
- Default "Personal" workspace exists from first launch — all existing notes live here, user can rename it
- Each workspace fully isolated: own daily notes, weekly notes, permanent notes, templates, and settings

### Navigation Model (significant UX change)
- Left pane = main editor. Shows today's daily note by default, but can display ANY note when navigated to
- Right pane permanent notes section refactored into a note browser — a list of named/permanent notes
- Clicking a note in the right-pane list previews it in the mini pane; an "open in main editor" action sends it to the left pane
- Search results (any type: daily, weekly, permanent) open in the left pane main editor
- Date reference links ([[YYYY-MM-DD]]) open the target daily note in the left pane
- Calendar clicks continue to work as before (navigate daily note in left pane)
- Persistent "Back to today" button appears at top of left pane when viewing a non-today note

### Search
- Searches across all notes in the current workspace (daily, weekly, permanent)
- Results show note name/date with highlighted matching text snippet
- Clicking a result opens the note in the left pane main editor and closes the palette

### Image Paste
- Paste images from clipboard, render inline in the TipTap editor
- Images stored as blobs in IndexedDB (local blob store, not base64 inline)

### Date References
- Type [[YYYY-MM-DD]] and it renders as a clickable link
- Clicking navigates to that day's daily note in the left pane main editor

### Data Export/Import
- Export as zip with flat-by-type folder structure: daily/, weekly/, permanent/, images/
- Full export scope: notes + images + templates + workspace settings
- Images extracted from IndexedDB blobs into images/ folder with relative path references in markdown
- TipTap JSON content converted to markdown for export files
- Import: when a note already exists, append imported content below existing content with a clear heading (e.g., "## Imported on [date]") and notify the user — no silent overwrites, no data loss
- Import handles all exported content types (notes, images, templates, settings)

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prior Phase Context
- `.planning/phases/01-foundation-and-editor/01-CONTEXT.md` -- Phase 1 decisions: folder structure, CSS approach, storage patterns, TipTap config, idb usage
- `.planning/phases/02-core-product-experience/02-CONTEXT.md` -- Phase 2 decisions: split-pane layout, note ID formats, keyboard shortcuts, theming, accessibility patterns

### Project Constraints
- `.planning/PROJECT.md` -- Tech stack (React + TS + ESLint + Prettier), file size limits (100 lines), no default exports, alphabetized imports, makingsoftware.com design philosophy
- `.planning/REQUIREMENTS.md` -- Phase 3 requirement IDs: TMPL-01 through TMPL-05, WKSP-01 through WKSP-03, SRCH-01 through SRCH-03, DATA-02, DATA-03, EDIT-03, EDIT-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/storage/database.ts` -- IndexedDB via `idb`, single `notes` store with keyPath `id`. Needs schema extension for templates, workspace settings, and image blobs
- `src/storage/use-note.ts` -- useNote hook with debounced save, blur/visibility flush. Reuse for all note types in the new navigation model
- `src/shared/use-persisted-state.ts` -- Generic persisted state hook (uses notes store). Reuse for workspace settings, template defaults
- `src/shared/use-keyboard-shortcuts.ts` -- Keyboard shortcut registration. Extend with CMD+K for palette
- `src/editor/extensions.ts` -- TipTap extensions (StarterKit + CodeBlockLowlight). Extend with Image extension and custom date reference node
- `src/editor/editor.tsx` -- NoteEditor component. Already accepts content/onUpdate props, reusable as-is in left pane main editor model
- `src/shared/collapsible-section.tsx` -- Collapsible section wrapper. Reuse for note browser section in right pane
- `src/theme/theme-toggle.tsx` -- Floating icon button pattern. Reference for search icon button styling

### Established Patterns
- Plain CSS with class names (no CSS modules, no Tailwind)
- Hook-only data access (useNote, usePersistedState, useDailyNote, useWeeklyNote, usePermanentNotes)
- Note ID prefix convention: `daily:YYYY-MM-DD`, `weekly:YYYY-Wnn`, `permanent:<slug>`
- Type guard pattern for IndexedDB reads (no `as` casting)
- eslint-disable comments for unavoidable IndexedDB type assertions (established pattern)

### Integration Points
- `src/app/app.tsx` -- Main app shell. Needs command palette overlay and workspace context provider
- `src/permanent/permanent-section.tsx` -- Currently renders dropdown + editor. Phase 3 refactors to note browser list
- `src/permanent/use-permanent-notes.ts` -- Hook for permanent note CRUD. Extend for workspace-scoped queries
- `src/daily/daily-pane.tsx` -- Currently always shows today. Phase 3 makes it accept any note ID with "back to today" navigation
- `src/calendar/calendar-section.tsx` -- Calendar click navigation. No changes needed (already navigates daily notes)

</code_context>

<specifics>
## Specific Ideas

- Command palette inspired by VS Code / Linear: text input at top, results below, `>` prefix for commands
- Note browser in right pane replaces the current permanent note dropdown + inline editor
- "Back to today" as a persistent link/button, not a keyboard shortcut (discoverable for all users)
- Import conflict handling: never lose data. Append with a clear heading so the user can manually merge
- Full export = full backup: should be possible to recreate an entire workspace from an export zip

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 03-power-features*
*Context gathered: 2026-03-16*
