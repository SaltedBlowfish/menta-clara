# Phase 1: Foundation and Editor - Research

**Researched:** 2026-03-15
**Domain:** React + TypeScript project scaffolding, WYSIWYG markdown editing, browser storage
**Confidence:** HIGH

## Summary

Phase 1 establishes the project foundation (Vite + React + TypeScript with strict linting) and delivers a working WYSIWYG markdown editor that persists to IndexedDB. The tech stack is well-established: Vite for build tooling, TipTap v3 for rich text editing with its official `@tiptap/markdown` extension for markdown round-tripping, and `idb-keyval` for dead-simple IndexedDB persistence.

The critical insight is that TipTap's StarterKit already bundles all the editing features needed for Phase 1 (bold, italic, headings, lists, code blocks, undo/redo). The `@tiptap/markdown` extension handles serialization to/from markdown. The storage abstraction layer should use a simple interface that wraps `idb-keyval` now but can be swapped for other backends later.

**Primary recommendation:** Scaffold with `npm create vite@latest -- --template react-ts`, add TipTap v3 with StarterKit + Markdown extension, persist serialized markdown to IndexedDB via `idb-keyval` behind a storage abstraction interface.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEVX-01 | React + TypeScript + ESLint + Prettier | Vite react-ts template provides React + TS; eslint-plugin-perfectionist for sorting; Prettier for formatting |
| DEVX-02 | Strictest ESLint: no any, no unknown, no as casting, alphabetized imports/props/keys | typescript-eslint strict + perfectionist plugin covers all requirements |
| DEVX-03 | Max 100 lines/file, no multi-component exports, no default exports | Custom ESLint rules + convention enforcement; named exports only |
| DEVX-04 | Static files deployable on GitHub Pages | Vite builds to dist/ folder; set base path in vite.config.ts |
| DATA-01 | All data stored locally in IndexedDB | idb-keyval wraps IndexedDB; storage abstraction interface for future flexibility |
| DATA-04 | Persistent storage to prevent Safari eviction | navigator.storage.persist() call on app startup |
| EDIT-01 | WYSIWYG markdown rendering (bold, italic, headings, lists, code blocks) | TipTap StarterKit includes all these; @tiptap/markdown for markdown content type |
| EDIT-02 | Undo and redo within a session | TipTap StarterKit includes built-in undo/redo (History extension) |
| EDIT-05 | Auto-save on every change (debounced) | TipTap onUpdate callback + debounce + storage abstraction write |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 6.x | Build tool and dev server | Industry standard for React SPAs; fast HMR, ESM-native |
| react | 19.x | UI framework | Project constraint (non-negotiable) |
| @tiptap/react | 3.20.x | Rich text editor React bindings | Best WYSIWYG editor for React; ProseMirror-based, extensible |
| @tiptap/pm | 3.20.x | ProseMirror peer dependency | Required by TipTap |
| @tiptap/starter-kit | 3.20.x | Bundled common extensions | Includes Bold, Italic, Heading, Lists, CodeBlock, Undo/Redo, etc. |
| @tiptap/markdown | 3.20.x | Markdown parse/serialize | Official bidirectional markdown support; CommonMark-compliant |
| idb-keyval | 6.x | IndexedDB key-value wrapper | 295 bytes brotli'd; promise-based; stores structured-clonable data |
| typescript | 5.x | Type system | Project constraint |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitejs/plugin-react | 4.x | Vite React plugin | Always (included in template) |
| eslint | 9.x | Linting | Flat config format; type-aware rules |
| @typescript-eslint/eslint-plugin | 8.x | TS-specific lint rules | Strict mode: no-explicit-any, no-unsafe-assignment, etc. |
| @typescript-eslint/parser | 8.x | TS parser for ESLint | Required for type-aware linting |
| eslint-plugin-perfectionist | 4.x | Sorting rules | Alphabetize imports, props, object keys |
| eslint-plugin-react | latest | React-specific lint rules | JSX rules, hooks rules |
| eslint-plugin-react-hooks | latest | Hooks lint rules | Enforce rules of hooks |
| prettier | 3.x | Code formatting | Project constraint |
| eslint-config-prettier | latest | Disable ESLint formatting rules | Prevent ESLint/Prettier conflicts |

