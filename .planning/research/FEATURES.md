# Feature Research

**Domain:** Local-first browser-based note-taking (daily/weekly journaling focus)
**Researched:** 2026-03-15
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature                               | Why Expected                                                                                                                                                                           | Complexity | Notes                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Rich text / WYSIWYG markdown editing  | Every modern note app (Bear, Notion, Obsidian Live Preview) renders formatting inline. Raw markdown editing feels dated.                                                               | HIGH       | Core editor choice is the highest-risk decision. Tiptap or Milkdown are leading options for React WYSIWYG markdown. |
| Full-text search across all notes     | Users accumulate hundreds of notes quickly. Without search, the app is a write-only store. Obsidian, Bear, Apple Notes, Standard Notes all have instant search.                        | MEDIUM     | IndexedDB supports text indexing. Consider a simple in-memory index for v1 given browser-local data sizes.          |
| Keyboard shortcuts for common actions | Target audience is developers/power users. Every competitor (Obsidian, Bear, Notion) has extensive keyboard shortcuts. Zapier and noteapps.info flag this as baseline.                 | LOW        | Define a shortcut map early. CMD+N, CMD+S, CMD+K, CMD+B/I/U are universal expectations.                             |
| Auto-save / never lose data           | Users expect notes to persist without explicit save. Every competitor auto-saves. Data loss is the #1 trust killer for note apps.                                                      | LOW        | Write to IndexedDB on debounced input changes. No save button needed.                                               |
| Light/dark mode                       | Standard expectation in 2026. Apple Notes, Bear, Obsidian, Standard Notes all support it. Users on dark mode will bounce if blinded by a white-only UI.                                | LOW        | Use CSS custom properties. Respect `prefers-color-scheme` on first load, allow manual toggle.                       |
| Data export (markdown files)          | Local-first users are privacy-conscious and anti-lock-in. Export to standard formats is non-negotiable for this audience. Obsidian stores as plain markdown; Bear exports to markdown. | MEDIUM     | Zip file of .md files + image assets. Must handle image references correctly.                                       |
| Image paste/embed                     | Pasting screenshots is a core workflow for developers. GitHub-style paste-to-embed is expected. Bear, Obsidian, Notion, Apple Notes all support inline images.                         | MEDIUM     | Store as blobs in IndexedDB/OPFS. Reference via object URLs. Handle paste events from clipboard API.                |
| Date-based note organization          | For a daily notes tool, organizing by date is fundamental. Obsidian Daily Notes, Logseq, and Roam all center on date-based navigation.                                                 | LOW        | Calendar UI + date-keyed storage. This is core to the product identity.                                             |
| Undo/redo                             | Universal expectation in any text editor. Users will CMD+Z reflexively.                                                                                                                | LOW        | Editor frameworks (Tiptap, ProseMirror) provide this out of the box.                                                |
| Responsive/clean typography           | Bear won an Apple Design Award for typography. Users judge note apps by how text looks and feels. Poor typography = "cheap" perception.                                                | LOW        | Invest in font choice, line height, paragraph spacing. System font stack or a single clean sans-serif.              |

### Differentiators (Competitive Advantage)

Features that set Paneful Notes apart. Not required by the market, but aligned with the product's core value proposition.

