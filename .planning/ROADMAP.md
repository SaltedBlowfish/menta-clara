# Roadmap: Paneful Notes

## Overview

Paneful Notes ships in three phases: a foundation phase that proves the storage layer and editor work correctly, a core phase that builds the entire split-pane daily/weekly/permanent notes experience with calendar and full keyboard-driven navigation, and a power features phase that adds templates, workspaces, search, image paste, date references, and data portability. The storage-first approach respects the dependency chain -- every feature reads from or writes to IndexedDB -- and the editor-first approach de-risks the highest-uncertainty component (Tiptap markdown round-tripping) before building panes around it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Editor** - Project scaffolding, storage layer, and WYSIWYG markdown editor with auto-save
- [ ] **Phase 2: Core Product Experience** - Split-pane layout, daily/weekly/permanent notes, calendar, appearance, keyboard navigation, and accessibility
- [ ] **Phase 3: Power Features** - Templates, workspaces, search, image paste, date references, and data export/import

## Phase Details

### Phase 1: Foundation and Editor
**Goal**: A working WYSIWYG markdown editor that persists notes to browser storage, built on a strict TypeScript project with the storage abstraction layer that all future features depend on
**Depends on**: Nothing (first phase)
**Requirements**: DEVX-01, DEVX-02, DEVX-03, DEVX-04, DATA-01, DATA-04, EDIT-01, EDIT-02, EDIT-05
**Success Criteria** (what must be TRUE):
  1. User can open the app in a browser and see a working text editor
  2. User can type markdown (headings, bold, italic, lists, code blocks) and see it render inline as WYSIWYG
  3. User can undo and redo edits within a session
  4. User can close the browser tab, reopen it, and find their note content preserved exactly as they left it
  5. Project builds to static files with zero lint warnings under strictest TypeScript/ESLint configuration
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Core Product Experience
**Goal**: Users experience the full Paneful Notes product -- opening a tab shows today's daily note on the left alongside their weekly note, permanent notes, and a mini calendar on the right, all navigable by keyboard, with light/dark theming and full accessibility
**Depends on**: Phase 1
**Requirements**: LAYO-01, LAYO-02, LAYO-03, LAYO-04, DALY-01, DALY-02, DALY-03, WEEK-01, WEEK-02, WEEK-03, PERM-01, PERM-02, PERM-03, CALR-01, CALR-02, CALR-03, CALR-04, APPR-01, APPR-02, APPR-03, KEYS-01, KEYS-02, KEYS-03, KEYS-04, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05
**Success Criteria** (what must be TRUE):
  1. User opens the app and sees today's daily note on the left with their weekly note, a permanent note, and a mini calendar stacked on the right
  2. User can resize the split pane by dragging the divider and collapse/expand right-pane sections independently
  3. User can click any day on the mini calendar to navigate to that day's note, see dots on days with existing notes, and navigate between months
  4. User can create and switch between multiple named permanent notes that persist indefinitely
  5. User can toggle light/dark mode (defaulting to system preference) and navigate the entire app using only the keyboard, including switching focus between panes with CMD+[ and CMD+]
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Power Features
**Goal**: Users can customize their workflow with templates, organize with workspaces, find anything with search, paste images inline, link between daily notes with date references, and export/import their data as markdown files
**Depends on**: Phase 2
**Requirements**: TMPL-01, TMPL-02, TMPL-03, TMPL-04, TMPL-05, WKSP-01, WKSP-02, WKSP-03, SRCH-01, SRCH-02, SRCH-03, DATA-02, DATA-03, EDIT-03, EDIT-04
**Success Criteria** (what must be TRUE):
  1. User can save note content as a named template, load templates into notes, and set default templates for weekday/weekend daily notes and weekly notes
  2. User can create named workspaces, switch between them, and see that content never crosses workspace boundaries
  3. User can search across all notes in a workspace, see highlighted matching snippets, and click results to navigate to that note
  4. User can paste an image from clipboard and see it render inline in the note, with the image stored locally in the browser
  5. User can type [[2026-03-15]] and see it render as a clickable link that navigates to that day's note; user can export all data as a markdown zip and import markdown files to populate notes

**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Editor | 0/? | Not started | - |
| 2. Core Product Experience | 0/? | Not started | - |
| 3. Power Features | 0/? | Not started | - |
