# Pitfalls Research

**Domain:** Local-first browser-based note-taking app with WYSIWYG markdown editing
**Researched:** 2026-03-15
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Safari ITP Deletes All IndexedDB Data After 7 Days of Inactivity

**What goes wrong:**
Safari's Intelligent Tracking Prevention (ITP) deletes all script-writable storage -- IndexedDB, LocalStorage, Service Worker registrations -- if the user has not interacted with the site (click, tap, or text input) within 7 days of browser use. A user who takes a week-long vacation comes back to find all their notes gone. This is not a bug; it is by design in WebKit.

**Why it happens:**
Apple implemented ITP to combat cross-site tracking. The side effect is that purely browser-based apps cannot treat IndexedDB as durable storage on Safari. Many developers only test on Chrome where this limitation does not exist.

**How to avoid:**
1. Call `navigator.storage.persist()` on app initialization (supported in Safari 17.0+, iOS 17+). This opts out of automatic eviction.
2. Prompt users to "Add to Home Screen" on iOS/macOS -- home screen web apps have their own storage timer that only counts days of actual app use.
3. Build the export/import feature early and surface a prominent "Back up your notes" reminder in the UI.
4. On app startup, detect Safari and check `navigator.storage.persisted()`. If not persisted, show a one-time warning explaining the risk and guiding the user to grant persistent storage.

**Warning signs:**
- Zero Safari testing during development
- No `navigator.storage.persist()` call in initialization code
- No export/backup feature until late in development
- Bug reports from Safari users about "empty app"

**Phase to address:**
Phase 1 (Foundation/Storage layer). The storage abstraction must call `persist()` from day one. Export/import should be in Phase 2 at latest.

---

### Pitfall 2: WYSIWYG Markdown Editor Library Fights Your Type System

**What goes wrong:**
The project demands strict TypeScript (no `any`, no `unknown`, no `as` casting). Rich text editor libraries like TipTap/ProseMirror have historically loose TypeScript types. ProseMirror's TypeScript port created breaking type incompatibilities with TipTap, producing errors like `Type 'Transaction' is not generic` and `Type 'Node' is not generic`. You end up either littering the codebase with type assertions (violating your own rules) or spending enormous time writing wrapper types.

**Why it happens:**
Rich text editors are among the most complex UI components. Their internal data models (document schemas, marks, decorations, plugin state) are inherently dynamic and resist static typing. The ProseMirror ecosystem was originally JavaScript-first; TypeScript support was retrofitted. TipTap wraps ProseMirror, adding another layer of type indirection.

**How to avoid:**
1. Pin TipTap and ProseMirror to exact versions (not ranges) and only upgrade deliberately.
2. Use `@tiptap/pm` for all ProseMirror imports -- it ensures version alignment between TipTap and ProseMirror.
3. Create a thin typed abstraction layer around the editor. Contain all editor interactions behind a well-typed interface so that type looseness is isolated to one module rather than spread throughout the app.
4. Accept that the editor integration module may need a local ESLint override for the `no-as-casting` rule -- but scope it narrowly to that module only.
5. Evaluate whether a simpler editor (Milkdown, which is built on ProseMirror but with better TypeScript) might reduce friction.

**Warning signs:**
- Type errors appearing in editor-related files that require `as` casts to resolve
- ProseMirror version mismatches in `package-lock.json`
- Editor logic leaking into non-editor components
- Growing number of `// eslint-disable` comments

**Phase to address:**
Phase 1 (Editor selection and integration). Make the editor choice and prove type compatibility in a spike before building features on top of it.

---

### Pitfall 3: Image Blobs in IndexedDB Cause Silent Performance Degradation

**What goes wrong:**
Storing pasted images as blobs in IndexedDB works at small scale but degrades as the database grows. Applications become slower and can eventually crash. The key mistake is indexing fields that contain or reference large binary data, or loading all note content (including blob references) when only metadata is needed. Firefox has documented "horrible performance storing IndexedDB blobs." Different browsers handle blobs differently -- Chrome historically could not handle IndexedDB PUT of binary blobs in some contexts.