| Feature                                     | Value Proposition                                                                                                                                                                                                                                        | Complexity | Notes                                                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Split-pane daily + weekly layout            | No competitor offers a persistent side-by-side daily/weekly view as a first-class feature. Obsidian requires plugin setup (Periodic Notes + Dataview + manual config). This is Paneful's core identity.                                                  | HIGH       | This is the product. The pane layout, resizing, and focus switching must feel native and polished.                        |
| Zero-friction instant start                 | Open a tab, today's note exists, start typing. No account, no sync setup, no onboarding wizard. Faster than Obsidian (requires vault setup), Notion (requires account), Standard Notes (requires account). Comparable to Apple Notes but cross-platform. | LOW        | Auto-create today's note on app load. Template system populates content. The "just works" factor.                         |
| Permanent notes alongside daily/weekly      | A scratchpad/reference area visible alongside temporal notes. Obsidian can do this with multiple panes but requires manual setup. Having named permanent notes built-in removes friction.                                                                | MEDIUM     | Multiple named notes per workspace. Tab/dropdown to switch between them in the right pane.                                |
| Mini calendar with activity dots            | Visual indicator of which days have notes. Obsidian has this via Calendar plugin but it's an add-on. Built-in calendar navigation with dot indicators is a polish differentiator.                                                                        | MEDIUM     | Month view, dots on days with notes, click to navigate. Collapsible to save space.                                        |
| Configurable week boundaries                | Monday-start vs Sunday-start week cycles. Most daily note tools assume one or the other. Offering configuration respects international users (ISO week = Monday, US = Sunday).                                                                           | LOW        | Simple setting. Affects weekly note date ranges and calendar rendering.                                                   |
| Template system with day-of-week awareness  | Different templates for weekdays vs weekends. Obsidian's Templater can do this but requires scripting. Built-in day-aware templates are a UX win.                                                                                                        | MEDIUM     | Template CRUD + assignment rules (weekday default, weekend default, weekly default).                                      |
| Workspaces for context isolation            | Separate work/personal/project contexts. Bear has no workspace concept. Obsidian has vaults (but they're filesystem directories). Browser-based workspaces with instant switching is clean.                                                              | MEDIUM     | Isolated IndexedDB stores or prefixed keys per workspace. Workspace switcher UI.                                          |
| Date references with [[YYYY-MM-DD]] linking | Click a date reference to jump to that day's note. Lighter than full wiki linking but useful for daily journaling (e.g., "follow up from [[2026-03-10]]").                                                                                               | MEDIUM     | Parse [[date]] syntax in editor, render as clickable links, navigate to that day's note.                                  |
| Fully offline / no network required         | Works on airplane, in secure environments, without internet. Standard Notes and Obsidian work offline but require initial setup. A static-hosted PWA that never phones home is a stronger privacy story.                                                 | LOW        | Already inherent in the architecture (static files + IndexedDB). Make it explicit with a PWA manifest for installability. |
| Import from markdown files                  | Let users bring existing daily notes from Obsidian vaults or other tools. Reduces switching cost.                                                                                                                                                        | MEDIUM     | Parse markdown files, extract dates from filenames, map to daily/weekly notes. Handle image references.                   |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems, especially for a radically simple local-first daily notes tool.

| Feature                                 | Why Requested                                                                  | Why Problematic                                                                                                                                                                                                                                                        | Alternative                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Cloud sync between devices              | "I want my notes on my phone too"                                              | Requires a server, accounts, conflict resolution (CRDT or OT), ongoing hosting costs. Contradicts zero-server constraint. Adds enormous complexity.                                                                                                                    | Export/import via files. Consider optional sync as a much-later feature via a user-provided backend (e.g., CouchDB, Dropbox).     |
| Full wiki-style [[page links]]          | Power users from Obsidian/Roam expect bidirectional linking to arbitrary pages | Turns a simple daily notes tool into a knowledge graph. Backlinks, orphan detection, graph visualization follow. Massive scope creep.                                                                                                                                  | Date references only ([[YYYY-MM-DD]]). Named permanent notes cover the "reference page" use case without graph complexity.        |
| Plugin/extension system                 | "Let me customize everything"                                                  | Plugin APIs are a product unto themselves. Security concerns with third-party code in browser. Maintenance burden dwarfs core app. Obsidian's plugin ecosystem took years to mature.                                                                                   | Build opinionated features directly. Keep the feature set small and excellent rather than extensible and mediocre.                |
| AI features (summarization, generation) | "Every app has AI now"                                                         | Requires API keys, server calls, or large WASM models. Breaks local-first/no-network promise. Adds cost. AI note features are still gimmicky for journaling use cases.                                                                                                 | Stay focused on the writing experience. AI is table stakes for Notion/enterprise tools, not for privacy-focused local journals.   |
| Real-time collaboration                 | "I want to share notes with my team"                                           | Requires server infrastructure, presence indicators, conflict resolution. Fundamentally at odds with local-first single-user design.                                                                                                                                   | This is a personal tool. Share by exporting markdown files.                                                                       |
| Database/table views                    | "Notion has tables and databases"                                              | Turns a note-taking app into a spreadsheet/project management tool. Massive implementation complexity. Different product category entirely.                                                                                                                            | Markdown tables in notes cover basic tabular needs.                                                                               |
| Mobile native app                       | "I need it on my phone"                                                        | Requires React Native/Capacitor, separate build pipeline, app store maintenance, mobile-specific UX. Split-pane layout doesn't translate to mobile.                                                                                                                    | Responsive web design for basic mobile viewing. The split-pane desktop experience is the product; don't compromise it for mobile. |
| Nested folders / deep hierarchy         | "I need to organize notes in folders"                                          | Date-based notes don't need folders. Deep hierarchies cause "filing anxiety" -- spending more time organizing than writing. Research shows flat + search beats deep folders.                                                                                           | Workspaces for top-level separation. Calendar for date navigation. Search for everything else.                                    |
| Version history / time travel           | "I want to see previous versions of my note"                                   | Storage multiplication, UI complexity for diffing, IndexedDB size concerns. Marginal value for daily notes that are inherently temporal.                                                                                                                               | Undo/redo within a session covers the actual need (accidental deletion). Daily notes are already versioned by date.               |
| Encryption at rest                      | "Encrypt my local data"                                                        | Browser storage encryption is largely theater -- if someone has access to your browser profile, they have your data regardless. Standard Notes does this with server sync in mind. For local-only, OS-level disk encryption (FileVault, BitLocker) is the right layer. | Document that users should enable OS disk encryption. Don't add fake security that creates key management complexity.             |

## Feature Dependencies

```
[WYSIWYG Markdown Editor]
    |
    +--requires--> [Auto-save to IndexedDB]
    |                  |
    |                  +--requires--> [Storage Layer (IndexedDB/OPFS)]
    |
    +--requires--> [Undo/Redo] (provided by editor framework)
    |
    +--enables---> [Image Paste/Embed]
    |                  |
    |                  +--requires--> [Blob Storage in IndexedDB]
    |
    +--enables---> [Date References [[YYYY-MM-DD]]]
    |
    +--enables---> [Template System]

[Storage Layer (IndexedDB/OPFS)]
    |
    +--enables---> [Full-text Search]
    +--enables---> [Workspaces]
    +--enables---> [Export to Markdown]
    +--enables---> [Import from Markdown]

[Date-based Note Organization]
    |
    +--requires--> [Storage Layer]
    |
    +--enables---> [Mini Calendar with Activity Dots]
    +--enables---> [Auto-create Today's Note]
    |                  |
    |                  +--enhances--> [Template System]
    |
    +--enables---> [Split-Pane Daily/Weekly Layout]
                       |
                       +--requires--> [Weekly Note Cycle Logic]
                       +--requires--> [Configurable Week Start]
                       +--enhances--> [Permanent Notes Pane]

[Light/Dark Mode] -- independent, no dependencies
[Keyboard Shortcuts] -- independent, applied across all features
[Accessibility (a11y)] -- cross-cutting, must be considered in every feature
```

### Dependency Notes

- **WYSIWYG Editor requires Storage Layer:** The editor must persist content; the storage layer must exist before any editing feature works.
- **Split-Pane Layout requires Date Organization + Weekly Logic:** The left/right pane structure depends on daily and weekly note concepts being implemented first.
- **Image Paste requires Blob Storage:** Inline images need a blob store separate from note text content.
- **Calendar requires Date Organization:** Calendar dots query which dates have notes; date-based storage must exist first.
- **Template System enhances Auto-create:** Templates are applied when auto-creating today's note; template CRUD can come after basic auto-creation works.
- **Search enhances everything:** Search is independently valuable but depends on the storage layer having queryable data.
- **Export/Import depends on Storage Layer:** Must be able to read all notes from storage and write imported notes to storage.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the split-pane daily notes concept.

- [ ] WYSIWYG markdown editor in a single pane -- the core writing experience must be excellent
- [ ] Daily note auto-creation with date-based organization -- open the app, today's note exists
- [ ] Auto-save to IndexedDB -- never lose a keystroke
- [ ] Split-pane layout: daily (left), weekly (right) -- the core product differentiator
- [ ] Weekly note with configurable week start (Monday/Sunday) -- completes the daily+weekly pair
- [ ] Mini calendar with navigation and activity dots -- visual date browsing
- [ ] Light/dark mode with system preference detection -- baseline visual expectation
- [ ] Keyboard shortcuts for pane focus, formatting, navigation -- target users demand this
- [ ] Basic permanent notes (at least one per workspace) -- reference area in right pane

### Add After Validation (v1.x)

Features to add once the core daily+weekly loop is validated and users are retained.

- [ ] Full-text search across all notes -- becomes critical as note volume grows (weeks of use)
- [ ] Image paste/embed with blob storage -- triggered when users want to capture screenshots
- [ ] Template system with weekday/weekend defaults -- triggered when users want consistent structure
- [ ] Multiple named permanent notes -- triggered when one permanent note feels limiting
- [ ] Data export as markdown zip -- triggered when users ask "how do I back up my data?"
- [ ] Date references [[YYYY-MM-DD]] with click navigation -- triggered when users reference past days in writing
- [ ] Workspaces -- triggered when users want work/personal separation
- [ ] Accessibility audit and ARIA compliance -- should be progressive from v1 but formal audit post-launch

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Import from markdown files (Obsidian vault migration) -- only valuable once there are users to migrate
- [ ] PWA installability (manifest + service worker) -- nice for "app-like" feel but not essential
- [ ] Drag-to-resize panes -- polish feature, fixed or preset widths work for v1
- [ ] Print/PDF export -- niche need, markdown export covers most cases
- [ ] Custom CSS themes beyond light/dark -- community request, low priority

## Feature Prioritization Matrix

| Feature                        | User Value | Implementation Cost | Priority |
| ------------------------------ | ---------- | ------------------- | -------- |
| WYSIWYG markdown editor        | HIGH       | HIGH                | P1       |
| Auto-save to IndexedDB         | HIGH       | LOW                 | P1       |
| Daily note auto-creation       | HIGH       | LOW                 | P1       |
| Split-pane layout              | HIGH       | HIGH                | P1       |
| Weekly note with week config   | HIGH       | MEDIUM              | P1       |
| Mini calendar + dots           | HIGH       | MEDIUM              | P1       |
| Light/dark mode                | MEDIUM     | LOW                 | P1       |
| Keyboard shortcuts             | HIGH       | LOW                 | P1       |
| Permanent notes (basic)        | MEDIUM     | LOW                 | P1       |
| Full-text search               | HIGH       | MEDIUM              | P2       |
| Image paste/embed              | HIGH       | MEDIUM              | P2       |
| Template system                | MEDIUM     | MEDIUM              | P2       |
| Multiple permanent notes       | MEDIUM     | LOW                 | P2       |
| Export to markdown             | HIGH       | MEDIUM              | P2       |
| Date references [[YYYY-MM-DD]] | MEDIUM     | MEDIUM              | P2       |
| Workspaces                     | MEDIUM     | MEDIUM              | P2       |
| Accessibility (full audit)     | HIGH       | MEDIUM              | P2       |
| Import from markdown           | MEDIUM     | MEDIUM              | P3       |
| PWA installability             | LOW        | LOW                 | P3       |
| Pane resize drag               | LOW        | MEDIUM              | P3       |

**Priority key:**

- P1: Must have for launch -- validates the core concept
- P2: Should have, add in weeks following launch
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature             | Obsidian                     | Bear                 | Apple Notes              | Standard Notes            | Notion                   | Paneful (Our Approach)               |
| ------------------- | ---------------------------- | -------------------- | ------------------------ | ------------------------- | ------------------------ | ------------------------------------ |
| Daily notes         | Plugin (Periodic Notes)      | No built-in          | No                       | No                        | No built-in              | First-class, auto-created            |
| Weekly notes        | Plugin (Periodic Notes)      | No                   | No                       | No                        | Manual pages             | First-class, side-by-side with daily |
| WYSIWYG markdown    | Live Preview mode            | Inline rendering     | Rich text (not markdown) | Markdown with preview     | Block editor             | WYSIWYG inline rendering             |
| Local-first         | Yes (filesystem)             | Yes (Core Data)      | Yes (iCloud local)       | Hybrid (encrypted sync)   | No (cloud-first)         | Yes (IndexedDB, zero server)         |
| Split pane          | Yes (manual arrangement)     | No                   | No                       | No                        | No                       | Built-in, opinionated layout         |
| Calendar navigation | Plugin (Calendar)            | No                   | No                       | No                        | Calendar database view   | Built-in mini calendar               |
| Search              | Excellent                    | Excellent            | Good                     | Good                      | Excellent                | Basic v1, improve over time          |
| Export              | Native (files are markdown)  | Markdown, PDF, HTML  | PDF only                 | Markdown, encrypted       | Markdown, PDF, HTML, CSV | Markdown zip                         |
| Keyboard shortcuts  | Extensive + customizable     | Good                 | Basic                    | Good                      | Extensive                | Comprehensive, non-customizable v1   |
| Templates           | Templater plugin (powerful)  | No                   | No                       | No                        | Built-in                 | Built-in with day-awareness          |
| Zero setup          | No (vault creation required) | Apple account needed | Apple account needed     | Account required for sync | Account required         | Yes -- open tab, start writing       |
| Cross-platform      | Desktop + mobile (Electron)  | Apple only           | Apple only               | All platforms             | All platforms (web)      | Web browser (any platform)           |
| Offline             | Yes                          | Yes                  | Yes                      | Yes (with local copy)     | Limited                  | Yes (fully offline capable)          |
| Cost                | Free (personal), paid sync   | Subscription         | Free                     | Free tier + subscription  | Free tier + subscription | Free (static hosted)                 |

## Sources

- [NoteApps.info: 41 note apps analyzed across 345 features](https://noteapps.info/)
- [Zapier: Best note-taking apps 2026](https://zapier.com/blog/best-note-taking-apps/)
- [Obsidian Daily Notes documentation](https://help.obsidian.md/plugins/daily-notes)
- [Obsidian Periodic Notes plugin (weekly/monthly notes)](https://github.com/liamcain/obsidian-periodic-notes)
- [Standard Notes: End-to-end encrypted notes](https://standardnotes.com)
- [RxDB: LocalStorage vs IndexedDB vs OPFS comparison](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)
- [LogRocket: Offline-first frontend apps in 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [XDA Developers: Over-complicating note workflows](https://www.xda-developers.com/note-app-made-realize-was-overcomplicating-entire-workflow/)
- [Devas.life: Why a simple linear notes app is sufficient](https://www.devas.life/why-a-linear-notes-app-is-sufficient/)
- [SelectHub: Obsidian vs Bear comparison 2026](https://www.selecthub.com/note-taking-software/obsidian-notes-vs-bear-app/)
- [SelectHub: Obsidian vs Apple Notes comparison 2026](https://www.selecthub.com/note-taking-software/obsidian-notes-vs-apple-notes/)

---

_Feature research for: local-first browser-based note-taking (daily/weekly journaling focus)_
_Researched: 2026-03-15_
