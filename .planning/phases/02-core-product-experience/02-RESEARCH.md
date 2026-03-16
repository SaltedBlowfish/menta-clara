# Phase 2: Core Product Experience - Research

**Researched:** 2026-03-16
**Domain:** Split-pane layout, date-based note management, mini calendar, CSS theming, keyboard navigation, accessibility
**Confidence:** HIGH

## Summary

Phase 2 transforms the single-editor foundation into the full Paneful Notes product: a split-pane layout with a daily note editor on the left and weekly note, permanent notes, and mini calendar stacked on the right. The technical challenges fall into five domains: (1) drag-to-resize split pane with accessible separator, (2) date-based note ID management with ISO week calculation, (3) a mini calendar component with note-existence indicators, (4) CSS custom property theming with system preference detection, and (5) keyboard navigation with focus management across panes.

The existing codebase provides a solid foundation. The `NoteEditor` component accepts `content` and `onUpdate` props and can be reused directly for all three editor instances (daily, weekly, permanent). The `useNote` hook already handles debounced saves and loads from IndexedDB with typed note IDs -- it just needs to be called with different ID patterns (`daily:YYYY-MM-DD`, `weekly:YYYY-Wnn`, `permanent:<slug>`). The `idb` library and database module already support the `notes` object store with keyPath `id`, so no schema migration is needed -- new note types simply use prefixed IDs.

No external UI libraries are needed. The split pane, calendar, collapsible sections, and theme toggle are all implementable with plain CSS and standard DOM events, keeping the bundle lean and matching the project's plain-CSS convention. The only new dependency consideration is `date-fns` for ISO week calculation and date manipulation, which is tree-shakeable and avoids hand-rolling date math.

**Primary recommendation:** Build all UI components with plain CSS and semantic HTML. Use `date-fns` for date/week calculations. Reuse `NoteEditor` and `useNote` for all editor panes. Implement theming via CSS custom properties toggled by `data-theme` attribute on `<html>`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- 60/40 default split ratio (daily note left, stacked sections right)
- Drag-to-resize divider between panes, minimum 250px per pane
- No visible header bar -- minimal floating controls (theme toggle top-right, date/title top-left)
- Right pane sections stacked: Weekly note, Permanent note, Mini calendar (all expanded by default)
- Each section independently collapsible with a toggle
- Note ID format: `daily:YYYY-MM-DD`, `weekly:YYYY-Wnn`, `permanent:<uuid>` or `permanent:<slug>`
- Auto-create today's note on app open with H1 date heading (e.g., `# March 15, 2026`)
- Default week start: Monday (user can switch to Sunday via setting)
- Permanent notes: dropdown selector to switch, option to create new
- Calendar: arrow buttons for month nav, today highlighted with circle/ring, selected day filled, 3-4px dots for days with notes
- Light/dark mode toggle: sun/moon icon, defaults to system preference, persists to IndexedDB, instant switch (no animation)
- Warm dark theme: `#1c1917` range backgrounds, `#e5e5e5` range text
- CSS custom properties for all theme-able values
- CMD+[ and CMD+] to switch focus between panes
- Tab navigation through collapsible sections in right pane
- All interactive elements have proper ARIA labels and roles
- WCAG 2.1 AA color contrast in both themes
- Focus management: focus never lost or trapped, visible focus indicators

