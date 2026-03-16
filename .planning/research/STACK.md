# Technology Stack

**Project:** Paneful Notes
**Researched:** 2026-03-15

## Recommended Stack

### Build Tooling

| Technology           | Version           | Purpose                 | Why                                                                                                                                                                                                                     | Confidence |
| -------------------- | ----------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Vite                 | ^7.3.x            | Build tool / dev server | Vite 8 dropped 3 days ago (March 12, 2026) with a major Rolldown migration -- too fresh for a greenfield project. Vite 7.3 is battle-tested, stable, and fast. Upgrade to 8 once the ecosystem stabilizes (1-2 months). | HIGH       |
| @vitejs/plugin-react | latest for Vite 7 | React Fast Refresh      | Official Vite React plugin. SWC-based for fast transforms.                                                                                                                                                              | HIGH       |
| TypeScript           | ^5.7.x            | Strict type safety      | Non-negotiable per project constraints. Use `strict: true` plus additional strict flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).                                                                     | HIGH       |

### Core Framework

| Technology | Version | Purpose       | Why                                                                                                   | Confidence |
| ---------- | ------- | ------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| React      | ^19.2.x | UI framework  | Non-negotiable per project constraints. 19.2 is stable (released Oct 2025, patched through Jan 2026). | HIGH       |
| React DOM  | ^19.2.x | DOM rendering | Matches React version.                                                                                | HIGH       |

### WYSIWYG Markdown Editor

| Technology                    | Version | Purpose                          | Why                                                                                                                                                                                                                                                                                                        | Confidence |
| ----------------------------- | ------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| @tiptap/react                 | ^3.20.x | Editor framework (React binding) | Headless, highly customizable, ProseMirror-based. Best fit for "WYSIWYG-style markdown that renders as you type" -- the project needs markdown as the storage format, not JSON blocks. Tiptap gives full control over the editing experience while staying headless (matches "radical simplicity" design). | HIGH       |
| @tiptap/starter-kit           | ^3.20.x | Core editor extensions bundle    | Provides paragraph, heading, bold, italic, code, blockquote, lists, etc. out of the box.                                                                                                                                                                                                                   | HIGH       |
| @tiptap/pm                    | ^3.20.x | ProseMirror peer dependency      | Required by Tiptap. Provides the underlying document model.                                                                                                                                                                                                                                                | HIGH       |
| @tiptap/markdown              | ^3.20.x | Bidirectional markdown support   | Official extension (released in 3.7.0). Parses markdown to Tiptap JSON and serializes back to markdown. CommonMark-compliant. The community `tiptap-markdown` package is abandoned -- use the official one.                                                                                                | MEDIUM     |
| @tiptap/extension-image       | ^3.20.x | Inline image support             | Needed for paste-image-inline feature.                                                                                                                                                                                                                                                                     | HIGH       |
| @tiptap/extension-placeholder | ^3.20.x | Placeholder text                 | Better empty-state UX for notes.                                                                                                                                                                                                                                                                           | HIGH       |
| @tiptap/extension-link        | ^3.20.x | Link handling                    | Needed for `[[YYYY-MM-DD]]` date references rendered as clickable links.                                                                                                                                                                                                                                   | HIGH       |

**Why Tiptap over BlockNote:** BlockNote's markdown conversion is explicitly lossy (`blocksToMarkdownLossy()`). The project requirement is "all data stored as markdown" and "export as markdown files" -- lossy round-tripping would corrupt user content. Tiptap's official `@tiptap/markdown` extension provides bidirectional, CommonMark-compliant markdown parsing/serialization designed for lossless round-tripping.

**Why Tiptap over Milkdown:** Milkdown's React integration is bare-bones and requires manual UI component construction. Tiptap has first-class React support via `@tiptap/react` with hooks (`useEditor`) and components (`EditorContent`). For a team of one, Tiptap's ecosystem and documentation are significantly more productive.

**Note on @tiptap/markdown:** The official markdown extension is relatively new (shipped in Tiptap 3.7.0) and the docs note it is an "early release." Test markdown round-tripping thoroughly, especially for edge cases like nested lists, inline images, and code blocks. This is the biggest technical risk in the stack.

### Local Storage

| Technology | Version | Purpose           | Why                                                                                                                                                                                                                                                                                           | Confidence |
| ---------- | ------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Dexie.js   | ^4.3.x  | IndexedDB wrapper | Best-in-class IndexedDB abstraction. Native TypeScript types (no `@types` needed). Schema versioning with migrations built in. Reactive queries via `liveQuery()`. Used by 100K+ sites. Structured querying (notes by date, workspace filtering) maps naturally to Dexie's table/index model. | HIGH       |

**Why Dexie over raw IndexedDB:** Raw IndexedDB API is notoriously painful -- verbose, callback-heavy, poor error handling. Dexie wraps it with a clean Promise-based API, typed schemas, and automatic versioned migrations. Zero reason to go raw.

**Why Dexie over idb-keyval:** idb-keyval is a simple key-value store (~600B). Paneful Notes needs structured data with indexes (query notes by date, filter by workspace, list permanent notes). Dexie's table model with compound indexes is the right abstraction.

