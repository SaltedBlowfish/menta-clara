---
phase: 02-core-product-experience
plan: 04
subsystem: ui
tags: [react, calendar, keyboard-shortcuts, split-pane, tiptap, accessibility]

requires:
  - phase: 02-core-product-experience/02-02
    provides: "Split-pane layout, daily note pane, app shell"
  - phase: 02-core-product-experience/02-03
    provides: "Weekly section, permanent notes section"
provides:
  - "Mini calendar with month navigation and note-existence dots"
  - "Global keyboard shortcuts for pane switching"
  - "Fully wired app shell with all four content areas"
  - "Right pane layout with toolbar, scrollable sections, fixed calendar"
  - "Inline title editing for permanent notes"
  - "Double-click divider to reset ratio"
affects: [03-power-features]

tech-stack:
  added: [date-fns]
  patterns: [useCalendar-hook, IDBKeyRange-prefix-query, inline-title-editing]

key-files:
  created:
    - src/calendar/use-calendar.ts
    - src/calendar/calendar-day.tsx
    - src/calendar/calendar-grid.tsx
    - src/calendar/calendar-grid.css
    - src/calendar/calendar-section.tsx
    - src/calendar/calendar-section.css
    - src/shared/use-keyboard-shortcuts.ts
    - src/permanent/inline-title.tsx
    - src/permanent/inline-title.css
  modified:
    - src/app/app.tsx
    - src/app/app.css
    - src/layout/split-pane.css
    - src/layout/pane-divider.tsx
    - src/daily/daily-pane.tsx
    - src/daily/daily-pane.css
    - src/weekly/weekly-section.tsx
    - src/weekly/weekly-section.css
    - src/permanent/permanent-section.tsx
    - src/permanent/permanent-section.css
    - src/permanent/note-dropdown.tsx
    - src/permanent/note-dropdown.css
    - src/permanent/use-permanent-notes.ts
    - src/theme/theme-toggle.css
    - src/theme/theme-tokens.css

key-decisions:
  - "Theme toggle moved from fixed position to dedicated right-pane toolbar"
  - "Right pane uses flexbox layout with fixed calendar at bottom and scrollable sections"
  - "Permanent note naming via inline title editing instead of separate input dialog"
  - "Input background/text theme tokens added for dark mode contrast"

patterns-established:
  - "Right pane layout: toolbar + scrollable sections + fixed calendar"
  - "Inline title editing pattern for direct manipulation"
  - "Section titles as orientation labels"

requirements-completed: [CALR-01, CALR-02, CALR-03, CALR-04, LAYO-03, KEYS-01, KEYS-02, KEYS-03, KEYS-04, A11Y-02, A11Y-05]

duration: 4min
completed: 2026-03-16
---

# Phase 2 Plan 4: Calendar, Keyboard Shortcuts, and App Shell Summary

**Mini calendar with month navigation and note dots, keyboard shortcuts for pane switching, and fully wired app shell with 10 user-reported UI fixes including right-pane layout restructuring, inline title editing, and dark mode contrast**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T07:49:27Z
- **Completed:** 2026-03-16T07:53:36Z
- **Tasks:** 3
- **Files modified:** 27

## Accomplishments
- Mini calendar renders month grid with dots on days that have notes, highlights today and selected day, supports month navigation
- Global keyboard shortcuts (CMD+[/]) for pane switching with proper preventDefault
- All four content areas (daily, weekly, permanent, calendar) wired into app shell
- 10 user-reported UI issues fixed: calendar circles, right pane layout, theme toggle positioning, dark mode input contrast, expanded editor click area, section titles, weekly editor visibility, inline title editing, right pane overflow, double-click divider reset

## Task Commits

Each task was committed atomically:

1. **Task 1: Mini calendar with month navigation and note-existence dots** - `ffa6e67` (feat)
2. **Task 2: Keyboard shortcuts and final app shell wiring** - `f16835f` (feat)
3. **Task 3: Visual and functional verification fixes** - `df4f3c1` (fix)

