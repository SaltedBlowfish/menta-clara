# Project Research Summary

**Project:** Paneful Notes
**Domain:** Local-first browser-based note-taking (daily/weekly journaling)
**Researched:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

Paneful Notes is a local-first, browser-based daily/weekly note-taking app whose core differentiator is an opinionated split-pane layout: daily notes on the left, weekly notes on the right. Expert consensus for this class of app is to use a headless rich text editor framework (Tiptap/ProseMirror) for WYSIWYG markdown editing, IndexedDB for local persistence, and a static-hosted SPA architecture with zero server dependencies. The stack is well-established: React 19.2, Vite 7.3, Tiptap 3.20 with the official markdown extension, Dexie.js 4.3 for IndexedDB, and CSS Modules for styling. All choices are high-confidence with one exception.

The recommended approach is to build in layers: storage abstraction first, then the generic editor component, then the split-pane layout, then date-based features (calendar, templates, weekly notes). This order respects the dependency chain identified across all four research files -- every feature ultimately depends on the storage layer and the editor working correctly. The product's MVP should validate the split-pane daily+weekly concept with nine P1 features before adding search, images, templates, and workspaces.

The primary risk is the Tiptap markdown extension (`@tiptap/markdown`), which is relatively new and needs thorough round-trip testing for edge cases. The second critical risk is Safari's ITP policy silently deleting IndexedDB data after 7 days of user inactivity -- this must be mitigated from day one with `navigator.storage.persist()`. A third risk is TypeScript friction with ProseMirror's loose types, which should be contained behind a typed abstraction layer in the editor integration module.

## Key Findings

### Recommended Stack

The stack centers on Tiptap 3.20 as the WYSIWYG markdown editor, chosen over BlockNote (lossy markdown conversion -- unacceptable) and Milkdown (bare-bones React integration). Dexie.js wraps IndexedDB with typed schemas, compound indexes, and `liveQuery()` for reactive data. Vite 7.3 is the build tool (Vite 8 dropped 3 days ago -- too fresh). CSS Modules provide zero-dependency scoped styling.

**Core technologies:**

- **Tiptap 3.20 + @tiptap/markdown:** WYSIWYG editor with bidirectional markdown serialization -- only option with lossless round-tripping
- **Dexie.js 4.3:** IndexedDB wrapper with typed schemas, compound indexes, migrations -- structured querying for date-based notes
- **React 19.2 + Vite 7.3:** UI framework and build tool -- stable, well-documented, non-negotiable per project constraints
- **date-fns 4.x:** Date manipulation -- tree-shakeable, functional API, critical for a date-heavy app
- **CSS Modules:** Scoped styling with zero runtime overhead -- built into Vite, fits radical simplicity philosophy
- **Vitest 4.1:** Testing -- native Vite integration, Jest-compatible API

### Expected Features

**Must have (table stakes):**