### Dev/Test
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 2.x | Test runner | Unit and integration tests; uses Vite config |
| @testing-library/react | 16.x | React component testing | Component behavior tests |
| @testing-library/jest-dom | 6.x | DOM assertion matchers | toBeInTheDocument, toHaveTextContent, etc. |
| @testing-library/user-event | 14.x | User interaction simulation | Click, type, keyboard events |
| jsdom | latest | DOM environment for tests | Vitest environment |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TipTap | Lexical (Meta) | Lexical is lower-level; TipTap has better markdown support and extension ecosystem |
| TipTap | Plate | Plate is Slate-based; TipTap (ProseMirror) has stronger markdown round-tripping |
| idb-keyval | Dexie.js | Dexie is full query DB; overkill for Phase 1 key-value needs; consider for Phase 3 if needed |
| idb-keyval | raw IndexedDB | Raw API is callback-hell; idb-keyval is 295 bytes and handles all edge cases |

**Installation:**
```bash
# Scaffold
npm create vite@latest paneful-notes -- --template react-ts
cd paneful-notes

# Core editor
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/markdown

# Storage
npm install idb-keyval

# Linting (dev)
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-perfectionist eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier prettier

# Testing (dev)
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── editor/
│       ├── editor.tsx           # EditorContent wrapper
│       └── use-editor-config.ts # useEditor hook config
├── storage/
│   ├── storage-interface.ts     # StorageAdapter type definition
│   ├── idb-storage.ts           # IndexedDB implementation via idb-keyval
│   └── use-persisted-content.ts # Hook: load/save with debounce
├── app.tsx                      # Root component
└── main.tsx                     # Entry point, persist storage request
```

### Pattern 1: Storage Abstraction Layer
**What:** Define a `StorageAdapter` interface that all storage implementations conform to. This enables swapping IndexedDB for other backends later without touching editor code.
**When to use:** Always -- this is the foundation for DATA-01.
**Example:**
```typescript
// storage-interface.ts
export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string) => Promise<void>;
};
```

```typescript
// idb-storage.ts
import { del, get, set } from 'idb-keyval';
import { StorageAdapter } from './storage-interface';

export const idbStorage: StorageAdapter = {
  getItem: (key: string) => get<string>(key).then((v) => v ?? null),
  removeItem: (key: string) => del(key),
  setItem: (key: string, value: string) => set(key, value),
};
```

### Pattern 2: Debounced Auto-Save via TipTap onUpdate
**What:** TipTap fires `onUpdate` on every editor transaction. Debounce this to avoid excessive writes, then serialize content to markdown and persist via the storage adapter.
**When to use:** EDIT-05 auto-save requirement.
**Example:**
```typescript
// use-persisted-content.ts (concept)
// 1. Load markdown from storage on mount
// 2. Initialize TipTap with content + contentType: 'markdown'
// 3. On onUpdate, debounce 300ms, then:
//    editor.markdown.getMarkdown() -> storage.setItem(key, markdown)
```

### Pattern 3: Persistent Storage Request on Startup
**What:** Call `navigator.storage.persist()` on app initialization to prevent Safari ITP from evicting IndexedDB data after 7 days of inactivity.
**When to use:** Always -- DATA-04 requirement. Call in main.tsx before rendering.
**Example:**
```typescript
// main.tsx
const requestPersistence = async (): Promise<void> => {
  if (navigator.storage?.persist) {
    const granted = await navigator.storage.persist();
    console.info(`Persistent storage: ${granted ? 'granted' : 'denied'}`);
  }
};

void requestPersistence();
```

