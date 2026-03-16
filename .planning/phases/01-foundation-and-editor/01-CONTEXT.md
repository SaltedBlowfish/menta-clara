# Phase 1: Foundation and Editor - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffolding with strict TypeScript, a storage abstraction layer over IndexedDB, and a WYSIWYG TipTap markdown editor with auto-save. No UI chrome, no split-pane layout, no daily/weekly note distinction. This phase delivers a single centered editor that persists content to the browser.

</domain>

<decisions>
## Implementation Decisions

### Build Tooling & Scaffolding
- Vite as build tool (React + TypeScript template)
- pnpm as package manager
- Vitest as testing framework (native Vite integration)
- Flat feature folder structure: `src/app/`, `src/editor/`, `src/storage/`, `src/types/`
- Plain CSS file (`src/app.css`) per UI-SPEC — no Tailwind, no CSS modules

### Storage Abstraction
- Hook-only pattern — `useNote()` hook wraps IndexedDB directly, no separate repository class
- Use `idb` library (~1KB gzipped) for Promise-based IndexedDB access
- Single content blob data model for Phase 1:
  ```
  interface Note {
    id: string           // 'current' for Phase 1
    content: JSONContent  // TipTap document JSON
    updatedAt: number     // timestamp
  }
  ```
- Store content as TipTap JSON (native document format), not markdown strings — avoids round-trip fidelity risk
- Request `navigator.storage.persist()` on first load (before any user interaction)

### TipTap Editor Configuration
- StarterKit extension bundle (headings, bold, italic, lists, blockquote, code, history/undo-redo)
- CodeBlockLowlight extension for syntax-highlighted code blocks (js, ts, python, bash, json, html, css)
- Full markdown input rules enabled (typing `# ` converts to H1, `**text**` converts to bold, etc.)
- No placeholder text — blank editor on load
- Editor auto-focuses on page load

### Auto-Save & Error Handling
- 300ms debounce after each edit
- Immediate save on blur (tab loses focus)
- Best-effort save via `visibilitychange` + `beforeunload` events on tab close
- On IndexedDB write failure: show subtle inline warning near bottom of editor, user can keep typing (content lives in TipTap memory), retry on next edit
- On persistent storage denial: show warning per UI-SPEC copy ("Your browser could not enable persistent storage...")

### Claude's Discretion
- ESLint rule configuration details (specific rule names/settings)
- Prettier configuration specifics
- idb database versioning and schema setup
- Exact debounce implementation (lodash vs custom)
- Inline warning component styling and positioning
- Vitest configuration and initial test structure

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Design Contract
- `.planning/phases/01-foundation-and-editor/01-UI-SPEC.md` — Approved visual/interaction contract: spacing scale, typography, colors, layout (720px centered editor), interaction behaviors

### Phase Research
- `.planning/phases/01-foundation-and-editor/01-RESEARCH.md` — TipTap extension analysis, IndexedDB patterns, Safari ITP mitigation, ESLint strict config findings

### Project Constraints
- `.planning/PROJECT.md` — Tech stack constraints (React + TS + ESLint + Prettier), file size limits (100 lines), no default exports, alphabetized imports
- `.planning/REQUIREMENTS.md` — Phase 1 requirement IDs: DEVX-01 through DEVX-04, DATA-01, DATA-04, EDIT-01, EDIT-02, EDIT-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project

### Established Patterns
- No patterns established yet — Phase 1 sets the conventions

### Integration Points
- Phase 2 will wrap this editor in a split-pane layout
- Phase 2 will extend the Note data model with type/date/workspace fields
- Phase 3 will add markdown export from stored TipTap JSON

</code_context>

<specifics>
## Specific Ideas

- Design philosophy follows makingsoftware.com — radical simplicity, clean, minimal, content-focused
- The name "Paneful" is a pun on the split-pane UI (introduced in Phase 2)
- Target users are developers and knowledge workers — syntax highlighting in code blocks matters

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-and-editor*
*Context gathered: 2026-03-15*