**Why it happens:**
IndexedDB is designed for structured data, not as a blob store. Developers store images in the same object store as note text, query note objects that include blob references, and accidentally cause the browser to load megabytes of binary data when iterating over notes (e.g., for search or calendar dot indicators).

**How to avoid:**
1. Store images in a separate IndexedDB object store from note text. Notes reference images by ID, not by embedded blob.
2. Never index binary data fields. Only index metadata (noteId, date, filename, size).
3. Use lazy loading: only fetch image blobs when the note containing them is actively rendered.
4. Consider OPFS (Origin Private File System) for image storage instead of IndexedDB -- it provides file-system-like performance for binary data and is purpose-built for this use case.
5. Implement a storage quota check on startup and warn users when approaching limits.
6. Batch image writes into single transactions rather than one transaction per image.

**Warning signs:**
- App startup time increasing over weeks of use
- Note list or calendar rendering slowing down
- Browser dev tools showing large IndexedDB reads on page load
- "QuotaExceededError" exceptions in production

**Phase to address:**
Phase 1 (Storage architecture). The decision to separate image storage from note storage must be made at the data layer design stage, not retrofitted later.

---

### Pitfall 4: Keyboard Shortcuts Collide with Browser and Screen Reader Shortcuts

**What goes wrong:**
The app defines keyboard shortcuts like CMD+[ and CMD+] for pane switching, CMD+K for linking, CMD+B/I/U for formatting. These collide with browser shortcuts (CMD+[ is browser back in Safari/Firefox, Ctrl+K is Chrome address bar focus) and screen reader shortcuts. Users on different browsers/OS combos get completely different behavior. Screen reader users get locked out of essential functionality.

**Why it happens:**
There are no keystroke combinations guaranteed to be conflict-free across all browsers, operating systems, and assistive technologies. Developers test on one browser and assume shortcuts work everywhere. The WYSIWYG editor also brings its own shortcut layer that can conflict with app-level shortcuts.

**How to avoid:**
1. Audit shortcuts against browser defaults for Chrome, Firefox, Safari, and Edge before committing to them. MDN maintains lists; so do browser vendors.
2. Never override single-modifier shortcuts (Alt+key) -- these are reserved for browser menus and screen reader navigation.
3. Use `aria-keyshortcuts` attributes to announce shortcuts to assistive technology.
4. Layer shortcuts: let the editor handle text-formatting shortcuts (CMD+B/I/U are universally expected in editors and override browser defaults safely), but use less common combinations for app-level navigation (e.g., CMD+Shift+[ instead of CMD+[).
5. Build a shortcut reference panel (CMD+/) that users can discover.
6. Consider making shortcuts remappable in a future phase.

**Warning signs:**
- Shortcuts "not working" bug reports that are browser-specific
- Screen reader testing reveals broken navigation
- Editor shortcuts and app shortcuts firing simultaneously or not at all
- No shortcut documentation in the app

**Phase to address:**
Phase 2 (Keyboard navigation). Design the shortcut map as a dedicated task with cross-browser testing, not as an afterthought added to individual features.

---

### Pitfall 5: 100-Line File Limit Creates Artificial Component Fragmentation

**What goes wrong:**
The strict 100-line file limit forces decomposition of components that are naturally cohesive. A WYSIWYG editor toolbar, a calendar widget, or an export dialog each have enough logic to exceed 100 lines even when well-written. Developers fragment them into 5-10 tiny files with heavy prop-drilling or excessive context usage. The resulting code is harder to understand because related logic is scattered, and the abstraction boundaries are driven by line count rather than domain concepts.

**Why it happens:**
The 100-line limit is an excellent heuristic for business logic and utility functions. But UI components with JSX, event handlers, and accessibility attributes are inherently more verbose. A well-structured 150-line component is often clearer than three 50-line files with shared state threaded between them.

**How to avoid:**
1. Configure the ESLint `max-lines` rule to skip blank lines and comments (`skipBlankLines: true, skipComments: true`). This typically saves 15-30 lines per file.
2. Extract custom hooks aggressively -- a `useCalendar()` hook or `useEditor()` hook moves logic out of the component without fragmenting the UI.
3. Separate type definitions into co-located `.types.ts` files -- types can be verbose but should not count against component line budgets.
4. Accept that some files (editor integration, complex data migration logic) may need a scoped ESLint override with a documented rationale. A 120-line file with a clear purpose is better than three 40-line files with unclear boundaries.
5. Use the constraint as a design signal: if a component genuinely exceeds 100 lines of logic, that is a signal to extract a custom hook or utility, not to split the JSX arbitrarily.

**Warning signs:**
- Components with 6+ props being passed through just to satisfy file splitting
- Files named `ComponentPartA.tsx` / `ComponentPartB.tsx` with no clear domain boundary
- Hooks that exist only to reduce line count, not to encapsulate reusable logic
- Developers spending more time on file splitting than on features

**Phase to address:**
Phase 1 (Project setup). Configure ESLint rules with `skipBlankLines` and `skipComments` from the start. Establish the convention that custom hooks are the primary extraction mechanism.

---

### Pitfall 6: Rich Text Editor Accessibility is Not "Built In"

**What goes wrong:**
Developers assume that choosing an established editor library (TipTap, ProseMirror) gives them accessibility for free. It does not. The editor provides a contenteditable region with basic keyboard support, but the surrounding UI -- toolbar buttons, dropdown menus, link dialogs, markdown shortcuts -- needs explicit ARIA roles, states, labels, and live regions. Without these, screen reader users cannot discover formatting options, do not hear status changes (autosave confirmations, error messages), and cannot navigate the toolbar.

**Why it happens:**
contenteditable is inherently accessible for basic text input. This creates a false sense of completeness. The complex parts -- announcing active formatting states via `aria-pressed`, making custom dropdowns keyboard-navigable, providing live region announcements for non-visual feedback -- require deliberate work that is invisible in visual testing.

**How to avoid:**
1. Use `aria-pressed` on all toggle buttons (bold, italic, etc.) to communicate active state.
2. Implement `aria-live` regions for status messages (save confirmations, errors, word count changes).
3. Make all toolbar interactions follow WAI-ARIA button, menu, and dialog patterns.
4. Test with VoiceOver (macOS/iOS) and NVDA (Windows) during development, not just before release.
5. Add automated accessibility tests using axe-core in the test suite from Phase 1.
6. Ensure the editor has a visible focus indicator that meets WCAG contrast requirements.

**Warning signs:**
- No screen reader testing in the development workflow
- Toolbar buttons without `aria-label` or `aria-pressed` attributes
- Status messages that only appear visually (toast notifications without live regions)
- Tab key does not move through toolbar in a logical order

**Phase to address:**
Phase 1 (Editor integration) for base editor accessibility. Phase 2 (UI features) for toolbar and dialog accessibility. Every phase should include accessibility verification.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing images as base64 strings in note text | No separate storage layer needed | Notes become huge, search/list performance degrades, export files are bloated | Never -- design blob storage from the start |
| Using `localStorage` for settings before IndexedDB is ready | Quick settings persistence | Two storage systems to maintain, localStorage has 5MB limit, no migration path | Only for non-critical preferences (theme toggle), never for note data |
| Skipping `navigator.storage.persist()` | No permission prompt on first visit | Data loss on Safari, unreliable storage on all browsers under disk pressure | Never -- call it on first meaningful user action |
| Putting all state in React context | Simple state sharing | Re-renders cascade through the entire app when any note changes, editor becomes laggy | Only for truly global, rarely-changing state (theme, workspace ID). Use dedicated state management for notes. |
| Single IndexedDB object store for everything | Simpler schema | Cannot query notes without loading images, cannot upgrade note schema without touching images | Never -- separate stores for notes, images, templates, settings from the start |
| Inline ESLint disables for type issues | Unblocks development | Accumulates into dozens of suppressed warnings that hide real bugs | Only in the editor integration module, with documented rationale per disable |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all notes on startup to render calendar dots | Slow initial load, growing over time | Store note metadata (dates with content) in a separate lightweight index | ~100 notes (3-4 months of daily use) |
| Re-rendering the editor on every keystroke via React state | Input lag, dropped characters, cursor jumping | Let the editor manage its own state; sync to React only on blur/save | Immediately with any non-trivial document |
| Synchronous IndexedDB reads blocking the main thread | UI freezes during save/load | Use async IndexedDB APIs consistently; consider moving heavy reads to a Web Worker | ~50 notes with images |
| Unthrottled autosave writing to IndexedDB on every change | Disk I/O spikes, battery drain on laptops | Debounce autosave (1-2 seconds after last keystroke) | Immediately on any device |
| Full-text search scanning all note content on every query | Search takes seconds, UI freezes | Build a search index incrementally; consider a lightweight in-browser search index (e.g., MiniSearch) | ~200 notes |
| CSS-in-JS or runtime styling in the editor | Jank during typing, layout thrashing | Use static CSS or CSS modules for editor styles; avoid runtime style computation in the editing path | Noticeable with documents over 500 words |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering user-pasted HTML without sanitization in WYSIWYG mode | XSS via pasted content from malicious websites | Use the editor's built-in sanitization (ProseMirror schema restricts allowed nodes/marks by default). Never use `dangerouslySetInnerHTML` for note rendering. |
| Storing sensitive notes without warning about browser storage visibility | Other users of the shared computer can read notes via dev tools | Display a clear notice that notes are stored unencrypted in the browser. Consider optional encryption for a future phase. |
| Export/import accepting arbitrary HTML in markdown files | XSS via crafted import files | Parse imported markdown strictly through a markdown parser (remark/unified), never interpret raw HTML in imports |
| Blob URLs (`URL.createObjectURL`) not being revoked | Memory leaks from accumulated blob URLs | Revoke blob URLs when images are removed from view or notes are closed. Track active blob URLs in a cleanup registry. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visible indicator that data is saved | Users worry about data loss, compulsively export | Show a subtle "Saved" indicator with timestamp; use `beforeunload` to warn about unsaved changes |
| Calendar requires mouse interaction | Keyboard-only users cannot navigate dates | Full arrow-key navigation in calendar grid following WAI-ARIA grid pattern |
| Markdown syntax visible during editing | Defeats the purpose of WYSIWYG; looks like a code editor | Ensure the editor renders markdown as formatted text inline, hiding syntax characters. Test with non-technical users. |
| Split-pane layout not responsive | Mobile/tablet users get overlapping panes or tiny text | Below a breakpoint, stack panes vertically with tab switching. Do not try to show both panes on mobile. |
| No undo after destructive actions (delete note, delete workspace) | Accidental data loss | Implement soft-delete with a 30-day recovery period, or at minimum a confirmation dialog with the note title displayed |
| Template system is all-or-nothing | Users want to modify templates but fear losing the original | Applying a template should insert content, not replace. Allow template editing separately from note editing. |

## "Looks Done But Isn't" Checklist

- [ ] **WYSIWYG Editor:** Often missing proper cursor positioning after paste, undo/redo across formatting boundaries, and handling of triple-click selection -- verify with edge-case text operations
- [ ] **IndexedDB Storage:** Often missing migration strategy for schema changes -- verify that upgrading the DB version handles existing user data without loss
- [ ] **Image Paste:** Often missing handling for paste from different sources (clipboard screenshot vs drag-and-drop vs file picker vs URL paste) -- verify all four input methods
- [ ] **Keyboard Navigation:** Often missing focus trap management in modals/dialogs and proper tab order across split panes -- verify with Tab key only (no mouse)
- [ ] **Export/Import:** Often missing round-trip fidelity (export then import produces identical notes) -- verify with notes containing images, special characters, and [[date references]]
- [ ] **Dark Mode:** Often missing proper styling of the editor toolbar, calendar, and scrollbar -- verify every component, not just the note body
- [ ] **Date References:** Often missing timezone handling -- verify that [[2026-03-15]] creates/links the correct note regardless of user timezone
- [ ] **Autosave:** Often missing conflict handling when the same note is open in two browser tabs -- verify with two tabs editing the same daily note

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Safari ITP data deletion | HIGH (data is gone) | Cannot recover deleted data. Mitigation: persistent storage API prevents it. Post-incident: help user reimport from their last export. |
| Image blob storage degrading performance | MEDIUM | Migrate images from note object store to separate store or OPFS. Requires a one-time migration script run on app startup. |
| Keyboard shortcut conflicts discovered late | LOW | Remap shortcuts in a config object. Update shortcut reference UI. Ship as a patch. |
| Editor type incompatibility after library update | MEDIUM | Pin to last working version. Create typed wrapper interfaces. Gradually update types in isolation. |
| Component over-fragmentation from line limits | LOW | Recombine files that share state. Adjust ESLint overrides with documented rationale. Refactor in a dedicated cleanup sprint. |
| Accessibility failures caught in production | MEDIUM-HIGH | Audit with axe-core, fix ARIA attributes, add screen reader testing to CI. Costly if fundamental patterns (toolbar, dialogs) need restructuring. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Safari ITP data loss | Phase 1: Storage foundation | `navigator.storage.persisted()` returns true in Safari; export feature exists |
| Editor TypeScript conflicts | Phase 1: Editor integration spike | Zero `as` casts outside editor module; all editor types compile without error |
| Image blob performance | Phase 1: Storage architecture | Images in separate store; loading note list does not trigger blob reads (verify in Network/Performance tab) |
| Keyboard shortcut conflicts | Phase 2: Keyboard navigation | Shortcuts tested in Chrome, Firefox, Safari; no collisions with browser defaults documented in test matrix |
| 100-line file fragmentation | Phase 1: Project setup | ESLint configured with `skipBlankLines`/`skipComments`; custom hook extraction convention documented |
| Editor accessibility gaps | Phase 1 + every subsequent phase | axe-core tests pass; VoiceOver testing completed for each new UI component |
| Autosave performance | Phase 1: Storage layer | Debounced saves verified; no writes on every keystroke |
| Multi-tab conflicts | Phase 3: Polish/edge cases | Two tabs open same note; last-write-wins or lock mechanism prevents corruption |

## Sources

- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) -- Safari ITP and persistent storage API support
- [RxDB: IndexedDB Max Storage Limit](https://rxdb.info/articles/indexeddb-max-storage-limit.html)
- [Dexie.js: Keep storing large images, just don't index the binary data](https://medium.com/dexie-js/keep-storing-large-images-just-dont-index-the-binary-data-itself-10b9d9c5c5d7)
- [Mozilla Bug 837141: Horrible performance storing IndexedDB blobs](https://bugzilla.mozilla.org/show_bug.cgi?id=837141)
- [TipTap Issue #2836: ProseMirror TypeScript port breaks TipTap](https://github.com/ueberdosis/tiptap/issues/2836)
- [The pain and anguish of using IndexedDB](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a)
- [Two Common Pitfalls for Keyboard Shortcuts in Web Applications](https://www.mathiaspolligkeit.com/two-common-pitfalls-for-keyboard-shortcuts-in-web-applications/)
- [W3C WAI-ARIA: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [10 tips for building accessible rich text editors](https://jkrsp.com/accessibility-for-rich-text-editors/)
- [ESLint: max-lines rule](https://eslint.org/docs/latest/rules/max-lines)
- [LogRocket: Offline-first frontend apps in 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Ink & Switch: Local-first software](https://www.inkandswitch.com/essay/local-first/)
- [CKEditor: Accessible Rich Text Editor](https://ckeditor.com/blog/accessible-rich-text-editor-eu-accessibility-act/)

---
*Pitfalls research for: local-first browser-based note-taking app (Paneful Notes)*
*Researched: 2026-03-15*
