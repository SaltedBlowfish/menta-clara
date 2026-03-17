---
phase: 03-power-features
plan: 03
subsystem: editor, ui
tags: [tiptap, prosemirror, image-paste, date-reference, indexeddb, input-rules]

requires:
  - phase: 03-01
    provides: "Database schema with images store, ActiveNoteContext for navigation"
provides:
  - "ImageWithPaste TipTap extension for clipboard image pasting to IndexedDB"
  - "DateReference TipTap inline node for [[YYYY-MM-DD]] clickable links"
  - "Image storage functions (storeImage, loadImage, deleteImage)"
  - "NoteBrowserItem component for permanent notes list"
  - "Refactored permanent section from dropdown to browsable list"
affects: [03-04, 03-05]

tech-stack:
  added: ["@tiptap/core", "@tiptap/extension-image", "@tiptap/extension-code-block"]
  patterns: ["TipTap extension with ProseMirror plugin", "Custom event dispatch for cross-component navigation", "pnpm overrides for version pinning"]

key-files:
  created:
    - "src/image/use-image-store.ts"
    - "src/editor/image-paste.ts"
    - "src/editor/date-reference.ts"
    - "src/editor/date-reference.css"
    - "src/permanent/note-browser-item.tsx"
    - "src/permanent/note-browser-item.css"
    - ".npmrc"
  modified:
    - "src/editor/extensions.ts"
    - "src/permanent/permanent-section.tsx"
    - "src/permanent/permanent-section.css"
    - "package.json"

key-decisions:
  - "Pin all @tiptap packages to 3.20.2 via pnpm overrides (3.20.3 ships without dist files)"
  - "Add shamefully-hoist and public-hoist-pattern for @tiptap/* in .npmrc"
  - "Use nodeInputRule from @tiptap/core instead of raw input rule objects"
  - "Date reference click dispatches CustomEvent rather than direct context access"
  - "Removed NoteDropdown and InlineTitle from permanent section (replaced by NoteBrowserItem)"

patterns-established:
  - "TipTap extension pattern: extend base, add ProseMirror plugins for paste/click handling"
  - "Cross-component navigation: dispatch CustomEvent from ProseMirror, listen in App"
  - "Image storage: pure async functions (not hooks) for use inside ProseMirror plugins"

requirements-completed: [EDIT-03, EDIT-04]

duration: 13min
completed: 2026-03-16
---

# Phase 3 Plan 3: Editor Extensions and Note Browser Summary

**TipTap image paste with IndexedDB blob storage, [[YYYY-MM-DD]] date reference input rules, and permanent notes browser list replacing dropdown UI**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-17T05:04:08Z
- **Completed:** 2026-03-17T05:17:08Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Image paste extension intercepts clipboard events and stores blobs in IndexedDB images store
- Date reference input rule transforms [[YYYY-MM-DD]] to formatted clickable inline nodes
- Permanent notes section refactored from dropdown to browsable list with "open in editor" action
- Full ARIA support on note browser (listbox/option/aria-selected)

## Task Commits

Each task was committed atomically:

1. **Task 1: Image paste extension + Date reference extension** - `a2c5ab1` (feat)
2. **Task 2: Refactor permanent section to note browser list** - `a7b8de9` (feat)

## Files Created/Modified
- `src/image/use-image-store.ts` - IndexedDB image blob CRUD (storeImage, loadImage, deleteImage)
- `src/editor/image-paste.ts` - TipTap Image extension with paste handler
- `src/editor/date-reference.ts` - Custom TipTap inline node for [[YYYY-MM-DD]] date references
- `src/editor/date-reference.css` - Date reference link styles
- `src/editor/extensions.ts` - Added ImageWithPaste and DateReference to editor extensions
- `src/permanent/note-browser-item.tsx` - Single item in note browser list with open-in-editor action
- `src/permanent/note-browser-item.css` - Note browser item styles with hover reveal
- `src/permanent/permanent-section.tsx` - Refactored from dropdown+editor to list+preview
- `src/permanent/permanent-section.css` - Updated styles for list layout
- `.npmrc` - Added shamefully-hoist for @tiptap dependency resolution
- `package.json` - Added @tiptap/core, extension-image, extension-code-block; pnpm overrides

## Decisions Made
- Pinned all @tiptap packages to 3.20.2 via pnpm overrides because 3.20.3 ships without dist files (broken npm publish)
- Used `nodeInputRule` from `@tiptap/core` instead of raw input rule objects (TypeScript compatibility)
- Date reference click handler dispatches `CustomEvent('date-reference-click')` on `window` rather than accessing React context directly from ProseMirror
- Image store uses pure async functions (not React hooks) since ProseMirror plugins cannot call hooks
- Cast `Array.from(items)` as `DataTransferItem[]` for TypeScript strict mode compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @tiptap/core not installed as direct dependency**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `@tiptap/core` was only a transitive dependency; direct import failed with TS2307
- **Fix:** Added `@tiptap/core` as direct dependency
- **Files modified:** package.json
- **Verification:** `pnpm tsc --noEmit` passes
- **Committed in:** a2c5ab1 (Task 1 commit)

**2. [Rule 3 - Blocking] @tiptap 3.20.3 ships without dist files**
- **Found during:** Task 1 (build verification)
- **Issue:** `^3.20.2` resolved to 3.20.3 which has no dist/ directory, breaking all @tiptap/react imports
- **Fix:** Added pnpm overrides pinning all @tiptap packages to 3.20.2; added .npmrc with shamefully-hoist
- **Files modified:** package.json, .npmrc
- **Verification:** `pnpm build` completes successfully
- **Committed in:** a2c5ab1 (Task 1 commit)

**3. [Rule 1 - Bug] InputRule API mismatch**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Raw input rule objects missing required `undoable` property; `state.tr` is read-only
- **Fix:** Used `nodeInputRule()` helper from `@tiptap/core` which handles all required properties
- **Files modified:** src/editor/date-reference.ts
- **Verification:** `pnpm tsc --noEmit` passes
- **Committed in:** a2c5ab1 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for build correctness. No scope creep.

## Issues Encountered
- @tiptap 3.20.3 appears to be a broken release (no compiled dist files). Resolved by pinning to 3.20.2 across the dependency tree via pnpm overrides.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Editor extensions are registered and functional
- Date reference click events ready for App-level listener (to be wired in future plan)
- Note browser list ready for integration with left pane navigation
- Image loading from IndexedDB on editor mount needs to be wired (future plan)

---
*Phase: 03-power-features*
*Completed: 2026-03-16*