**Why IndexedDB over OPFS:** OPFS has no Firefox support (critical gap for a browser-based app). IndexedDB is universally supported across all modern browsers. OPFS is better for large binary files, but note content is small text. For inline image blobs, IndexedDB handles blobs natively and Dexie supports them.

### Date Handling

| Technology | Version | Purpose                          | Why                                                                                                                                                                                                                                                                                                                                      | Confidence |
| ---------- | ------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| date-fns   | ^4.x    | Date manipulation and formatting | Tree-shakeable (only import what you use), functional API (no mutable wrappers), excellent TypeScript types. The app is date-heavy (daily notes, weekly cycles, calendar, date references). date-fns's functional approach fits React's immutability patterns. ~18KB gzipped full, but tree-shaking drops it to 2-5KB for typical usage. | HIGH       |

**Why date-fns over dayjs:** dayjs uses a mutable wrapper object pattern (Moment-style). date-fns operates on native Date objects with pure functions -- better fit for strict TypeScript and React's functional patterns. Tree-shaking is more effective with date-fns's individual function exports.

### Styling

| Technology            | Version           | Purpose                   | Why                                                                                                                                                                                                                                                                                                                                        | Confidence |
| --------------------- | ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| CSS Modules           | (built into Vite) | Scoped component styles   | Zero additional dependencies. Built into Vite out of the box. Scoped by default (no class name collisions). Keeps styles in `.module.css` files alongside components. Fits "radical simplicity" -- no utility class framework to learn, no runtime overhead, just CSS. Works with the 100-line file limit (styles live in separate files). | HIGH       |
| CSS custom properties | (native)          | Theming (light/dark mode) | Use CSS custom properties (variables) for the light/dark theme system. Toggle a `data-theme` attribute on `<html>` and let CSS do the work. No theming library needed.                                                                                                                                                                     | HIGH       |

**Why CSS Modules over Tailwind:** The project values radical simplicity and minimal dependencies. Tailwind adds a build dependency, a config file, and a learning curve for its utility class vocabulary. CSS Modules are native to Vite, produce clean class names, and keep styling concerns in dedicated files. For a single-developer project with a minimal UI (makingsoftware.com aesthetic), CSS Modules are the simpler choice.

**Why CSS Modules over CSS-in-JS:** No runtime overhead. No additional library. Better performance. The project has no dynamic styling needs complex enough to justify styled-components or Emotion.

### Split Pane Layout

| Technology                     | Version | Purpose                     | Why                                                                                                                                                                                                                                                                                                                                                                                                                                   | Confidence |
| ------------------------------ | ------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Custom CSS Grid implementation | n/a     | Resizable split-pane layout | The split-pane layout is the core UI of this app and should not depend on a third-party library. Use CSS Grid with a draggable resize handle. This is ~50-80 lines of code (a custom hook + a thin component). Libraries like Allotment and react-resplit add unnecessary abstraction for a two-pane layout. Building it gives full control over keyboard shortcuts (`CMD+[`, `CMD+]`), accessibility, and the exact resize behavior. | MEDIUM     |

**Why custom over Allotment/react-resplit:** Allotment is VS Code-derived and heavyweight for a two-pane layout. react-resplit is lighter but still an extra dependency for something achievable with CSS Grid + a resize handler. The project's 100-line file limit and "radical simplicity" philosophy favor owning this small piece of UI. If the custom implementation proves too complex (unlikely for two panes), Allotment is the fallback.

### Code Quality

| Technology                  | Version | Purpose                    | Why                                                                                                                       | Confidence |
| --------------------------- | ------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------- |
| ESLint                      | ^9.x    | Linting                    | Flat config format (stabilized in 2025). Use `eslint.config.ts` for type-safe configuration.                              | HIGH       |
| typescript-eslint           | ^8.x    | TypeScript linting         | Use `strictTypeChecked` + `stylisticTypeChecked` configs for maximum strictness. Enforces no `any`, no unsafe operations. | HIGH       |
| eslint-plugin-react-hooks   | latest  | React hooks rules          | Enforces rules of hooks and exhaustive deps.                                                                              | HIGH       |
| eslint-plugin-react-refresh | latest  | Fast refresh compatibility | Ensures components are compatible with React Fast Refresh.                                                                | HIGH       |
| Prettier                    | ^3.x    | Code formatting            | Non-negotiable per project constraints. Handles formatting so ESLint focuses on logic.                                    | HIGH       |
| eslint-config-prettier      | latest  | Disable conflicting rules  | Turns off ESLint rules that conflict with Prettier.                                                                       | HIGH       |

### Testing

| Technology                  | Version | Purpose                     | Why                                                                                                                                                                                           | Confidence |
| --------------------------- | ------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Vitest                      | ^4.1.x  | Unit / integration testing  | Native Vite integration (shared config, same transform pipeline). Fastest test runner for Vite projects. Jest-compatible API. State of JS 2024 showed Vitest overtaking Jest in satisfaction. | HIGH       |
| @testing-library/react      | ^16.x   | Component testing           | Standard React testing library. Tests behavior, not implementation.                                                                                                                           | HIGH       |
| @testing-library/user-event | ^14.x   | User interaction simulation | More realistic event simulation than fireEvent.                                                                                                                                               | HIGH       |
| jsdom                       | latest  | DOM environment             | Lightweight browser environment for Vitest. Sufficient for this app (no need for real browser testing).                                                                                       | HIGH       |