### Claude's Discretion
- Exact CSS custom property names and organization
- Collapsible section animation (if any)
- Divider visual design (handle style, hover state)
- Calendar grid implementation approach
- Focus trap management details
- ARIA live region strategy for note navigation announcements
- Exact warm dark color values (within the warm-tinted dark direction)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAYO-01 | Split-pane layout: daily note left, right pane stacked with weekly/permanent/calendar | CSS Grid or flexbox split layout; reuse NoteEditor component for each pane |
| LAYO-02 | User can resize panes by dragging the divider | Mouse/pointer event handlers on separator div; persist ratio to IndexedDB |
| LAYO-03 | User can switch focus between panes with CMD+[/] | Global keydown listener; focus management between `<main>` and `<aside>` |
| LAYO-04 | Right pane sections individually collapsible | ARIA disclosure pattern: button with aria-expanded + aria-controls |
| DALY-01 | Auto-create today's note from template on app open | Generate `daily:YYYY-MM-DD` ID; check if exists in IndexedDB; create with H1 heading if not |
| DALY-02 | Navigate to any day's note via calendar | Calendar click handler calls navigation function that updates current daily note ID |
| DALY-03 | Each day has exactly one note, persists across sessions | Note ID `daily:YYYY-MM-DD` is unique per day; useNote hook handles persistence |
| WEEK-01 | Weekly note persists for entire week, visible in right pane | `weekly:YYYY-Wnn` ID; date-fns getISOWeek for week number calculation |
| WEEK-02 | User can configure Monday or Sunday week start | Setting stored in IndexedDB; affects week number calculation and calendar display |
| WEEK-03 | Weekly notes auto-create from template at week start | Same pattern as daily: check existence on load, create if missing |
| PERM-01 | Create multiple named permanent notes | `permanent:<slug>` ID; IndexedDB query for all permanent notes via cursor/getAll with prefix |
| PERM-02 | Switch between permanent notes via dropdown | Dropdown component lists all permanent notes; selection updates editor content |
| PERM-03 | Permanent notes persist indefinitely, not date-tied | Standard IndexedDB persistence; no date-based lifecycle |
| CALR-01 | Collapsible mini-month calendar in right pane | Hand-built calendar grid; 7-column CSS Grid; disclosure pattern for collapse |
| CALR-02 | Dots on days with notes | Query IndexedDB for daily note IDs in current month; show dot indicator |
| CALR-03 | Click day to navigate to that day's note | onClick handler generates daily note ID, triggers navigation |
| CALR-04 | Navigate between months | State for displayed month/year; prev/next buttons update it |
| APPR-01 | Toggle between light and dark mode | CSS custom properties; data-theme attribute on html; toggle button |
| APPR-02 | Default to system color scheme | prefers-color-scheme media query as fallback; IndexedDB override |
| APPR-03 | Clean, minimal typography (makingsoftware.com) | System font stack; spacing scale from UI-SPEC; minimal chrome |
| KEYS-01 | All actions accessible via keyboard shortcuts | Global keydown listeners for CMD shortcuts; standard tab navigation |
| KEYS-02 | CMD+[/] to switch focus between panes | Keydown handler on window; focus first focusable element in target pane |
| KEYS-03 | Standard formatting shortcuts | Already provided by TipTap StarterKit (CMD+B, CMD+I, etc.) |
| KEYS-04 | Keyboard shortcuts for search, workspaces, dates | Scaffolded in Phase 2 (event listeners registered), fully functional in Phase 3 |
| A11Y-01 | Proper ARIA labels and roles on all interactive elements | Labels per UI-SPEC copywriting contract; roles per ARIA patterns |
| A11Y-02 | Fully navigable with keyboard only | Tab order, focus indicators, keyboard shortcuts |
| A11Y-03 | Screen reader support | Semantic HTML landmarks; aria-live regions for navigation announcements |
| A11Y-04 | WCAG 2.1 AA color contrast | Verified in UI-SPEC: all pairs pass AA |
| A11Y-05 | Focus never lost or trapped | Focus management protocol per UI-SPEC focus behavior table |

</phase_requirements>

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.x | UI framework | Project constraint; already installed |
| @tiptap/react | 3.20.x | Rich text editor | Reuse NoteEditor for all three editor panes |
| @tiptap/starter-kit | 3.20.x | Editor extensions | Bold, italic, headings, lists, undo/redo |
| idb | 8.x | IndexedDB wrapper | Already used for note persistence; extend for settings/preferences |

### New Dependencies

| Library | Version | Purpose | Why Needed |
|---------|---------|---------|------------|
| date-fns | 4.x | Date manipulation and ISO week calculation | Tree-shakeable; getISOWeek, startOfWeek, format, eachDayOfInterval, startOfMonth, endOfMonth avoid hand-rolling date math |

### No External Dependencies Needed For

