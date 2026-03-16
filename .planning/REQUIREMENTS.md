# Requirements: Paneful Notes

**Defined:** 2026-03-15
**Core Value:** Users can open a tab and immediately start writing today's note alongside their running weekly and permanent notes — with zero friction, zero accounts, and zero data leaving their browser.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Editor

- [ ] **EDIT-01**: User can write and edit notes with WYSIWYG markdown rendering (bold, italic, headings, lists, code blocks, links render inline as typed)
- [ ] **EDIT-02**: User can undo and redo edits within a session
- [ ] **EDIT-03**: User can paste images from clipboard; images display inline and are stored as blobs in browser DB
- [ ] **EDIT-04**: User can type `[[YYYY-MM-DD]]` and it renders as a clickable link that navigates to that day's note
- [ ] **EDIT-05**: Notes auto-save to browser storage on every change (debounced) with no explicit save action needed

### Layout

- [ ] **LAYO-01**: App displays a split-pane layout: daily note on the left, right pane stacked with weekly note, permanent note, and mini calendar
- [ ] **LAYO-02**: User can resize panes by dragging the divider
- [ ] **LAYO-03**: User can switch focus between panes using keyboard shortcuts (CMD+[ and CMD+])
- [ ] **LAYO-04**: Right pane sections (weekly, permanent, calendar) are individually collapsible

### Daily Notes

- [ ] **DALY-01**: App auto-creates today's note from the configured template when the user opens the app
- [ ] **DALY-02**: User can navigate to any past or future day's note via the calendar
- [ ] **DALY-03**: Each day has exactly one note that persists across sessions

### Weekly Notes

- [ ] **WEEK-01**: A weekly note persists for an entire week cycle and is visible in the right pane
- [ ] **WEEK-02**: User can configure whether weeks start on Monday or Sunday
- [ ] **WEEK-03**: Weekly notes auto-create from the configured weekly template at the start of each week cycle

### Permanent Notes

- [ ] **PERM-01**: User can create multiple named permanent notes within a workspace
- [ ] **PERM-02**: User can switch between permanent notes via a dropdown or tab in the right pane
- [ ] **PERM-03**: Permanent notes persist indefinitely and are not tied to any date

### Calendar

- [ ] **CALR-01**: A collapsible mini-month calendar is visible in the right pane
- [ ] **CALR-02**: Calendar shows dots on days that have notes
- [ ] **CALR-03**: User can click a day on the calendar to navigate to that day's note
- [ ] **CALR-04**: User can navigate between months in the calendar

### Templates

- [ ] **TMPL-01**: User can save the current note content as a named template
- [ ] **TMPL-02**: User can load a template into the current note
- [ ] **TMPL-03**: User can set a default daily template for weekdays
- [ ] **TMPL-04**: User can set a default daily template for weekends
- [ ] **TMPL-05**: User can set a default weekly template

### Workspaces

- [ ] **WKSP-01**: User can create named workspaces from a menu at the top left
- [ ] **WKSP-02**: User can switch between workspaces; content never crosses workspace boundaries
- [ ] **WKSP-03**: Each workspace has its own daily notes, weekly notes, permanent notes, templates, and settings

### Search

- [ ] **SRCH-01**: User can search across all notes in the current workspace
- [ ] **SRCH-02**: Search results show matching notes with highlighted snippets
- [ ] **SRCH-03**: User can click a search result to navigate to that note

### Data

- [x] **DATA-01**: All data is stored locally in the browser using IndexedDB — no server calls
- [ ] **DATA-02**: User can export all workspace data as a folder of markdown files (downloadable zip)
- [ ] **DATA-03**: User can import markdown files to populate notes
- [x] **DATA-04**: App requests persistent storage to prevent browser eviction (Safari ITP mitigation)

### Appearance

- [ ] **APPR-01**: User can toggle between light and dark mode
- [ ] **APPR-02**: App defaults to the user's system color scheme preference
- [ ] **APPR-03**: UI uses clean, minimal typography inspired by makingsoftware.com

### Keyboard

- [ ] **KEYS-01**: All actions are accessible via keyboard shortcuts
- [ ] **KEYS-02**: User can switch focus between panes with CMD+[ and CMD+]
- [ ] **KEYS-03**: Standard formatting shortcuts work (CMD+B bold, CMD+I italic, etc.)
- [ ] **KEYS-04**: User can open search, switch workspaces, and navigate dates via keyboard

### Accessibility

- [ ] **A11Y-01**: All interactive elements have proper ARIA labels and roles
- [ ] **A11Y-02**: App is fully navigable with keyboard only (no mouse required)
- [ ] **A11Y-03**: App works with screen readers (VoiceOver, NVDA)
- [ ] **A11Y-04**: Color contrast meets WCAG 2.1 AA standards
- [ ] **A11Y-05**: Focus management is correct — focus is never lost or trapped unexpectedly