## Files Created/Modified
- `src/calendar/use-calendar.ts` - Month navigation hook with IndexedDB note query
- `src/calendar/calendar-day.tsx` - Individual day cell with today/selected/dot indicators
- `src/calendar/calendar-grid.tsx` - 7-column month grid with weekday headers
- `src/calendar/calendar-section.tsx` - Collapsible calendar section with nav buttons
- `src/shared/use-keyboard-shortcuts.ts` - Global keyboard shortcut registration
- `src/permanent/inline-title.tsx` - Inline editable title for permanent notes
- `src/app/app.tsx` - Fully wired app shell with right-pane layout structure
- `src/app/app.css` - Right pane layout styles, section titles
- `src/layout/pane-divider.tsx` - Added double-click to reset ratio
- `src/layout/split-pane.css` - Right pane overflow fix
- `src/theme/theme-tokens.css` - Input background/text tokens for dark mode
- `src/theme/theme-toggle.css` - Removed fixed positioning for toolbar placement

## Decisions Made
- Theme toggle moved from fixed position overlay to a dedicated toolbar row in the right pane, preventing overlap with content
- Right pane restructured with flexbox: toolbar (fixed) + sections (flex 1 each, scrollable) + calendar (fixed at bottom)
- Permanent note naming changed from modal/input-based to inline title editing at top of note content area, matching direct manipulation design principle
- Added --color-input-bg and --color-input-text theme tokens for proper dark mode input contrast
- Calendar day cells use aspect-ratio: 1 instead of fixed height for proper circular rendering at any width

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Calendar day cells rendered as ellipses**
- **Found during:** Task 3 (user feedback)
- **Issue:** Calendar day buttons had fixed height: 32px with width: 100%, causing elliptical border-radius at wider sizes
- **Fix:** Replaced fixed height with aspect-ratio: 1
- **Files modified:** src/calendar/calendar-grid.css
- **Committed in:** df4f3c1

**2. [Rule 2 - Missing Critical] Dark mode input text unreadable**
- **Found during:** Task 3 (user feedback)
- **Issue:** Note name input had no explicit background in dark mode, making text invisible
- **Fix:** Added --color-input-bg and --color-input-text theme tokens, applied to input elements
- **Files modified:** src/theme/theme-tokens.css, src/permanent/note-dropdown.css
- **Committed in:** df4f3c1

**3. [Rule 2 - Missing Critical] No section titles for user orientation**
- **Found during:** Task 3 (user feedback)
- **Issue:** Users couldn't tell what each pane section was for
- **Fix:** Added "Daily Note", "Weekly Note", "Permanent Notes" section title labels
- **Files modified:** src/app/app.css, src/daily/daily-pane.tsx, src/weekly/weekly-section.tsx, src/permanent/permanent-section.tsx
- **Committed in:** df4f3c1

**4. [Rule 1 - Bug] Right pane content pushed calendar below fold**
- **Found during:** Task 3 (user feedback)
- **Issue:** Right pane used overflow-y: auto on entire pane, allowing calendar to scroll out of view
- **Fix:** Restructured right pane with flex layout: toolbar + scrollable sections + fixed calendar at bottom
- **Files modified:** src/layout/split-pane.css, src/app/app.tsx, src/app/app.css
- **Committed in:** df4f3c1

---

**Total deviations:** 10 user-reported issues fixed (all in Task 3 commit)
**Impact on plan:** All fixes address usability and correctness issues found during visual review. Inline title editing is a design improvement over the original separate-input approach.

## Issues Encountered
None beyond the user-reported issues addressed in Task 3.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 2 Core Product Experience is fully complete
- All four content areas wired and functional
- Ready for Phase 3 Power Features (templates, workspaces, search)
- Keyboard shortcut placeholders scaffolded for CMD+K (search) and CMD+W (workspace switching)

---
*Phase: 02-core-product-experience*
*Completed: 2026-03-16*
