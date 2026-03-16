# Architecture Patterns

**Domain:** Local-first browser-based note-taking app
**Researched:** 2026-03-15

## Recommended Architecture

A layered architecture with strict unidirectional data flow: React UI components read from a storage abstraction layer backed by IndexedDB via Dexie.js. The editor is a Tiptap instance embedded in each pane. No server, no service worker needed for v1.

```
+------------------------------------------------------------------+
|                        App Shell                                  |
|  +---------------------------+  +------------------------------+  |
|  |      Left Pane            |  |       Right Pane             |  |
|  |  +---------------------+  |  |  +-----------+ +---------+  |  |
|  |  | Daily Note Editor   |  |  |  | Weekly    | | Perm    |  |  |
|  |  | (Tiptap instance)   |  |  |  | Editor    | | Notes   |  |  |
|  |  +---------------------+  |  |  | (Tiptap)  | | (Tiptap)|  |  |
|  +---------------------------+  |  +-----------+ +---------+  |  |
|                                  |  +------------------------+  |  |
|                                  |  | Mini Calendar           |  |  |
|                                  |  +------------------------+  |  |
|  +---------------------------+  +------------------------------+  |
|  |   Keyboard Shortcut Manager (global event listener)         |  |
+------------------------------------------------------------------+
|                    State Layer (React Context / Zustand)          |
|   - activeWorkspace, activeDate, activePermanentNote, theme      |
+------------------------------------------------------------------+
|                    Storage Abstraction Layer                      |
|   - NoteStore, WorkspaceStore, TemplateStore, ImageStore         |
+------------------------------------------------------------------+
|                    Dexie.js (IndexedDB wrapper)                  |
|   Tables: notes, workspaces, templates, images                   |
+------------------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **App Shell** | Layout orchestration, theme provider, workspace context | State Layer, Left Pane, Right Pane |
| **Left Pane** | Houses daily note editor, date-aware | State Layer (reads activeDate), Storage Layer (reads/writes daily note) |
| **Right Pane** | Houses weekly editor, permanent notes list, mini calendar | State Layer (reads activeDate, activeWorkspace), Storage Layer |
| **Tiptap Editor** | Rich text editing with markdown serialization | Storage Layer (save on change), Image Store (paste handler) |
| **Mini Calendar** | Month view, day navigation, note-existence dots | State Layer (sets activeDate), Storage Layer (queries note existence) |
| **Keyboard Shortcut Manager** | Global hotkey routing | All panes (focus switching), State Layer (triggers actions) |
| **Storage Abstraction** | CRUD operations on notes, workspaces, templates, images | Dexie.js (IndexedDB) |
| **State Layer** | App-wide reactive state (current date, workspace, theme) | All UI components (subscribers) |

### Data Flow

**Writing a note (primary flow):**
1. User types in Tiptap editor (Left Pane, daily note)
2. Tiptap fires `onUpdate` callback with editor content
3. Debounced save (300-500ms) serializes content to markdown string
4. Storage Abstraction writes to `notes` table via Dexie: `{ workspaceId, date, type: 'daily', content: markdownString }`
5. No state layer involvement -- save is fire-and-forget from editor to storage

**Loading a note (navigation flow):**
1. User clicks a date in Mini Calendar (or app opens to today)
2. State Layer updates `activeDate`
3. Left Pane reacts to `activeDate` change, calls Storage Abstraction: `getNoteByDate(workspaceId, date, 'daily')`
4. If no note exists, Storage Abstraction loads the applicable template and creates a new note from it
5. Tiptap editor receives content as markdown, converts to ProseMirror doc via Tiptap's markdown extension

**Image paste flow:**
1. User pastes image in Tiptap editor
2. Custom Tiptap extension intercepts paste event, extracts image blob
3. Image Store saves blob to `images` table, returns a `blob://` or object URL reference
4. Extension inserts image node into editor doc with the local URL reference
5. On note load, image references resolve from Image Store

**Date reference flow (`[[YYYY-MM-DD]]`):**
1. User types `[[2026-03-10]]` in editor
2. Custom Tiptap `InputRule` detects the pattern on close bracket
3. Replaces text with a custom inline node (`DateReference`) that renders as a clickable link
4. Click handler updates `activeDate` in State Layer, navigating to that day's note

**Export flow:**
1. User triggers export action
2. Storage Abstraction queries all notes for current workspace
3. Each note's markdown content is written to a file: `daily/YYYY-MM-DD.md`, `weekly/YYYY-WNN.md`, `permanent/name.md`
4. Files bundled as ZIP via `JSZip` or File System Access API, downloaded to user's device

## Patterns to Follow

