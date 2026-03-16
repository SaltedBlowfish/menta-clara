# Paneful Notes

## What This Is

A local-first, browser-based note-taking app with a distinctive split-pane layout: daily notes on the left, weekly notes + permanent notes + a mini calendar on the right. All data lives in the browser — no server, no accounts, no lock-in. Designed with radical simplicity inspired by makingsoftware.com, built with strict TypeScript and obsessive code quality standards.

## Core Value

Users can open a tab and immediately start writing today's note alongside their running weekly and permanent notes — with zero friction, zero accounts, and zero data leaving their browser.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Split-pane layout: daily note (left), weekly + permanent + calendar (right)
- [ ] Auto-create today's note from template on app open
- [ ] WYSIWYG-style markdown editing (renders as you type)
- [ ] Weekly markdown window that persists for a configurable week cycle (Monday or Sunday start)
- [ ] Multiple named permanent notes per workspace, switchable
- [ ] Collapsible mini-month calendar with dots on days that have notes; click to navigate
- [ ] All data stored locally in browser (IndexedDB / OPFS) — no server
- [ ] Export all data as markdown files; import from markdown files
- [ ] Paste images inline (like GitHub markdown) — stored as blobs in browser DB, referenced by URL
- [ ] Template system: save/load named templates, set default daily templates for weekdays/weekends, set default weekly template
- [ ] Light/dark mode toggle respecting system preference
- [ ] Full keyboard navigation with shortcuts for all actions, including pane focus switching (CMD+[, CMD+], etc.)
- [ ] Workspaces: create, switch, and isolate content between workspaces
- [ ] Date references with [[YYYY-MM-DD]] syntax that link to that day's note
- [ ] Fully accessible: screen reader support, ARIA labels, keyboard-only navigation, no a11y violations

### Out of Scope

- Freeform wiki-style [[links]] to named pages — date references only for v1
- Server-side storage or sync — local-only
- User accounts or authentication — no backend
- Mobile-native app — web only
- Real-time collaboration — single user
- Plugin/extension system — keep it simple
- JSON export format — markdown files only for v1

## Context

- Hosted on a free static service (GitHub Pages or similar) — no server costs
- Design philosophy: radical simplicity. makingsoftware.com is the north star for visual design — clean, minimal, content-focused
- The name "Paneful" is a pun on the split-pane UI
- Target users: developers and knowledge workers who want a fast, private, keyboard-driven daily notes tool

## Constraints

- **Tech stack**: React + TypeScript + ESLint + Prettier — non-negotiable
- **Lint rules**: Strictest possible — no `any`, no `unknown`, no `as` casting, alphabetized imports/props/object keys
- **File size**: Max 100 lines per file, no multi-component exports, no default exports
- **Hosting**: Static files only — must work on GitHub Pages with no server
- **Storage**: Browser-only (IndexedDB / OPFS) — no external dependencies

## Key Decisions

| Decision                              | Rationale                                                           | Outcome   |
| ------------------------------------- | ------------------------------------------------------------------- | --------- |
| WYSIWYG-style markdown editor         | User wants rendered-as-you-type experience, not split edit/preview  | — Pending |
| Local blob store for images           | Keeps notes lightweight vs inline base64                            | — Pending |
| Multiple permanent notes (not single) | More flexible than one scratchpad per workspace                     | — Pending |
| Configurable week start day           | Accommodates both Monday (ISO) and Sunday (US) users                | — Pending |
| Markdown file export (not JSON)       | Human-readable, portable, works with other tools                    | — Pending |
| Date-only [[references]]              | Simpler than full wiki linking; sufficient for daily notes workflow | — Pending |

---

_Last updated: 2026-03-15 after initialization_