### Supporting Libraries

| Library    | Version | Purpose                         | When to Use                                                | Confidence |
| ---------- | ------- | ------------------------------- | ---------------------------------------------------------- | ---------- |
| uuid       | ^11.x   | Unique IDs for notes/workspaces | Generating stable, unique identifiers for database records | HIGH       |
| file-saver | ^2.x    | File download (export)          | Triggering markdown file downloads for the export feature  | MEDIUM     |

## Alternatives Considered

| Category   | Recommended     | Alternative       | Why Not                                                                 |
| ---------- | --------------- | ----------------- | ----------------------------------------------------------------------- |
| Editor     | Tiptap          | BlockNote         | Lossy markdown conversion -- unacceptable for markdown-first storage    |
| Editor     | Tiptap          | Milkdown          | Bare-bones React integration, steeper learning curve                    |
| Editor     | Tiptap          | Slate.js          | Lower-level than Tiptap, more boilerplate, smaller extension ecosystem  |
| Storage    | Dexie.js        | idb-keyval        | Too simple -- no structured queries, no schema migrations               |
| Storage    | Dexie.js        | RxDB              | Overkill for single-user local-only app, adds sync complexity           |
| Storage    | IndexedDB       | OPFS              | No Firefox support, not needed for text-heavy content                   |
| Build      | Vite 7          | Vite 8            | Too fresh (3 days old), major Rolldown architecture change              |
| Build      | Vite            | Next.js           | SSR/SSG unnecessary for static client-only app                          |
| Build      | Vite            | Create React App  | Deprecated, unmaintained                                                |
| Styling    | CSS Modules     | Tailwind CSS      | Extra dependency, utility classes add cognitive overhead for minimal UI |
| Styling    | CSS Modules     | styled-components | Runtime overhead, unnecessary for this use case                         |
| Dates      | date-fns        | dayjs             | Mutable wrappers, less tree-shakeable, worse TypeScript ergonomics      |
| Dates      | date-fns        | Temporal API      | Not yet stable across all browsers                                      |
| Split pane | Custom CSS Grid | Allotment         | Heavyweight for two-pane layout                                         |
| Testing    | Vitest          | Jest              | Slower, requires separate Babel/TS config, no native Vite integration   |

## Installation

```bash
# Initialize project
npm create vite@latest paneful-notes -- --template react-ts

# Core editor
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/markdown @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-link

# Storage
npm install dexie

# Dates
npm install date-fns

# Utilities
npm install uuid file-saver

# Dev dependencies - Code quality
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-config-prettier prettier

# Dev dependencies - Testing
npm install -D vitest @testing-library/react @testing-library/user-event jsdom @testing-library/jest-dom

# Dev dependencies - Types
npm install -D @types/uuid @types/file-saver
```

## TypeScript Configuration

```jsonc
// tsconfig.json - key strict settings
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
  },
}
```

## Key Technical Risks

1. **@tiptap/markdown maturity (MEDIUM risk):** The official markdown extension is relatively new. Round-tripping edge cases (nested lists, inline images, code blocks with language tags) need thorough testing. Mitigation: write integration tests for every markdown feature from day one.

2. **Inline image blob storage (LOW risk):** Storing image blobs in IndexedDB via Dexie is well-supported, but large numbers of images could bloat the database. Mitigation: compress images on paste, set reasonable size limits.

3. **Vite 7 end-of-life timing (LOW risk):** Vite 7.3 gets "important fixes and security patches" but Vite 8 is the active line. Plan to upgrade to Vite 8 within 2-3 months once the ecosystem settles.

## Sources

- [Tiptap Official Docs - React Installation](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Tiptap Markdown Extension Docs](https://tiptap.dev/docs/editor/markdown)
- [Tiptap Markdown Release Announcement](https://tiptap.dev/blog/release-notes/introducing-bidirectional-markdown-support-in-tiptap)
- [BlockNote Markdown - Lossy Conversion](https://www.blocknotejs.org/docs/features/export/markdown)
- [Dexie.js Official Site](https://dexie.org)
- [Dexie npm - v4.3.0](https://www.npmjs.com/package/dexie)
- [Vite Releases](https://vite.dev/releases)
- [Vite 8 Announcement](https://vite.dev/blog/announcing-vite8)
- [React 19.2 Announcement](https://react.dev/blog/2025/10/01/react-19-2)
- [Vitest Official](https://vitest.dev/)
- [typescript-eslint Configs](https://typescript-eslint.io/users/configs/)
- [Liveblocks Rich Text Editor Comparison 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)
- [RxDB Storage Comparison (IndexedDB vs OPFS)](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)
- [date-fns Official](https://date-fns.org/)