### Pattern 1: Storage Abstraction Layer (Repository Pattern)
**What:** All IndexedDB access goes through typed repository objects. No component directly calls Dexie.
**When:** Every data operation.
**Why:** Decouples UI from storage engine. Enables future migration (IndexedDB to OPFS, etc.) without touching components.
**Example:**
```typescript
// storage/noteStore.ts
interface NoteRecord {
  readonly date: string;
  readonly content: string;
  readonly id?: number;
  readonly type: 'daily' | 'permanent' | 'weekly';
  readonly workspaceId: string;
}

const getNote = async (
  workspaceId: string,
  date: string,
  type: NoteRecord['type'],
): Promise<NoteRecord | undefined> => {
  return db.notes
    .where({ date, type, workspaceId })
    .first();
};
```

### Pattern 2: One Tiptap Instance Per Pane (Not Shared)
**What:** Each editor pane gets its own Tiptap `useEditor` hook instance. Do not try to share one editor across panes.
**When:** Rendering any editable content area.
**Why:** ProseMirror (underneath Tiptap) manages its own DOM node. Moving or sharing instances causes state corruption and cursor loss. Multiple editors on one page is explicitly supported by Tiptap.

### Pattern 3: Debounced Auto-Save
**What:** Save editor content to IndexedDB on a debounced timer (300-500ms after last keystroke), not on every keystroke.
**When:** Every `onUpdate` from Tiptap.
**Why:** IndexedDB writes are async and non-trivial. Saving per keystroke causes jank. Debouncing gives near-instant perceived saves without performance cost.

### Pattern 4: Workspace Isolation via Compound Keys
**What:** Every record in every table includes `workspaceId` as part of a compound index.
**When:** All queries.
**Why:** Guarantees workspace isolation without separate databases. Dexie compound indexes make this efficient.
```typescript
// db.ts schema
db.version(1).stores({
  images: '++id, [workspaceId+noteId]',
  notes: '++id, [workspaceId+date+type], [workspaceId+type]',
  templates: '++id, [workspaceId+name]',
  workspaces: '++id, name',
});
```

### Pattern 5: Template-Driven Note Creation
**What:** When a note does not exist for a given date, auto-create it from the appropriate template (weekday vs weekend for daily, or weekly template).
**When:** Note load, if note is missing.
**Why:** Core UX requirement. Creates the "open tab and start writing" experience.

### Pattern 6: Custom Tiptap Extensions for Domain Logic
**What:** Build `DateReference` as a custom Tiptap inline node extension. Build `ImagePaste` as a custom Tiptap extension.
**When:** Implementing `[[YYYY-MM-DD]]` links and image paste.
**Why:** Tiptap's extension system is designed for exactly this. Custom nodes render as React components via `ReactNodeViewRenderer`, giving full control over presentation and behavior.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using localStorage for note content
**What:** Storing markdown content in localStorage.
**Why bad:** localStorage has a 5-10MB limit, is synchronous (blocks main thread), and cannot store blobs. A single workspace with images will exceed this quickly.
**Instead:** Use IndexedDB via Dexie.js. It supports structured data, blobs, and hundreds of MB to GB of storage.

### Anti-Pattern 2: Global State for Note Content
**What:** Putting note markdown content into React global state (Context, Redux, Zustand).
**Why bad:** Note content can be large. Putting it in global state means every state subscriber re-renders on every keystroke. Editor content should live in Tiptap's internal ProseMirror state, not React state.
**Instead:** Only put lightweight coordination state in the state layer (activeDate, workspaceId, theme). Let Tiptap own content. Persist directly from Tiptap to storage.

### Anti-Pattern 3: Base64 Encoding Images
**What:** Converting pasted images to base64 and embedding them inline in the markdown.
**Why bad:** Bloats note content 33% per image. Makes notes slow to load and save. Breaks if images are large.
**Instead:** Store images as blobs in a separate IndexedDB table. Reference them by ID in the note content. Resolve to object URLs at render time.

### Anti-Pattern 4: Single Mega-Component Editor
**What:** Building one "Editor" component that handles daily, weekly, and permanent notes with conditional logic.
**Why bad:** Violates the 100-line file constraint. Creates coupling between unrelated note types. Makes keyboard focus management harder.
**Instead:** Compose from small pieces: a generic `NoteEditor` component that takes a note ID/key, and separate pane containers that wire it to the right data.

### Anti-Pattern 5: Syncing Editor State Between Panes via React
**What:** Using React state or context to pass editor content between the left and right panes.
**Why bad:** Editor content is ProseMirror documents, not plain strings. Converting back and forth on every change is expensive and lossy (cursor position, selection, undo history).
**Instead:** Each pane manages its own editor. Shared state is only coordination data (which date, which workspace). If panes need to react to each other's saves, use Dexie's `liveQuery` or `useLiveQuery` hook.

## Scalability Considerations