### Developer

- [x] **DEVX-01**: Project uses React + TypeScript + ESLint + Prettier
- [x] **DEVX-02**: Strictest ESLint rules: no `any`, no `unknown`, no `as` casting, alphabetized imports/props/object keys
- [x] **DEVX-03**: Max 100 lines per file (excluding blank lines and comments), no multi-component exports, no default exports
- [x] **DEVX-04**: App builds to static files deployable on GitHub Pages

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancement

- **ENHC-01**: PWA installability with service worker for app-like experience
- **ENHC-02**: Drag-to-resize right pane sections independently
- **ENHC-03**: Custom keyboard shortcut configuration
- **ENHC-04**: Print/PDF export of individual notes

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                   | Reason                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Cloud sync                | Requires server, accounts, conflict resolution — contradicts zero-server constraint            |
| Wiki-style [[page links]] | Turns daily notes into knowledge graph; date references cover the need                         |
| Plugin/extension system   | Plugin APIs are a product unto themselves; keep feature set small and excellent                |
| AI features               | Requires API keys or large models; breaks local-first/no-network promise                       |
| Real-time collaboration   | Requires server infrastructure; this is a personal tool                                        |
| User accounts/auth        | No backend — local-only by design                                                              |
| Mobile native app         | Split-pane layout is desktop-focused; web works on mobile for basic viewing                    |
| Nested folders            | Date-based + workspace separation + search covers organization needs                           |
| Version history           | Undo/redo within session covers accidental edits; daily notes are inherently versioned by date |
| Encryption at rest        | OS-level disk encryption is the right layer for local browser data                             |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase   | Status  |
| ----------- | ------- | ------- |
| DEVX-01     | Phase 1 | Complete |
| DEVX-02     | Phase 1 | Complete |
| DEVX-03     | Phase 1 | Complete |
| DEVX-04     | Phase 1 | Complete |
| DATA-01     | Phase 1 | Complete |
| DATA-04     | Phase 1 | Complete |
| EDIT-01     | Phase 1 | Pending |
| EDIT-02     | Phase 1 | Pending |
| EDIT-05     | Phase 1 | Pending |
| LAYO-01     | Phase 2 | Pending |
| LAYO-02     | Phase 2 | Pending |
| LAYO-03     | Phase 2 | Pending |
| LAYO-04     | Phase 2 | Pending |
| DALY-01     | Phase 2 | Pending |
| DALY-02     | Phase 2 | Pending |
| DALY-03     | Phase 2 | Pending |
| WEEK-01     | Phase 2 | Pending |
| WEEK-02     | Phase 2 | Pending |
| WEEK-03     | Phase 2 | Pending |
| PERM-01     | Phase 2 | Pending |
| PERM-02     | Phase 2 | Pending |
| PERM-03     | Phase 2 | Pending |
| CALR-01     | Phase 2 | Pending |
| CALR-02     | Phase 2 | Pending |
| CALR-03     | Phase 2 | Pending |
| CALR-04     | Phase 2 | Pending |
| APPR-01     | Phase 2 | Pending |
| APPR-02     | Phase 2 | Pending |
| APPR-03     | Phase 2 | Pending |
| KEYS-01     | Phase 2 | Pending |
| KEYS-02     | Phase 2 | Pending |
| KEYS-03     | Phase 2 | Pending |
| KEYS-04     | Phase 2 | Pending |
| A11Y-01     | Phase 2 | Pending |
| A11Y-02     | Phase 2 | Pending |
| A11Y-03     | Phase 2 | Pending |
| A11Y-04     | Phase 2 | Pending |
| A11Y-05     | Phase 2 | Pending |
| TMPL-01     | Phase 3 | Pending |
| TMPL-02     | Phase 3 | Pending |
| TMPL-03     | Phase 3 | Pending |
| TMPL-04     | Phase 3 | Pending |
| TMPL-05     | Phase 3 | Pending |
| WKSP-01     | Phase 3 | Pending |
| WKSP-02     | Phase 3 | Pending |
| WKSP-03     | Phase 3 | Pending |
| SRCH-01     | Phase 3 | Pending |
| SRCH-02     | Phase 3 | Pending |
| SRCH-03     | Phase 3 | Pending |
| DATA-02     | Phase 3 | Pending |
| DATA-03     | Phase 3 | Pending |
| EDIT-03     | Phase 3 | Pending |
| EDIT-04     | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0

---

_Requirements defined: 2026-03-15_
_Last updated: 2026-03-15 after roadmap creation_
