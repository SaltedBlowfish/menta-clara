# Phase 2: Core Product Experience - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

The full split-pane daily/weekly/permanent notes experience with mini calendar, light/dark theming, keyboard navigation, and accessibility. This phase transforms the single-editor foundation into the complete Paneful Notes product layout. No templates, no workspaces, no search, no image paste, no date references — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Split-Pane Layout
- 60/40 default split ratio (daily note left, stacked sections right)
- Drag-to-resize divider between panes
- Minimum 250px per pane to prevent unusable sizes
- No visible header bar — minimal floating controls (theme toggle top-right, date/title top-left of daily pane)
- Right pane sections stacked top-to-bottom: Weekly note → Permanent note → Mini calendar
- All three right-pane sections expanded by default
- Each section independently collapsible with a toggle

### Daily Notes
- Note ID format: `daily:YYYY-MM-DD` (prefixed for type discrimination in IndexedDB)
- Auto-create today's note on app open with an H1 date heading (e.g., `# March 15, 2026`)
- Each day has exactly one note that persists across sessions
- Clicking any day on the calendar always creates the note if it doesn't exist and navigates to it

### Weekly Notes
- Note ID format: `weekly:YYYY-Wnn` (ISO week number)
- Default week start day: Monday (user can switch to Sunday via a setting)
- Weekly notes auto-create at the start of each week cycle
- Weekly note persists for the full week and is always visible in the right pane

### Permanent Notes
- Note ID format: `permanent:<uuid>` or `permanent:<slug>`
- Users create multiple named permanent notes within a workspace
- Dropdown selector at the top of the permanent note section to switch between notes
- Dropdown includes option to create new permanent note
- Permanent notes persist indefinitely, not tied to any date

### Mini Calendar
- Collapsible mini-month calendar at the bottom of the right pane
- Arrow buttons flanking month name for month navigation (◀ March 2026 ▶)
- Today's date highlighted with a circle/ring
- Selected day (the day being viewed in the daily note pane) gets a filled background
- Small dot (3-4px) below date numbers that have notes
- Clicking a day navigates to that day's daily note (auto-creates if needed)

### Theming & Appearance
- Light/dark mode toggle — small sun/moon icon button in top-right corner
- Default to system color scheme preference (`prefers-color-scheme` media query)
- Persist user's explicit theme choice to IndexedDB
- Warm dark theme: slightly warm-tinted dark backgrounds (#1c1917 range), light text (#e5e5e5 range)
- Light theme: current app.css colors (white background, #1a1a1a text)
- No transition animation on theme switch — instant
- CSS custom properties for all theme-able values
- Clean, minimal typography per makingsoftware.com design philosophy (APPR-03)

### Keyboard Navigation
- CMD+[ and CMD+] to switch focus between left and right panes
- Standard formatting shortcuts (CMD+B bold, CMD+I italic, etc.) — already provided by TipTap StarterKit
- Tab navigation through collapsible sections in right pane
- All actions accessible via keyboard shortcuts (KEYS-01)
- Keyboard shortcut for opening search, switching workspaces, navigating dates (KEYS-04) — scaffolded in Phase 2, fully functional in Phase 3

### Accessibility
- All interactive elements have proper ARIA labels and roles
- Fully navigable with keyboard only
- Screen reader support (VoiceOver, NVDA) — semantic HTML, live regions for dynamic content
- WCAG 2.1 AA color contrast in both light and dark themes
- Focus management — focus never lost or trapped, visible focus indicators

### Claude's Discretion
- Exact CSS custom property names and organization
- Collapsible section animation (if any)
- Divider visual design (handle style, hover state)
- Calendar grid implementation approach
- Focus trap management details
- ARIA live region strategy for note navigation announcements
- Exact warm dark color values (within the warm-tinted dark direction)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Foundation
- `.planning/phases/01-foundation-and-editor/01-CONTEXT.md` — Phase 1 decisions: folder structure, CSS approach, storage patterns, TipTap config
- `.planning/phases/01-foundation-and-editor/01-RESEARCH.md` — TipTap extension analysis, IndexedDB patterns, Safari ITP findings

### Project Constraints
- `.planning/PROJECT.md` — Tech stack constraints (React + TS + ESLint + Prettier), file size limits (100 lines), no default exports, alphabetized imports, makingsoftware.com design philosophy
- `.planning/REQUIREMENTS.md` — Phase 2 requirement IDs: LAYO-01 through LAYO-04, DALY-01 through DALY-03, WEEK-01 through WEEK-03, PERM-01 through PERM-03, CALR-01 through CALR-04, APPR-01 through APPR-03, KEYS-01 through KEYS-04, A11Y-01 through A11Y-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/editor/editor.tsx` — NoteEditor component accepts `content` and `onUpdate` props; reuse in all pane editors
- `src/editor/use-editor-config.ts` — TipTap editor hook; reuse for weekly and permanent note editors
- `src/storage/use-note.ts` — useNote hook with debounced save, blur/visibility flush; extend for typed note IDs
- `src/storage/database.ts` — IndexedDB via `idb`, single 'notes' store with keyPath 'id'; extend schema for new note types
- `src/app/storage-warning.tsx` — Storage error warning component; reuse across panes

### Established Patterns
- Plain CSS with class names (no CSS modules, no Tailwind) — continue this for all Phase 2 components
- Hook-only data access pattern (useNote wraps IndexedDB) — create useDaily, useWeekly, usePermanent hooks
- Flat feature folder structure (`src/app/`, `src/editor/`, `src/storage/`, `src/types/`)
- Note type: `{ id: string, content: JSONContent, updatedAt: number }` — extend with `type` field or use prefix-based discrimination

### Integration Points
- `src/app/app.tsx` — Currently renders single centered editor; Phase 2 replaces this with split-pane layout
- `src/app/app.css` — Currently has `.editor-container` with `max-width: 720px`; Phase 2 replaces with full-width split layout
- `src/types/note.ts` — Note interface needs extension for daily/weekly/permanent differentiation

</code_context>

<specifics>
## Specific Ideas

- Design philosophy follows makingsoftware.com — radical simplicity, clean, minimal, content-focused
- Warm dark theme (not neutral gray, not pure black) — cozy, less clinical feel
- No visible header/toolbar — floating controls only, maximizing content space
- Calendar follows common mini-calendar conventions (dots for notes, circle for today, filled for selected)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-product-experience*
*Context gathered: 2026-03-15*