### Pattern 4: Named Exports Only, Max 100 Lines
**What:** Every file uses named exports (no `export default`). Each file stays under 100 lines of code (excluding blanks and comments). One component per file.
**When to use:** Always -- DEVX-03 requirement.
**Why:** Enforces small, focused modules. Named exports enable better tree-shaking and grep-ability.

### Anti-Patterns to Avoid
- **Storing HTML in IndexedDB:** Store markdown strings, not TipTap's internal JSON or HTML. Markdown is portable and human-readable. Use `editor.markdown.getMarkdown()` and load with `contentType: 'markdown'`.
- **Saving on every keystroke:** Always debounce onUpdate (300ms minimum). IndexedDB writes are async but still costly at keystroke frequency.
- **Coupling editor to storage:** The editor component should not import idb-keyval directly. Use the storage abstraction so future phases can swap backends.
- **Using `export default`:** Project constraint prohibits default exports. Always use `export const` or `export function`.
- **Using `any` or `as` casting:** Use proper type narrowing, generics, or `satisfies` operator instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editing | Custom contentEditable | TipTap + StarterKit | ContentEditable is a nightmare of browser inconsistencies |
| Markdown parsing/serialization | Custom markdown-to-HTML converter | @tiptap/markdown | Round-trip fidelity is deceptively hard; official extension handles edge cases |
| IndexedDB access | Raw IndexedDB API | idb-keyval | Raw API uses request/transaction callbacks; error-prone |
| Undo/Redo | Custom history stack | TipTap StarterKit (built-in) | ProseMirror's history is battle-tested with proper operation transforms |
| Import sorting | Manual sorting discipline | eslint-plugin-perfectionist | Humans will not maintain alphabetical order consistently |
| Debouncing | Custom setTimeout wrapper | A simple debounce utility (or lodash.debounce) | Edge cases around leading/trailing invocations |

**Key insight:** TipTap + StarterKit provides undo/redo, all formatting marks, and keyboard shortcuts out of the box. The `@tiptap/markdown` extension handles all serialization. Almost zero custom editor code is needed for Phase 1.

## Common Pitfalls

### Pitfall 1: TipTap Content Hydration Mismatch
**What goes wrong:** Setting initial content as HTML when editor expects markdown (or vice versa) causes rendering errors or lost formatting.
**Why it happens:** TipTap defaults to HTML content type. Markdown content must be explicitly loaded with `contentType: 'markdown'`.
**How to avoid:** Always pass `contentType: 'markdown'` when setting content from storage. Always serialize with `editor.markdown.getMarkdown()`.
**Warning signs:** Content renders as raw markdown text instead of formatted output.

### Pitfall 2: Safari ITP Data Eviction
**What goes wrong:** Users on Safari lose all their notes after 7 days of not visiting the app.
**Why it happens:** Safari's Intelligent Tracking Prevention deletes IndexedDB data for origins without recent user interaction, unless persistent storage is granted.
**How to avoid:** Call `navigator.storage.persist()` on app startup. This MUST be in Phase 1, not deferred.
**Warning signs:** QA reports of "data disappeared" specifically on Safari.

### Pitfall 3: ESLint Flat Config Confusion
**What goes wrong:** Mixing old `.eslintrc` format with new flat config `eslint.config.js` causes rules to silently not apply.
**Why it happens:** ESLint 9 uses flat config by default. Vite template generates `eslint.config.js`. Some guides still show old format.
**How to avoid:** Use ONLY `eslint.config.js` (flat config). All plugins must be imported as ESM modules.
**Warning signs:** ESLint reports no errors when it should (rules not loading).

### Pitfall 4: TipTap useEditor Returns Null Initially
**What goes wrong:** Accessing `editor.` methods before editor is initialized causes runtime errors.
**Why it happens:** `useEditor()` returns `null` on first render while ProseMirror initializes.
**How to avoid:** Always guard with `if (!editor) return null` or optional chaining. Never assume editor is defined.
**Warning signs:** "Cannot read property of null" errors on component mount.

