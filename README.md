# Menta Clara

A calm, private space for daily and weekly notes. Everything stays in your
browser — no server, no account, no tracking.

Live app: [mentaclara.com](https://mentaclara.com)

## Why it exists

Most note apps want an account, a subscription, and your data on their servers.
Menta Clara is the opposite: open the tab, start typing. Your notes live in
your browser's IndexedDB and nowhere else. If you want a copy, export a zip.
If you want to walk away, close the tab — nothing follows you.

## Features

- **Daily notes** on the left, **weekly notes** on the right, with a mini
  calendar for navigation.
- **WYSIWYG markdown** editor (TipTap) — renders as you type.
- **Carry-over prompt** — offers to copy yesterday's daily note or last week's
  weekly note into today's blank page.
- **Date references** — type `[[2026-04-24]]` to link to that day's note.
- **Paste images inline** — stored as blobs in IndexedDB.
- **Multiple permanent notes** per workspace for persistent docs.
- **Workspaces** — separate buckets of notes.
- **Import / export** as a zip of markdown + images.
- **Light / dark theme** following system preference.
- **Keyboard-first** — shortcuts for pane focus, date navigation, and common
  formatting.

## Running locally

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Other scripts:

```bash
pnpm build      # type-check + production build to dist/
pnpm preview    # serve the production build
pnpm test       # vitest
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint
pnpm format     # prettier --write
```

## Tech stack

- React 19 + TypeScript (strict)
- Vite for bundling, Vitest for tests
- TipTap 3 (ProseMirror) for the editor
- IndexedDB (via `idb`) for local storage
- `fflate` for zip-based import/export
- Deployed as static files to GitHub Pages

## Project layout

```
src/
  app/          shell, top-level layout, active-note context
  calendar/     mini-month calendar with note dots
  command-palette/   cmd-K command palette
  daily/        daily note pane + hook
  editor/       TipTap setup, toolbar, extensions
  export/       zip import/export + markdown ↔ tiptap conversion
  image/        image blob store
  layout/       split pane + mobile layout
  onboarding/   about dialog + sample data loader
  permanent/    permanent notes browser + editor
  search/       full-text search
  shared/       small reusable hooks and components
  storage/      IndexedDB database + cache + note hook
  template/     save/load note templates
  theme/        light/dark toggle + CSS tokens
  weekly/       weekly note section + hook
  workspace/    workspace switcher + context
```

## Code style

The ESLint config is intentionally strict:

- No `any`, no `unknown`, no `as` type assertions
- No default exports
- 100-line file budget (a couple of shell files are grandfathered)
- Alphabetized imports, JSX props, and object keys
- **`useEffect` is banned** — use `useSyncExternalStore` for data, render-time
  ref checks for derived state, event handlers for side effects

## Contributing

Issues and PRs are welcome. Before opening a PR:

```bash
pnpm typecheck && pnpm test && pnpm build
```

If you're adding a feature, keep the privacy stance intact: no network
requests after the initial page load, no third-party analytics, no accounts.

## License

[MIT](LICENSE) © Anthony Palazzetti