- WYSIWYG markdown editing with inline rendering
- Auto-save to IndexedDB (debounced, never lose data)
- Daily note auto-creation (open tab, today's note exists)
- Split-pane layout: daily left, weekly right
- Weekly note with configurable week start (Monday/Sunday)
- Mini calendar with activity dots and navigation
- Light/dark mode with system preference detection
- Keyboard shortcuts for formatting, pane focus, navigation
- Basic permanent notes (reference area in right pane)
- Full-text search across all notes

**Should have (differentiators):**

- Zero-friction instant start (no account, no setup)
- Template system with weekday/weekend awareness
- Date references `[[YYYY-MM-DD]]` with click navigation
- Workspaces for context isolation (work/personal)
- Image paste/embed with blob storage
- Data export as markdown zip
- Multiple named permanent notes

**Defer (v2+):**

- Cloud sync, plugin system, AI features, mobile native app, wiki-style bidirectional linking, nested folders, version history, real-time collaboration, encryption at rest -- all explicitly identified as anti-features for this product

### Architecture Approach

Layered architecture with strict unidirectional data flow. React UI reads from a storage abstraction layer backed by Dexie.js/IndexedDB. Each editor pane gets its own Tiptap instance (never shared). Note content lives in Tiptap's ProseMirror state, not React state. Coordination state (activeDate, workspaceId, theme) lives in a thin state layer (React Context or Zustand). Images stored in a separate IndexedDB object store from note text, referenced by ID.

**Major components:**

1. **App Shell** -- layout orchestration, theme provider, workspace context
2. **Left Pane (Daily Editor)** -- Tiptap instance connected to activeDate, auto-creates today's note
3. **Right Pane (Weekly/Permanent)** -- Tiptap instances for weekly note and permanent notes, tab/selector switching
4. **Storage Abstraction Layer** -- NoteStore, WorkspaceStore, TemplateStore, ImageStore wrapping Dexie tables
5. **State Layer** -- lightweight reactive state for activeDate, activeWorkspaceId, theme
6. **Mini Calendar** -- month view, dot indicators, date navigation
7. **Keyboard Shortcut Manager** -- global event listener routing focus and actions

### Critical Pitfalls

1. **Safari ITP deletes IndexedDB after 7 days of inactivity** -- call `navigator.storage.persist()` on first meaningful interaction; build export/backup feature early; detect Safari and warn users if persistence is not granted
2. **Tiptap/ProseMirror TypeScript looseness** -- contain all editor interactions behind a typed abstraction layer; accept narrow ESLint overrides in the editor module only; always import ProseMirror via `@tiptap/pm` for version alignment
3. **Image blobs degrade IndexedDB performance** -- separate image store from note store; never index binary data; lazy-load blobs only when rendering; consider OPFS as future optimization
4. **Keyboard shortcuts collide with browser/screen reader defaults** -- audit against Chrome/Firefox/Safari defaults; use CMD+Shift combos for app navigation; let editor own formatting shortcuts; build a shortcut reference panel
5. **100-line file limit creates artificial fragmentation** -- configure ESLint `max-lines` with `skipBlankLines`/`skipComments`; extract custom hooks as primary decomposition mechanism; separate type definitions into `.types.ts` files
6. **Editor accessibility is not built in** -- add `aria-pressed` on toggles, `aria-live` for status messages, axe-core tests from Phase 1; test with VoiceOver during development

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Storage + State + Project Setup)

**Rationale:** Every feature depends on the storage layer. Architecture research confirms this is the base of the dependency chain. Pitfalls research demands Safari ITP mitigation from day one.
**Delivers:** Dexie database schema with compound indexes, storage abstraction (NoteStore, WorkspaceStore, TemplateStore, ImageStore), thin state layer (activeDate, workspaceId, theme), ESLint/Prettier/TypeScript configuration with strict settings, project scaffolding with Vite 7.3.
**Addresses:** Auto-save infrastructure, workspace isolation via compound keys, data persistence
**Avoids:** Safari ITP data loss (persist() call), image blob performance issues (separate stores from start), single-store anti-pattern

### Phase 2: Core Editor

**Rationale:** The editor is the highest-risk, highest-complexity component. It must be proven before building panes around it. Stack research flags `@tiptap/markdown` as the biggest technical risk.
**Delivers:** Generic NoteEditor component with Tiptap, markdown round-trip serialization, debounced auto-save to storage layer, basic formatting (bold, italic, headings, lists, code, blockquote via StarterKit).
**Addresses:** WYSIWYG markdown editing, auto-save, undo/redo
**Avoids:** Editor TypeScript conflicts (typed abstraction layer), editor state in React (ProseMirror owns content), base64 image anti-pattern (blob architecture designed but not yet implemented)

### Phase 3: Split-Pane Layout + Daily/Weekly Notes

**Rationale:** The split-pane layout is the product's core differentiator. Architecture research shows it depends on the editor and date-based note organization both working. Feature research confirms this is the P1 differentiator.
**Delivers:** CSS Grid split-pane with resize handle, daily note pane (left), weekly note pane (right), date-based note creation/loading, configurable week start (Monday/Sunday), template-driven auto-creation for today's note.
**Addresses:** Split-pane layout, daily note auto-creation, weekly note, configurable week boundaries, zero-friction instant start
**Avoids:** Shared editor instance anti-pattern (one Tiptap per pane), global state for note content