### Pitfall 5: 100-Line File Limit With Strict Lint Config
**What goes wrong:** ESLint config file itself or complex components exceed 100 lines, requiring awkward splits.
**Why it happens:** DEVX-03 requires max 100 lines per file (excluding blanks and comments).
**How to avoid:** Plan file decomposition from the start. ESLint config can be split into multiple files that are imported. Components should be small by design.
**Warning signs:** Files hitting 80+ lines during development.

## Code Examples

### TipTap Editor With Markdown + StarterKit
```typescript
// Source: TipTap official docs (tiptap.dev)
import { EditorContent, useEditor } from '@tiptap/react';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';

export function Editor({ content, onUpdate }: EditorProps) {
  const editor = useEditor({
    content,
    contentType: 'markdown',
    extensions: [
      Markdown.configure({
        markedOptions: { breaks: true, gfm: true },
      }),
      StarterKit,
    ],
    onUpdate: ({ editor: e }) => {
      onUpdate(e.markdown.getMarkdown());
    },
  });

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
```

### Storage Adapter Implementation
```typescript
// Source: idb-keyval GitHub (github.com/jakearchibald/idb-keyval)
import { del, get, set } from 'idb-keyval';

import { StorageAdapter } from './storage-interface';

export const idbStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const value = await get<string>(key);
    return value ?? null;
  },
  removeItem: async (key: string): Promise<void> => {
    await del(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await set(key, value);
  },
};
```

### Debounced Auto-Save Hook Pattern
```typescript
// Concept pattern for auto-save
import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedSave(
  save: (content: string) => Promise<void>,
  delayMs: number,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback(
    (content: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        void save(content);
      }, delayMs);
    },
    [delayMs, save],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSave;
}
```

### ESLint Flat Config (Strict)
```typescript
// eslint.config.js (flat config format)
import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: {
      perfectionist,
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-jsx-props': 'error',
      'perfectionist/sort-object-types': 'error',
      'perfectionist/sort-objects': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tiptap-markdown (community) | @tiptap/markdown (official) | TipTap 3.7.0 (2024) | Official package is maintained; community package deprecated |
| .eslintrc.json | eslint.config.js (flat config) | ESLint 9.0 (2024) | Must use flat config; old format not supported by default |
| Webpack/CRA | Vite | 2022-2024 | Vite is the standard React build tool; CRA is deprecated |
| React 18 | React 19 | Dec 2024 | TipTap 3.x supports React 19; use latest |

**Deprecated/outdated:**
- `tiptap-markdown` (community package): Maintainer confirmed it is no longer actively maintained; use `@tiptap/markdown` instead
- Create React App (CRA): Officially deprecated; Vite is the recommended alternative
- `.eslintrc.*` config format: ESLint 9+ uses flat config by default

## Open Questions

1. **@tiptap/markdown round-trip fidelity**
   - What we know: Official extension is CommonMark-compliant and bidirectional
   - What's unclear: Edge cases with complex nested lists, code blocks within lists, or unusual markdown patterns
   - Recommendation: Write a quick smoke test during implementation that round-trips common markdown patterns and verifies output. STATE.md flags this as MEDIUM confidence -- test early.

2. **TipTap v3 + React 19 compatibility**
   - What we know: TipTap 3.20.x is the latest; docs mention React 19 support "being developed" for UI Components
   - What's unclear: Whether core @tiptap/react (not UI Components) has any React 19 issues
   - Recommendation: Core @tiptap/react should work fine since it's the base binding. UI Components (not used in Phase 1) may have issues. Monitor but don't block.

3. **`no-unknown` ESLint rule**
   - What we know: DEVX-02 says "no unknown." @typescript-eslint has `no-unsafe-assignment` and related rules that flag `unknown` usage in unsafe contexts
   - What's unclear: Whether the intent is to ban the `unknown` type entirely or just unsafe usage of it
   - Recommendation: Use `@typescript-eslint/no-unsafe-*` family of rules which prevent unsafe usage of `unknown` values. Banning `unknown` entirely would be counterproductive since it's the safe alternative to `any`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + @testing-library/react 16.x |
| Config file | vitest config embedded in vite.config.ts (see Wave 0) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements - Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEVX-01 | Project builds without errors | smoke | `npx tsc --noEmit && npx vite build` | N/A (build command) |
| DEVX-02 | Zero lint warnings | smoke | `npx eslint src/` | N/A (lint command) |
| DEVX-03 | Files under 100 lines, named exports only | lint | Custom ESLint rule or build script | Wave 0 |
| DEVX-04 | Static build output | smoke | `npx vite build && ls dist/index.html` | N/A (build command) |
| DATA-01 | Storage adapter reads/writes IndexedDB | unit | `npx vitest run src/storage/` | Wave 0 |
| DATA-04 | Persistent storage requested | unit | `npx vitest run src/storage/` | Wave 0 |
| EDIT-01 | Editor renders markdown formatting | integration | `npx vitest run src/components/editor/` | Wave 0 |
| EDIT-02 | Undo/redo works | integration | `npx vitest run src/components/editor/` | Wave 0 |
| EDIT-05 | Auto-save fires on content change | integration | `npx vitest run src/components/editor/` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run && npx eslint src/ && npx tsc --noEmit`
- **Phase gate:** Full suite green + `npx vite build` succeeds with zero warnings