| Concern | At 100 notes | At 1,000 notes | At 10,000 notes |
|---------|-------------|----------------|-----------------|
| **Storage size** | ~500KB (text only) | ~5MB (text only) | ~50MB (text), potentially GB with images |
| **Calendar dot query** | Trivial -- single index scan | Fast -- compound index on `[workspaceId+type]` | May need month-bounded queries to avoid scanning all dates |
| **Note list/search** | In-memory filter fine | Still fine with indexes | Consider full-text index or search worker |
| **Image cleanup** | Not needed | Minor -- orphaned blobs possible | Need garbage collection: find image IDs not referenced in any note |
| **Export** | Instant | ~1 second | May need progress indicator, Web Worker for ZIP generation |
| **Schema migrations** | Dexie handles via version bumps | Same | Same -- Dexie's upgrade mechanism scales |

## Suggested Build Order

Based on component dependencies, the recommended build order is:

1. **Storage Layer + Database Schema** -- Everything depends on this. Build Dexie database definition, the storage abstraction (NoteStore, WorkspaceStore, TemplateStore, ImageStore), and seed data. This can be built and tested in isolation.

2. **State Layer** -- Thin React context or Zustand store for `activeDate`, `activeWorkspaceId`, `theme`. Depends on nothing, consumed by everything.

3. **App Shell + Split Pane Layout** -- Use `react-resizable-panels` (2.7M weekly downloads, TypeScript-first, accessible, maintained by Brian Vaughn ex-React team). Wire up left/right pane containers with resize handles. No editor content yet, just layout.

4. **Tiptap Editor Component (Generic)** -- A reusable `NoteEditor` that takes a note key, loads content from storage, saves on debounced update. Wire up core Tiptap extensions: StarterKit, Markdown. This is the hardest piece -- get it right before building panes.

5. **Daily Note Pane** -- Wire the generic editor into the left pane. Connect to `activeDate` from state. Implement template-driven auto-creation for today's note.

6. **Weekly Note Pane + Permanent Notes** -- Wire editors into right pane. Weekly note tied to week-of-year calculation. Permanent notes need a selector/list UI.

7. **Mini Calendar** -- Date navigation, dot indicators for days with notes. Pure UI component + storage query.

8. **Custom Tiptap Extensions** -- `DateReference` inline node for `[[YYYY-MM-DD]]`, `ImagePaste` extension for blob storage on paste. These extend the already-working editor.

9. **Template System** -- CRUD for templates, default template assignment (weekday/weekend/weekly). Depends on storage layer and editor.

10. **Workspace System** -- Workspace CRUD, switching, data isolation. Modifies queries across all components but doesn't change their structure.

11. **Keyboard Shortcuts** -- Global shortcut manager. Depends on all panes existing to route focus.

12. **Export/Import** -- Reads from storage, generates markdown files, bundles as ZIP. Depends on storage layer being stable.

13. **Theme System** -- Light/dark toggle with system preference detection. CSS-level concern, can be added late.

14. **Accessibility Pass** -- ARIA labels, screen reader testing, keyboard-only navigation audit. Best done after all interactive components exist.

**Dependency rationale:** Storage and state are foundational. Layout must exist before editors can be placed. The generic editor must work before it can be specialized for daily/weekly/permanent. Calendar and custom extensions enhance an already-working editor. Workspace, export, and themes are cross-cutting and can be layered on without restructuring.

## Sources

- [Tiptap Editor Documentation](https://tiptap.dev/docs/editor/getting-started/overview) -- HIGH confidence, official docs
- [Tiptap React Node Views](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views/react) -- HIGH confidence, official docs
- [Tiptap Markdown Extension](https://tiptap.dev/docs/editor/markdown) -- HIGH confidence, official docs
- [Tiptap Custom Extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions) -- HIGH confidence, official docs
- [Dexie.js Official Site](https://dexie.org) -- HIGH confidence, official docs
- [Dexie.js Image Storage Best Practices](https://medium.com/dexie-js/keep-storing-large-images-just-dont-index-the-binary-data-itself-10b9d9c5c5d7) -- HIGH confidence, from Dexie author
- [Dexie.js in React Apps](https://blog.logrocket.com/dexie-js-indexeddb-react-apps-offline-data-storage/) -- MEDIUM confidence, tutorial
- [react-resizable-panels GitHub](https://github.com/bvaughn/react-resizable-panels) -- HIGH confidence, official repo
- [Which Rich Text Editor in 2025 - Liveblocks](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025) -- MEDIUM confidence, comparison article
- [Offline-First Frontend Apps 2025 - LogRocket](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) -- MEDIUM confidence, overview article
- [RxDB LocalStorage vs IndexedDB vs OPFS](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html) -- MEDIUM confidence, from RxDB (competitor but factually sound)
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) -- HIGH confidence, official reference
- [MDN Origin Private File System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) -- HIGH confidence, official reference
