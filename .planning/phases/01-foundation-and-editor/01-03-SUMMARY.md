---
phase: 01-foundation-and-editor
plan: 03
subsystem: editor
tags: [tiptap, prosemirror, wysiwyg, lowlight, css, react]

# Dependency graph
requires:
  - phase: 01-foundation-and-editor/01-02
    provides: useNote hook, requestPersistence, Note type
provides:
  - TipTap editor component with StarterKit + CodeBlockLowlight
  - App shell wiring editor to IndexedDB storage via useNote
  - StorageWarning component for error display
  - Full CSS styling per UI-SPEC (720px centered, typography scale)
  - Persistent storage request on app startup
affects: [02-core-product]

# Tech tracking
tech-stack:
  added: []
  patterns: [immediatelyRender-false-ssr-safe, mock-hook-not-library]

key-files:
  created:
    - src/editor/extensions.ts
    - src/editor/use-editor-config.ts
    - src/editor/editor.tsx
    - src/app/app.css
    - src/app/storage-warning.tsx
    - src/editor/__tests__/editor.test.tsx
  modified:
    - src/app/app.tsx
    - src/main.tsx

key-decisions:
  - "immediatelyRender: false for TipTap useEditor (required for Editor | null return type and SSR-safe rendering)"
  - "content fallback to empty string instead of undefined (TipTap Content type rejects undefined)"
  - "Mock useEditorConfig hook in tests instead of TipTap useEditor (avoids jsdom ProseMirror initialization issues)"

patterns-established:
  - "immediatelyRender: false pattern for TipTap in non-SSR contexts (enables null guard)"
  - "Mock at component hook boundary, not library boundary, for editor tests"

requirements-completed: [EDIT-01, EDIT-02, EDIT-05]

# Metrics
duration: 6min
completed: 2026-03-15
---

# Phase 1 Plan 3: Editor Component and App Shell Summary

**TipTap WYSIWYG editor with StarterKit + CodeBlockLowlight, auto-save to IndexedDB via useNote, storage error warnings, and persistent storage request on startup**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-16T06:22:54Z
- **Completed:** 2026-03-16T06:29:03Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- TipTap editor with StarterKit (headings, bold, italic, lists, blockquote, undo/redo) and CodeBlockLowlight for syntax-highlighted code blocks
- App shell wiring editor to useNote for 300ms debounced auto-save to IndexedDB with flush on blur/visibility/unload
- Full CSS styling per UI-SPEC: 720px centered layout, responsive padding, typography scale, code block and blockquote styles
- StorageWarning component with role=alert for accessibility, shown on IndexedDB write failures
- requestPersistence() called on app startup for Safari ITP mitigation
- 12 total tests passing (3 editor + 5 useNote + 4 requestPersistence)

## Task Commits

Each task was committed atomically:

1. **Task 1: TipTap editor component with extensions and styling** - `ab2c638` (feat)
2. **Task 2: Wire app shell with editor, storage, warnings, persistence** - `a9d1d82` (feat)

## Files Created/Modified

- `src/editor/extensions.ts` - StarterKit (codeBlock disabled) + CodeBlockLowlight with lowlight common languages
- `src/editor/use-editor-config.ts` - useEditor wrapper with autofocus, immediatelyRender: false, JSONContent onUpdate
- `src/editor/editor.tsx` - NoteEditor component with null editor guard and EditorContent
- `src/app/app.css` - Full styling: reset, 720px container, typography, blockquote, code, responsive, storage warning
- `src/app/storage-warning.tsx` - Fixed-position warning banner with role=alert
- `src/app/app.tsx` - Root component connecting NoteEditor to useNote, conditional StorageWarning
- `src/main.tsx` - Added requestPersistence() call before React render
- `src/editor/__tests__/editor.test.tsx` - 3 tests: null render, editor render, props passing

## Decisions Made

- **immediatelyRender: false for useEditor:** TipTap v3 has two overloads -- without `immediatelyRender: false` it returns `Editor` (not null), which makes the null guard unnecessary per TypeScript strict checking. Adding this flag enables the `Editor | null` return type needed for the null guard pattern from RESEARCH.md Pitfall 4.
- **content fallback to empty string:** TipTap's `Content` type does not accept `undefined`. Changed `content ?? undefined` to `content ?? ''` to satisfy strict type checking.
- **Mock useEditorConfig not useEditor in tests:** Mocking TipTap's `useEditor` directly leads to type issues with overload resolution. Mocking our own `useEditorConfig` hook is cleaner and avoids jsdom ProseMirror initialization errors.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TipTap useEditor content type incompatibility**
- **Found during:** Task 1 (use-editor-config.ts)
- **Issue:** `content ?? undefined` produces `JSONContent | undefined` but TipTap's `Content` type does not accept `undefined` with exactOptionalPropertyTypes
- **Fix:** Changed to `content ?? ''` (empty string is valid Content)
- **Files modified:** src/editor/use-editor-config.ts
- **Verification:** typecheck passes
- **Committed in:** ab2c638

**2. [Rule 3 - Blocking] useEditor overload requires immediatelyRender: false for null return**
- **Found during:** Task 1 (use-editor-config.ts)
- **Issue:** Without `immediatelyRender: false`, TypeScript resolves to the overload returning `Editor` (not `Editor | null`), making the null guard in editor.tsx a lint error
- **Fix:** Added `immediatelyRender: false` to useEditor options
- **Files modified:** src/editor/use-editor-config.ts
- **Verification:** lint passes, typecheck passes
- **Committed in:** ab2c638

**3. [Rule 1 - Bug] EditorContent crashes with mock editor in jsdom**
- **Found during:** Task 2 (editor tests)
- **Issue:** Real EditorContent component tries to access `editor.view.dom` which is undefined on mock objects
- **Fix:** Mocked both EditorContent and useEditorConfig; used Object.create(null) as truthy mock value to avoid `as` casting
- **Files modified:** src/editor/__tests__/editor.test.tsx
- **Verification:** all 12 tests pass
- **Committed in:** a9d1d82

---

**Total deviations:** 3 auto-fixed (2 blocking type issues, 1 test bug)
**Impact on plan:** All fixes required for strict TypeScript + ESLint compliance. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 complete: working WYSIWYG editor that persists to IndexedDB
- All 12 tests passing, lint clean, typecheck clean, build succeeds
- Ready for Phase 2: split-pane layout, daily/weekly note types, workspace management

---

*Phase: 01-foundation-and-editor*
*Completed: 2026-03-15*