| Concern | Approach |
|---------|----------|
| Split pane resize | Pointer events + CSS custom property for width ratio |
| Mini calendar | Hand-built 7-column CSS Grid |
| Theme toggle | CSS custom properties + data-theme attribute |
| Collapsible sections | CSS + aria-expanded toggle |
| Keyboard shortcuts | Window keydown event listeners |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | Native Intl + manual week calc | date-fns is tree-shakeable (~3KB for needed functions); manual week math is error-prone with edge cases (year boundaries, ISO vs US weeks) |
| date-fns | Temporal API | Temporal is still Stage 3; not available in all browsers; date-fns is battle-tested |
| Hand-built split pane | react-split-pane / allotment | External deps add bundle size and lock in API; the split pane here is simple (one vertical divider) |
| Hand-built calendar | react-day-picker | External dep; our calendar is a minimal month grid, not a full date picker |

**Installation:**

```bash
pnpm add date-fns
```

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    app.tsx                  # Root: renders SplitPane layout
    app.css                  # Global reset + CSS custom properties (theme tokens)
    storage-warning.tsx      # Existing: reuse across panes
  layout/
    split-pane.tsx           # SplitPane: left/right with draggable divider
    split-pane.css           # Divider styles, pane containers
    use-pane-ratio.ts        # Hook: drag logic, persist ratio to IndexedDB
    pane-divider.tsx         # Focusable separator with ARIA role=separator
  daily/
    daily-pane.tsx           # Left pane: date display + NoteEditor
    daily-pane.css           # Daily pane layout styles
    use-daily-note.ts        # Hook: wraps useNote with daily:YYYY-MM-DD ID
    format-date-heading.ts   # Pure fn: Date -> "# March 15, 2026"
  weekly/
    weekly-section.tsx       # Collapsible section: weekly editor
    weekly-section.css       # Weekly section styles
    use-weekly-note.ts       # Hook: wraps useNote with weekly:YYYY-Wnn ID
    get-week-id.ts           # Pure fn: Date + weekStart -> "weekly:2026-W11"
  permanent/
    permanent-section.tsx    # Collapsible section: dropdown + editor
    permanent-section.css    # Permanent section styles
    use-permanent-notes.ts   # Hook: list/create/delete/select permanent notes
    note-dropdown.tsx        # Dropdown for switching permanent notes
  calendar/
    calendar-section.tsx     # Collapsible section: mini calendar
    calendar-section.css     # Calendar grid styles
    calendar-grid.tsx        # Month grid with day cells
    use-calendar.ts          # Hook: month navigation, days-with-notes query
    calendar-day.tsx         # Individual day cell (today ring, selected fill, dot)
  theme/
    theme-toggle.tsx         # Sun/moon icon button
    theme-toggle.css         # Toggle button styles
    use-theme.ts             # Hook: read/write theme preference, system default
    theme-tokens.css         # CSS custom properties for light/dark themes
  shared/
    collapsible-section.tsx  # Reusable collapsible wrapper with disclosure pattern
    collapsible-section.css  # Collapse/expand styles
    use-keyboard-shortcuts.ts # Global CMD+[/] and other shortcuts
    use-persisted-state.ts   # Generic hook: persist any value to IndexedDB
    live-region.tsx          # aria-live="polite" announcements
  types/
    note.ts                  # Existing Note interface (unchanged)
  storage/
    database.ts              # Existing IndexedDB setup (unchanged)
    use-note.ts              # Existing useNote hook (reused with different IDs)
    request-persistence.ts   # Existing
  editor/
    editor.tsx               # Existing NoteEditor (reused in all panes)
    extensions.ts            # Existing TipTap extensions
    use-editor-config.ts     # Existing editor config hook
```

### Pattern 1: Reuse NoteEditor With Typed IDs

**What:** The existing `NoteEditor` + `useNote` pattern already supports arbitrary string IDs. Phase 2 uses ID prefixes (`daily:`, `weekly:`, `permanent:`) for type discrimination without changing the storage schema.
**When to use:** All three editor panes.
**Example:**

```typescript
// use-daily-note.ts
import { format } from 'date-fns';
import { useNote } from '../storage/use-note';