### Wave 0 Gaps
- [ ] `vite.config.ts` -- add vitest test configuration (globals, jsdom, setup file)
- [ ] `vitest.setup.ts` -- import @testing-library/jest-dom matchers
- [ ] `tsconfig.json` -- add vitest/globals and @testing-library/jest-dom types
- [ ] `src/storage/__tests__/idb-storage.test.ts` -- covers DATA-01, DATA-04
- [ ] `src/components/editor/__tests__/editor.test.tsx` -- covers EDIT-01, EDIT-02, EDIT-05
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

## Sources

### Primary (HIGH confidence)
- [TipTap official docs - React installation](https://tiptap.dev/docs/editor/getting-started/install/react)
- [TipTap official docs - Markdown extension](https://tiptap.dev/docs/editor/markdown/getting-started/installation)
- [TipTap StarterKit docs](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
- [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval) - API, size, capabilities
- [Vite official docs - Getting Started](https://vite.dev/guide/)
- [Vite official docs - Static Deploy / GitHub Pages](https://vite.dev/guide/static-deploy)
- [WebKit blog - Storage Policy Updates](https://webkit.org/blog/14403/updates-to-storage-policy/) - Safari ITP behavior
- [MDN - Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [eslint-plugin-perfectionist](https://perfectionist.dev/) - sorting rules documentation

### Secondary (MEDIUM confidence)
- [TipTap Markdown release blog post](https://tiptap.dev/blog/release-notes/introducing-bidirectional-markdown-support-in-tiptap) - @tiptap/markdown announcement
- [npm @tiptap/react](https://www.npmjs.com/package/@tiptap/react) - version 3.20.1 confirmed
- [tiptap-markdown GitHub](https://github.com/aguingand/tiptap-markdown) - maintainer deprecation notice

### Tertiary (LOW confidence)
- TipTap + React 19 compatibility claim -- docs say "being developed" for UI Components; core bindings assumed compatible but unverified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are well-established, version-pinned, and documented
- Architecture: HIGH - Patterns are standard React + TipTap usage from official docs
- Pitfalls: HIGH - Safari ITP, flat config, null editor are well-documented issues
- Markdown round-trip: MEDIUM - Official extension is new; edge cases possible

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable ecosystem, 30-day window)
