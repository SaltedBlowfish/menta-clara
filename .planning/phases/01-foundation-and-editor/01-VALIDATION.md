---
phase: 1
slug: foundation-and-editor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                      |
| ---------------------- | ---------------------------------------------------------- |
| **Framework**          | Vitest 2.x + @testing-library/react 16.x                   |
| **Config file**        | vitest config embedded in vite.config.ts (Wave 0 installs) |
| **Quick run command**  | `npx vitest run --reporter=verbose`                        |
| **Full suite command** | `npx vitest run --coverage`                                |
| **Estimated runtime**  | ~5 seconds                                                 |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx eslint src/ && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green + `npx vite build` succeeds with zero warnings
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type   | Automated Command                       | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ----------- | --------------------------------------- | ----------- | ---------- |
| 01-01-01 | 01   | 1    | DEVX-01     | smoke       | `npx tsc --noEmit && npx vite build`    | N/A         | ⬜ pending |
| 01-01-02 | 01   | 1    | DEVX-02     | smoke       | `npx eslint src/`                       | N/A         | ⬜ pending |
| 01-01-03 | 01   | 1    | DEVX-03     | lint        | Custom ESLint rule or build script      | ❌ W0       | ⬜ pending |
| 01-01-04 | 01   | 1    | DEVX-04     | smoke       | `npx vite build && ls dist/index.html`  | N/A         | ⬜ pending |
| 01-02-01 | 02   | 1    | DATA-01     | unit        | `npx vitest run src/storage/`           | ❌ W0       | ⬜ pending |
| 01-02-02 | 02   | 1    | DATA-04     | unit        | `npx vitest run src/storage/`           | ❌ W0       | ⬜ pending |
| 01-03-01 | 03   | 2    | EDIT-01     | integration | `npx vitest run src/components/editor/` | ❌ W0       | ⬜ pending |
| 01-03-02 | 03   | 2    | EDIT-02     | integration | `npx vitest run src/components/editor/` | ❌ W0       | ⬜ pending |
| 01-03-03 | 03   | 2    | EDIT-05     | integration | `npx vitest run src/components/editor/` | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `vite.config.ts` — add vitest test configuration (globals, jsdom, setup file)
- [ ] `vitest.setup.ts` — import @testing-library/jest-dom matchers
- [ ] `tsconfig.json` — add vitest/globals and @testing-library/jest-dom types
- [ ] `src/storage/__tests__/idb-storage.test.ts` — stubs for DATA-01, DATA-04
- [ ] `src/components/editor/__tests__/editor.test.tsx` — stubs for EDIT-01, EDIT-02, EDIT-05
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

---

## Manual-Only Verifications

| Behavior                                   | Requirement | Why Manual                                         | Test Instructions                                                              |
| ------------------------------------------ | ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| WYSIWYG renders inline formatting visually | EDIT-01     | Visual rendering quality requires human eyes       | Open app, type `**bold** _italic_ # heading`, verify formatting appears inline |
| Browser tab close/reopen preserves content | DATA-01     | Full browser lifecycle can't be simulated in jsdom | Type content, close tab, reopen, verify content unchanged                      |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