export function useDailyNote(date: Date) {
  const noteId = `daily:${format(date, 'yyyy-MM-dd')}`;
  return useNote(noteId);
}
```

### Pattern 2: CSS Custom Property Theming

**What:** Declare all color values as CSS custom properties on `:root`. Toggle themes by setting `data-theme="light"` or `data-theme="dark"` on `<html>`. Use `prefers-color-scheme` media query as the default when no explicit preference is stored.
**When to use:** APPR-01, APPR-02.
**Example:**

```css
/* theme-tokens.css */
:root,
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-accent: #1a1a1a;
  --color-focus: #2563eb;
}

[data-theme="dark"] {
  --color-bg: #1c1917;
  --color-bg-secondary: #292524;
  --color-text: #e5e5e5;
  --color-text-secondary: #a8a29e;
  --color-border: #44403c;
  --color-accent: #e5e5e5;
  --color-focus: #60a5fa;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #1c1917;
    --color-bg-secondary: #292524;
    --color-text: #e5e5e5;
    --color-text-secondary: #a8a29e;
    --color-border: #44403c;
    --color-accent: #e5e5e5;
    --color-focus: #60a5fa;
  }
}
```

### Pattern 3: Pointer-Event Split Pane Resize

**What:** Use `pointerdown` on the divider, then `pointermove`/`pointerup` on the document to calculate new split ratio. Store ratio as a CSS custom property (`--pane-ratio`) on the container. Persist to IndexedDB on release.
**When to use:** LAYO-02.
**Example:**

```typescript
// use-pane-ratio.ts (concept)
// 1. On pointerdown on divider: setPointerCapture, set dragging=true
// 2. On pointermove: calculate ratio from clientX / container width
// 3. Clamp to min 250px per pane
// 4. Update CSS custom property --pane-ratio
// 5. On pointerup: releasePointerCapture, persist ratio to IndexedDB
```

### Pattern 4: Accessible Disclosure (Collapsible Sections)

**What:** Each right-pane section uses the W3C Disclosure pattern: a `<button>` with `aria-expanded` and `aria-controls` toggles visibility of a content region.
**When to use:** LAYO-04, A11Y-01.
**Example:**

```tsx
// collapsible-section.tsx (concept)
<section>
  <h3>
    <button
      aria-controls={contentId}
      aria-expanded={expanded}
      onClick={toggle}
      type="button"
    >
      <ChevronIcon rotated={expanded} />
      {title}
    </button>
  </h3>
  <div id={contentId} hidden={!expanded}>
    {children}
  </div>
</section>
```

### Pattern 5: Accessible Window Splitter

**What:** The divider uses `role="separator"` with `tabindex="0"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and `aria-orientation="vertical"`. Keyboard users can move the divider with Left/Right arrow keys. Enter toggles collapse.
**When to use:** LAYO-02, A11Y-01, A11Y-02.
**Source:** [W3C Window Splitter Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)

### Pattern 6: ARIA Live Region for Navigation Announcements

**What:** A visually-hidden `aria-live="polite"` element at the root level. When the user navigates to a different day or creates/deletes a note, update its text content to announce the change.
**When to use:** A11Y-03.
**Example:**

```tsx
// live-region.tsx
<div aria-live="polite" className="sr-only" role="status">
  {announcement}
</div>
```

### Anti-Patterns to Avoid

