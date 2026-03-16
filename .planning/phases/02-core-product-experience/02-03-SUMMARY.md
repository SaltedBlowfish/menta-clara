---
phase: 02-core-product-experience
plan: 03
subsystem: ui
tags: [date-fns, iso-week, indexeddb, react-hooks, collapsible-section]

requires:
  - phase: 01-foundation-and-editor
    provides: "NoteEditor component, useNote hook, IndexedDB database module"
  - phase: 02-core-product-experience
    provides: "CollapsibleSection, usePersistedState, StorageWarning, CSS custom properties"
provides:
  - "WeeklySection component with ISO week calculation and auto-creation"
  - "PermanentSection component with dropdown selection, inline creation, and CRUD"
  - "getWeekId pure function (Date -> weekly:YYYY-Wnn)"
  - "usePermanentNotes hook for IndexedDB-backed permanent note management"
  - "NoteDropdown component with native select and inline input creation"
affects: [02-04]

tech-stack:
  added: []
  patterns: [iso-week-id-format, permanent-uuid-id-format, names-map-persisted-state, auto-create-on-first-load]

key-files:
  created:
    - src/weekly/get-week-id.ts
    - src/weekly/use-weekly-note.ts
    - src/weekly/weekly-section.tsx
    - src/weekly/weekly-section.css
    - src/permanent/use-permanent-notes.ts
    - src/permanent/note-dropdown.tsx
    - src/permanent/note-dropdown.css
    - src/permanent/permanent-section.tsx
    - src/permanent/permanent-section.css
  modified: []

key-decisions:
  - "Permanent note names stored as Record<string,string> in usePersistedState rather than per-note metadata entries"
  - "Weekly note auto-creates empty doc (no heading) since section header shows Week N"
  - "useNote called with __unused__ sentinel when no permanent note selected to avoid conditional hook"

patterns-established:
  - "Weekly ID format: weekly:YYYY-Wnn using date-fns getISOWeek/getISOWeekYear"
  - "Permanent ID format: permanent:<uuid> with names map in usePersistedState"
  - "Auto-create pattern: useRef guard to prevent duplicate creation on null content"
  - "Inline creation: local creating state with input, Enter to confirm, Escape to cancel"

requirements-completed: [WEEK-01, WEEK-02, WEEK-03, PERM-01, PERM-02, PERM-03]

duration: 2min
completed: 2026-03-16
---

# Phase 2 Plan 3: Weekly & Permanent Notes Summary

**Weekly note section with ISO week calculation and permanent notes CRUD with dropdown selection and inline creation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T07:25:16Z
- **Completed:** 2026-03-16T07:27:42Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Weekly note section using date-fns ISO week calculation with auto-create on first load
- Permanent notes with IndexedDB CRUD, dropdown selection, and inline note creation input
- Both sections use CollapsibleSection and NoteEditor from prior plans

## Task Commits

Each task was committed atomically:

1. **Task 1: Weekly note section with ISO week calculation** - `27d68f0` (feat)
2. **Task 2: Permanent notes section with dropdown selection and CRUD** - `73abbd5` (feat)

## Files Created/Modified
- `src/weekly/get-week-id.ts` - Pure function mapping Date to weekly:YYYY-Wnn using date-fns
- `src/weekly/use-weekly-note.ts` - Hook wrapping useNote with weekly ID and auto-creation
- `src/weekly/weekly-section.tsx` - Collapsible weekly note section with NoteEditor
- `src/weekly/weekly-section.css` - Minimal section styles (inherits from collapsible-section)
- `src/permanent/use-permanent-notes.ts` - Hook for listing, creating, selecting, deleting permanent notes
- `src/permanent/note-dropdown.tsx` - Native select dropdown with inline creation input
- `src/permanent/note-dropdown.css` - Dropdown and inline input styles with theme tokens
- `src/permanent/permanent-section.tsx` - Collapsible permanent notes section with empty state
- `src/permanent/permanent-section.css` - Empty state messaging styles

## Decisions Made
- Permanent note names stored as a single Record<string,string> in usePersistedState rather than individual metadata entries per note
- Weekly note auto-creates an empty doc without heading since the section header already shows "Week N"
- useNote called with `__unused__` sentinel when no permanent note is selected to avoid conditional hook call

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed perfectionist/sort-imports lint errors**
- **Found during:** Task 1 and Task 2
- **Issue:** Blank lines between same-group imports violated perfectionist sort-imports rule
- **Fix:** Removed extra blank lines between imports in the same group
- **Files modified:** src/weekly/use-weekly-note.ts, src/weekly/weekly-section.tsx, src/permanent/permanent-section.tsx
- **Verification:** pnpm lint passes
- **Committed in:** 27d68f0 (Task 1), 73abbd5 (Task 2)

---

**Total deviations:** 1 auto-fixed (1 bug - lint formatting)
**Impact on plan:** Lint compliance fix only. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- WeeklySection and PermanentSection ready for right pane integration in Plan 04
- Both components accept standard props and manage their own IndexedDB state
- All components tested via lint, typecheck, and build verification

---
*Phase: 02-core-product-experience*
*Completed: 2026-03-16*
