---
phase: 3
slug: power-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | vite.config.ts (test section) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | TMPL-01 | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "save template"` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | TMPL-03 | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "default weekday"` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | TMPL-04 | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "default weekend"` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | TMPL-05 | unit | `pnpm vitest run src/template/__tests__/use-templates.test.ts -t "default weekly"` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | WKSP-01 | unit | `pnpm vitest run src/workspace/__tests__/use-workspaces.test.ts -t "create"` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | WKSP-02 | unit | `pnpm vitest run src/workspace/__tests__/use-workspaces.test.ts -t "switch"` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | WKSP-03 | unit | `pnpm vitest run src/workspace/__tests__/use-workspaces.test.ts -t "isolation"` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | SRCH-01 | unit | `pnpm vitest run src/search/__tests__/search.test.ts -t "search across"` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | SRCH-02 | unit | `pnpm vitest run src/search/__tests__/search.test.ts -t "highlight"` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | DATA-02 | unit | `pnpm vitest run src/export/__tests__/export.test.ts -t "export zip"` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 2 | DATA-03 | unit | `pnpm vitest run src/export/__tests__/import.test.ts -t "import"` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 2 | EDIT-03 | manual-only | Manual: paste image from clipboard in browser | N/A | ⬜ pending |
| 03-05-02 | 05 | 2 | EDIT-04 | unit | `pnpm vitest run src/editor/__tests__/date-reference.test.ts -t "date reference"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/template/__tests__/use-templates.test.ts` — stubs for TMPL-01, TMPL-03, TMPL-04, TMPL-05
- [ ] `src/workspace/__tests__/use-workspaces.test.ts` — stubs for WKSP-01, WKSP-02, WKSP-03
- [ ] `src/search/__tests__/search.test.ts` — stubs for SRCH-01, SRCH-02
- [ ] `src/export/__tests__/export.test.ts` — stubs for DATA-02
- [ ] `src/export/__tests__/import.test.ts` — stubs for DATA-03
- [ ] `src/editor/__tests__/date-reference.test.ts` — stubs for EDIT-04

*Existing infrastructure covers test framework (Vitest already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Paste image from clipboard, render inline | EDIT-03 | Requires browser clipboard API and real paste event | 1. Copy image to clipboard 2. Paste in editor 3. Verify image renders inline |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