- **Creating multiple TipTap editor instances per pane:** Reuse the same `NoteEditor` component; only the `noteId` prop changes. Do NOT create separate editor components for daily/weekly/permanent.
- **Storing theme in React state only:** Theme must be applied to `<html>` attribute for CSS to work. The React state should sync with the DOM attribute, not replace it.
- **Using mousedown/mousemove for resize:** Use pointer events (`pointerdown`/`pointermove`/`pointerup`) instead -- they unify mouse and touch, and `setPointerCapture` prevents events from being lost when the cursor leaves the divider.
- **Querying all notes to find days-with-notes:** Use an IndexedDB cursor with a key range on the `daily:` prefix to efficiently find which days have notes for the current month, rather than loading all notes.
- **Hand-rolling week number calculation:** ISO week numbers have edge cases at year boundaries (e.g., Dec 31 can be week 1 of the next year). Use `date-fns/getISOWeek`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ISO week number | Custom week calculation | `date-fns/getISOWeek` | Year boundary edge cases (Dec 29-31 can be W01 of next year; Jan 1-3 can be W52/53 of previous year) |
| Start of week | Custom day-of-week math | `date-fns/startOfWeek` with `weekStartsOn` option | Configurable Monday/Sunday start without branching logic |
| Date formatting | Custom string concatenation | `date-fns/format` | Locale-aware, handles edge cases, consistent output |
| Calendar day grid | Manual loop with modulo | `date-fns/eachDayOfInterval` + `date-fns/startOfMonth` + `date-fns/endOfMonth` | Correct handling of month boundaries and leading/trailing days |
| Rich text editing | Custom contentEditable | TipTap NoteEditor (existing) | Already built and tested |
| Debounced IndexedDB save | New debounce logic | `useNote` hook (existing) | Already handles debounce, blur flush, visibility flush |

**Key insight:** The most valuable code reuse in Phase 2 is the existing `NoteEditor` + `useNote` pair. These two components handle 90% of the editor + storage concerns. Phase 2's job is building the layout shell around them and the navigation logic to select which note ID each editor loads.

## Common Pitfalls

### Pitfall 1: TipTap Editor Content Not Updating When Note ID Changes

**What goes wrong:** Switching between daily notes (clicking a different day) does not update the editor content because TipTap caches the initial content.
**Why it happens:** The `useEditor` hook in TipTap does not automatically re-render when the `content` prop changes after initial mount.
**How to avoid:** The existing `useEditorConfig` passes `[content]` as the dependency array to `useEditor`, which causes it to recreate the editor when content changes. Ensure the `content` value from `useNote` changes its reference when the note ID changes (it does, because `useState` in `useNote` resets on `noteId` change via the `useEffect` dependency).
**Warning signs:** Editor shows stale content after calendar navigation.

### Pitfall 2: Pointer Events Lost During Fast Drag

**What goes wrong:** Dragging the split pane divider quickly causes the pointer to leave the divider element, and resize stops working.
**Why it happens:** Without pointer capture, `pointermove` events stop firing when the cursor leaves the element.
**How to avoid:** Call `element.setPointerCapture(event.pointerId)` on `pointerdown`. This ensures all subsequent pointer events are routed to the divider element until `pointerup`.
**Warning signs:** Resize feels "sticky" or stops mid-drag.

### Pitfall 3: CSS Custom Properties Not Applying to Existing Editor Styles