### Phase 4: Calendar + Navigation + Permanent Notes

**Rationale:** Calendar and permanent notes complete the core navigation loop. Feature dependency graph shows calendar requires date-based storage (Phase 3) and permanent notes are a P1 feature that completes the right pane.
**Delivers:** Mini calendar with month view and activity dots, date navigation via calendar click, basic permanent notes in right pane, keyboard shortcuts for pane focus and navigation.
**Addresses:** Mini calendar with dots, permanent notes (basic), keyboard shortcuts, date-based organization
**Avoids:** Keyboard shortcut collisions (audit against browser defaults), loading all notes for calendar dots (lightweight metadata queries)

### Phase 5: Theme + Polish + Accessibility

**Rationale:** Light/dark mode is a P1 table stake but has no dependencies -- it can be layered on after core functionality works. Accessibility should be progressive but needs a dedicated pass once all interactive components exist.
**Delivers:** Light/dark mode with CSS custom properties and system preference detection, responsive typography, save status indicator, accessibility audit with axe-core, VoiceOver testing.
**Addresses:** Light/dark mode, responsive typography, accessibility
**Avoids:** Editor accessibility gaps (aria attributes, live regions), dark mode missing components (verify every element)

### Phase 6: Search + Images + Templates

**Rationale:** These are P2 features that enhance the validated core loop. Feature research places them as "add after validation." They depend on the storage layer being stable and the editor working well.
**Delivers:** Full-text search across notes, image paste/embed with separate blob storage, template CRUD with weekday/weekend/weekly defaults, date references `[[YYYY-MM-DD]]` as custom Tiptap extension.
**Addresses:** Full-text search, image paste, template system, date references
**Avoids:** Image blob performance (separate store, lazy loading, no binary indexing), search performance (incremental index, not full scan)

### Phase 7: Workspaces + Export/Import

**Rationale:** Workspaces modify queries across all components but do not change their structure (architecture research). Export/import is the safety net for data portability and Safari backup. These are P2 features that complete the product.
**Delivers:** Workspace CRUD and switching, data isolation per workspace, markdown zip export, markdown file import, multiple named permanent notes.
**Addresses:** Workspaces, data export, data import, multiple permanent notes
**Avoids:** Multi-tab conflicts (last-write-wins or lock mechanism)

### Phase Ordering Rationale

- **Storage before everything** because every component writes to or reads from IndexedDB -- this is the universal dependency
- **Editor before layout** because the editor is the highest-risk component; proving markdown round-tripping before building panes avoids costly rework
- **Split-pane before polish** because the split-pane layout IS the product -- it must be validated before investing in secondary features
- **Calendar with permanent notes** because they complete the core navigation loop together and both depend on the same storage queries
- **Theme and accessibility as a dedicated phase** rather than scattered across phases, because CSS custom properties and ARIA attributes are most efficiently applied once all components exist
- **Search, images, and templates grouped** because they are all P2 enhancements to an already-working editor, and they share complexity in custom Tiptap extensions
- **Workspaces last** because workspace isolation is already designed into the storage schema (compound keys) from Phase 1 -- the UI and switching logic can come late without restructuring

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 2 (Core Editor):** Tiptap markdown round-tripping edge cases, TypeScript compatibility with strict mode, custom extension API for date references and image paste. The `@tiptap/markdown` extension is flagged as MEDIUM confidence.
- **Phase 4 (Calendar):** WAI-ARIA grid pattern for accessible calendar navigation needs reference implementation research.
- **Phase 6 (Search):** In-browser full-text search strategy (MiniSearch vs in-memory index vs Web Worker) needs benchmarking at scale.

Phases with standard patterns (skip research-phase):