**What goes wrong:** The Phase 1 editor styles use hardcoded color values (#ffffff, #1a1a1a, etc.) that don't respond to theme changes.
**Why it happens:** Phase 1 CSS was written before theming existed.
**How to avoid:** Refactor all hardcoded colors in `app.css` to use CSS custom properties. This is a required migration step early in Phase 2.
**Warning signs:** Editor area stays light when dark mode is activated.

### Pitfall 4: IndexedDB Key Range for Prefix Queries

**What goes wrong:** Trying to find all daily notes for a month (to show dots on the calendar) by loading all notes and filtering in JS.
**Why it happens:** IndexedDB doesn't have a `LIKE` operator or prefix search built into the basic API.
**How to avoid:** Use `IDBKeyRange.bound('daily:2026-03-01', 'daily:2026-03-31')` to efficiently query only the daily notes for a specific month. The lexicographic ordering of `YYYY-MM-DD` makes this work correctly.
**Warning signs:** Calendar rendering is slow as note count grows.

### Pitfall 5: Focus Lost After Section Collapse

**What goes wrong:** Collapsing a section that contains the currently focused element causes focus to move to `<body>`, which breaks keyboard navigation.
**Why it happens:** When an element is hidden (via `hidden` attribute or `display: none`), the browser removes it from the tab order and focus falls to `<body>`.
**How to avoid:** After collapsing, explicitly move focus to the section header button. The UI-SPEC confirms this: "Collapse section -- Focus remains on section header."
**Warning signs:** After collapsing a section, pressing Tab navigates to unexpected elements.

### Pitfall 6: Week Number Mismatch Between Calendar and Weekly Note

**What goes wrong:** The calendar shows one week number but the weekly note shows a different one, especially at year boundaries.
**Why it happens:** Mixing ISO week calculation with US week calculation, or using different `weekStartsOn` settings in different places.
**How to avoid:** Use a single source of truth for the week start day setting. Pass it consistently to all date-fns functions. The `getISOWeek` function always uses Monday start (ISO standard); use `getWeek` with explicit `weekStartsOn` option for Sunday-start weeks.
**Warning signs:** Week 53 appearing when user expects Week 1, or vice versa.

### Pitfall 7: 100-Line File Limit With Complex Components

**What goes wrong:** Split pane or calendar components exceed 100 lines.
**Why it happens:** DEVX-03 requires max 100 lines per file (excluding blanks and comments). Layout components with event handlers tend to be verbose.
**How to avoid:** Extract hooks (`usePaneRatio`, `useCalendar`), pure utility functions (`getWeekId`, `formatDateHeading`), and sub-components (`CalendarDay`, `PaneDivider`) into separate files. The file structure above is designed with this constraint in mind.
**Warning signs:** Files approaching 80 lines during development.

## Code Examples

### ISO Week ID Generation

```typescript
// get-week-id.ts
import { getISOWeek, getISOWeekYear } from 'date-fns';

export function getWeekId(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `weekly:${String(year)}-W${String(week).padStart(2, '0')}`;
}
```

### Daily Note ID and Auto-Creation

```typescript
// use-daily-note.ts (concept)
import { format } from 'date-fns';
import { useNote } from '../storage/use-note';

export function useDailyNote(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const noteId = `daily:${dateStr}`;
  const result = useNote(noteId);

  // Auto-create heading if new note
  // "# March 15, 2026"
  // Note: actual implementation creates default content
  // when useNote returns null content

  return { ...result, dateStr, noteId };
}
```

### Calendar Days-With-Notes Query

```typescript
// Efficient IndexedDB prefix query for calendar dots
import { getDatabase, NOTES_STORE } from '../storage/database';

export async function getDaysWithNotes(
  year: number,
  month: number,
): Promise<ReadonlyArray<string>> {
  const db = await getDatabase();
  const monthStr = `${String(year)}-${String(month).padStart(2, '0')}`;
  const range = IDBKeyRange.bound(
    `daily:${monthStr}-01`,
    `daily:${monthStr}-31`,
  );
  const keys = await db.getAllKeys(NOTES_STORE, range);
  return keys.map((key) => String(key).replace('daily:', ''));
}
```

### Theme Initialization (No Flash of Wrong Theme)

```typescript
// use-theme.ts (concept)
// 1. Read theme preference from IndexedDB (async)
// 2. While loading, respect prefers-color-scheme via CSS (no JS needed)
// 3. Once loaded, set data-theme attribute on <html>
// 4. On toggle: update <html> attribute + persist to IndexedDB
//
// Critical: the CSS handles the default case via @media query
// so there is no flash of wrong theme on initial load
```

### Accessible Separator for Split Pane

```html
<!-- Per W3C Window Splitter Pattern -->
<div
  aria-controls="daily-pane"
  aria-label="Resize panes"
  aria-orientation="vertical"
  aria-valuemax="100"
  aria-valuemin="0"
  aria-valuenow="60"
  class="pane-divider"
  role="separator"
  tabindex="0"
>
</div>
```

### Global Keyboard Shortcut Registration

```typescript
// use-keyboard-shortcuts.ts (concept)
// Register on window keydown:
// - CMD+[ -> focus left pane (daily editor)
// - CMD+] -> focus right pane (first expanded section)
// - Prevent default to avoid browser back/forward navigation
//
// Important: Check event.metaKey (Mac) not event.ctrlKey
// CMD+[ is bracketleft, CMD+] is bracketright
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| mousedown/mousemove for drag | Pointer Events API | Widely supported since 2020 | Unified mouse + touch; setPointerCapture prevents lost events |
| prefers-color-scheme only | data-theme attribute + prefers-color-scheme fallback | Standard practice 2022+ | Allows user override while respecting system default |
| moment.js for dates | date-fns v4 (tree-shakeable) | date-fns v4 stable 2024 | Import only needed functions; ~3KB for week/month utilities |
| Custom ARIA patterns | W3C APG patterns | Living standard | Disclosure, Window Splitter are well-documented patterns |

**Deprecated/outdated:**

- `moment.js`: Large bundle, mutable API; use date-fns instead
- `mousedown`/`mousemove` for drag: Use Pointer Events for cross-device support
- Manual `color-scheme` meta tag: `prefers-color-scheme` CSS media query is sufficient

## Open Questions

1. **Week Start Day Setting Storage Location**
   - What we know: User can switch between Monday and Sunday. Must persist to IndexedDB.
   - What's unclear: Where to store this setting -- in the existing `notes` object store with a special key (e.g., `setting:weekStartDay`) or in a separate `settings` store.
   - Recommendation: Use the existing `notes` store with a `setting:` prefix key. Avoids schema migration. A separate settings store can be added in Phase 3 if needed for workspaces.

2. **Permanent Note Slug Generation**
   - What we know: CONTEXT.md says `permanent:<uuid>` or `permanent:<slug>`. Slugs are more human-readable.
   - What's unclear: How to handle duplicate names, special characters.
   - Recommendation: Use `permanent:<uuid>` for the internal ID (guaranteed unique), store the display name as a field on the note. Avoids slug collision issues entirely.

3. **Calendar Performance at Scale**
   - What we know: `IDBKeyRange.bound` efficiently queries a month's notes.
   - What's unclear: Performance with thousands of daily notes accumulated over years.
   - Recommendation: The key range query only touches the index, not the note content. Should remain fast. Monitor but don't optimize prematurely.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | vite.config.ts (test section) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test && pnpm lint && pnpm typecheck` |

### Phase Requirements - Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYO-01 | Split pane renders left/right | unit | `pnpm vitest run src/layout/` | Wave 0 |
| LAYO-02 | Divider drag resizes panes | unit | `pnpm vitest run src/layout/` | Wave 0 |
| LAYO-03 | CMD+[/] switches pane focus | unit | `pnpm vitest run src/shared/` | Wave 0 |
| LAYO-04 | Sections collapse/expand | unit | `pnpm vitest run src/shared/` | Wave 0 |
| DALY-01 | Today's note auto-created | unit | `pnpm vitest run src/daily/` | Wave 0 |
| DALY-02 | Calendar click navigates to day | integration | `pnpm vitest run src/calendar/` | Wave 0 |
| DALY-03 | Daily note persists | unit | Covered by existing useNote tests | Exists |
| WEEK-01 | Weekly note loads for current week | unit | `pnpm vitest run src/weekly/` | Wave 0 |
| WEEK-02 | Week start configurable | unit | `pnpm vitest run src/weekly/` | Wave 0 |
| WEEK-03 | Weekly note auto-created | unit | `pnpm vitest run src/weekly/` | Wave 0 |
| PERM-01 | Create named permanent notes | unit | `pnpm vitest run src/permanent/` | Wave 0 |
| PERM-02 | Dropdown switches notes | unit | `pnpm vitest run src/permanent/` | Wave 0 |
| PERM-03 | Permanent notes persist | unit | Covered by existing useNote tests | Exists |
| CALR-01 | Calendar renders month grid | unit | `pnpm vitest run src/calendar/` | Wave 0 |
| CALR-02 | Dots on days with notes | unit | `pnpm vitest run src/calendar/` | Wave 0 |
| CALR-03 | Day click triggers navigation | unit | `pnpm vitest run src/calendar/` | Wave 0 |
| CALR-04 | Month navigation works | unit | `pnpm vitest run src/calendar/` | Wave 0 |
| APPR-01 | Theme toggles light/dark | unit | `pnpm vitest run src/theme/` | Wave 0 |
| APPR-02 | Defaults to system preference | unit | `pnpm vitest run src/theme/` | Wave 0 |
| APPR-03 | Typography matches spec | manual-only | Visual inspection | N/A |
| KEYS-01 | Keyboard shortcuts work | unit | `pnpm vitest run src/shared/` | Wave 0 |
| KEYS-02 | CMD+[/] tested | unit | `pnpm vitest run src/shared/` | Wave 0 |
| KEYS-03 | Formatting shortcuts | manual-only | TipTap built-in; verified in Phase 1 | N/A |
| KEYS-04 | Search/workspace shortcuts scaffolded | unit | `pnpm vitest run src/shared/` | Wave 0 |
| A11Y-01 | ARIA labels present | unit | `pnpm vitest run --grep "aria"` | Wave 0 |
| A11Y-02 | Keyboard navigable | integration | `pnpm vitest run --grep "keyboard"` | Wave 0 |
| A11Y-03 | Screen reader announcements | unit | `pnpm vitest run src/shared/` | Wave 0 |
| A11Y-04 | Color contrast AA | manual-only | Visual inspection + contrast checker | N/A |
| A11Y-05 | Focus not lost/trapped | integration | `pnpm vitest run --grep "focus"` | Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test && pnpm lint && pnpm typecheck`
- **Phase gate:** Full suite green + `pnpm build` succeeds

### Wave 0 Gaps

- [ ] `src/layout/__tests__/split-pane.test.tsx` -- covers LAYO-01, LAYO-02
- [ ] `src/daily/__tests__/use-daily-note.test.ts` -- covers DALY-01, DALY-03
- [ ] `src/weekly/__tests__/get-week-id.test.ts` -- covers WEEK-01, WEEK-02
- [ ] `src/permanent/__tests__/use-permanent-notes.test.ts` -- covers PERM-01, PERM-02
- [ ] `src/calendar/__tests__/calendar-grid.test.tsx` -- covers CALR-01 through CALR-04
- [ ] `src/theme/__tests__/use-theme.test.ts` -- covers APPR-01, APPR-02
- [ ] `src/shared/__tests__/use-keyboard-shortcuts.test.ts` -- covers KEYS-01, KEYS-02
- [ ] `src/shared/__tests__/collapsible-section.test.tsx` -- covers LAYO-04, A11Y-01

## Sources

### Primary (HIGH confidence)

- [W3C WAI - Window Splitter Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) - ARIA roles, keyboard interaction, required attributes for resizable separator
- [MDN - ARIA separator role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role) - Focusable vs non-focusable separator, required attributes
- [W3C WAI - Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) - aria-expanded, aria-controls for collapsible sections
- [date-fns official](https://date-fns.org/) - getISOWeek, startOfWeek, format API
- Phase 1 codebase (src/) - Existing NoteEditor, useNote, database.ts patterns
- Phase 2 UI-SPEC (.planning/phases/02-core-product-experience/02-UI-SPEC.md) - Complete visual and interaction contract

### Secondary (MEDIUM confidence)

- [whitep4nth3r - Theme Toggle in JavaScript](https://whitep4nth3r.com/blog/best-light-dark-mode-theme-toggle-javascript/) - data-theme + prefers-color-scheme combined approach
- [weeknumber.com - JavaScript ISO weeks](https://weeknumber.com/how-to/javascript) - ISO week calculation algorithm
- [w3resource - ISO week exercises](https://www.w3resource.com/javascript-exercises/javascript-date-exercise-24.php) - Week number edge cases at year boundaries

### Tertiary (LOW confidence)

- None -- all findings verified with primary sources

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Reuses existing Phase 1 stack; only new dependency is well-established date-fns
- Architecture: HIGH - Follows established project patterns (hooks, plain CSS, named exports, 100-line limit)
- Pitfalls: HIGH - Based on direct code analysis of existing codebase and W3C specifications
- Date/week handling: MEDIUM - date-fns API is well-documented but ISO week edge cases at year boundaries need testing

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable ecosystem, 30-day window)