- **Phase 1 (Foundation):** Dexie.js schema design, Vite project setup, ESLint configuration -- all thoroughly documented with official guides.
- **Phase 3 (Split-Pane):** CSS Grid layout with resize handle is straightforward; architecture research provides the full pattern.
- **Phase 5 (Theme):** CSS custom properties for theming is a standard, well-documented pattern.
- **Phase 7 (Export/Import):** Markdown file generation and ZIP bundling are standard patterns.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                         |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | All major choices backed by official docs, multiple comparison sources, and clear rationale. Only `@tiptap/markdown` is MEDIUM (new extension).               |
| Features     | HIGH       | Feature landscape well-mapped against 6+ competitors. Clear P1/P2/P3 prioritization with dependency graph. Anti-features well-reasoned.                       |
| Architecture | HIGH       | Layered architecture with clear component boundaries, data flow diagrams, and build order. Repository pattern and compound key isolation are proven patterns. |
| Pitfalls     | HIGH       | Six critical pitfalls identified with specific prevention strategies and phase mappings. Safari ITP is the most impactful and least obvious.                  |

**Overall confidence:** HIGH

### Gaps to Address

- **@tiptap/markdown round-trip fidelity:** Needs hands-on spike testing with nested lists, inline images, code blocks with language tags, and `[[YYYY-MM-DD]]` custom syntax. Cannot be fully validated from documentation alone.
- **Split-pane resize implementation:** STACK.md recommends custom CSS Grid; ARCHITECTURE.md mentions react-resizable-panels. Need to decide during Phase 3 planning. Recommendation: start with custom CSS Grid (simpler, fewer dependencies), fall back to react-resizable-panels if accessibility or edge cases prove difficult.
- **Full-text search strategy at scale:** No concrete library recommendation yet. MiniSearch, Lunr.js, or a custom inverted index in a Web Worker are options. Benchmark needed during Phase 6 planning.
- **Multi-tab editing conflicts:** Identified in pitfalls but no concrete solution chosen. Dexie's `on('changes')` or BroadcastChannel API are candidates. Address during Phase 7.
- **Timezone handling for date references:** `[[YYYY-MM-DD]]` must resolve correctly regardless of user timezone. Needs explicit handling in the date-to-note mapping logic.

## Sources

### Primary (HIGH confidence)

- [Tiptap Official Docs](https://tiptap.dev/docs/editor/getting-started/overview) -- editor API, React integration, extensions, markdown
- [Dexie.js Official Site](https://dexie.org) -- IndexedDB wrapper API, schema versioning, liveQuery
- [MDN Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- quota, eviction, persist()
- [WebKit Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) -- Safari ITP behavior
- [Vite Official](https://vite.dev/releases) -- version guidance, Vite 7 vs 8
- [React 19.2 Announcement](https://react.dev/blog/2025/10/01/react-19-2) -- stable version confirmation
- [W3C WAI-ARIA Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) -- accessibility patterns

### Secondary (MEDIUM confidence)

- [Liveblocks Editor Comparison 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025) -- editor framework comparison
- [NoteApps.info](https://noteapps.info/) -- 41 note apps across 345 features
- [Zapier Best Note Apps 2026](https://zapier.com/blog/best-note-taking-apps/) -- competitor landscape
- [LogRocket Offline-First 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) -- local-first patterns
- [Dexie Image Storage Best Practices](https://medium.com/dexie-js/keep-storing-large-images-just-dont-index-the-binary-data-itself-10b9d9c5c5d7) -- blob storage guidance
- [Ink & Switch Local-First Software](https://www.inkandswitch.com/essay/local-first/) -- local-first philosophy

### Tertiary (LOW confidence)

- [Tiptap GitHub Issue #2836](https://github.com/ueberdosis/tiptap/issues/2836) -- TypeScript compatibility concerns (may be resolved in 3.20)
- [Mozilla Bug 837141](https://bugzilla.mozilla.org/show_bug.cgi?id=837141) -- Firefox IndexedDB blob performance (may be improved in current Firefox)

---

_Research completed: 2026-03-15_
_Ready for roadmap: yes_
