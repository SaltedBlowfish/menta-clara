---
phase: 2
slug: core-product-experience
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + @testing-library/react 16.x |
| **Config file** | vite.config.ts (test section) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test && pnpm lint && pnpm typecheck` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test && pnpm lint && pnpm typecheck`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | LAYO-01 | unit | `pnpm vitest run src/layout/` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | LAYO-02 | unit | `pnpm vitest run src/layout/` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | LAYO-03 | unit | `pnpm vitest run src/shared/` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | LAYO-04 | unit | `pnpm vitest run src/shared/` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | DALY-01 | unit | `pnpm vitest run src/daily/` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | DALY-02 | integration | `pnpm vitest run src/calendar/` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | DALY-03 | unit | Covered by existing useNote tests | ✅ | ⬜ pending |
| 02-03-01 | 03 | 1 | WEEK-01 | unit | `pnpm vitest run src/weekly/` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 1 | WEEK-02 | unit | `pnpm vitest run src/weekly/` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 1 | WEEK-03 | unit | `pnpm vitest run src/weekly/` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | PERM-01 | unit | `pnpm vitest run src/permanent/` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 2 | PERM-02 | unit | `pnpm vitest run src/permanent/` | ❌ W0 | ⬜ pending |
| 02-04-03 | 04 | 2 | PERM-03 | unit | Covered by existing useNote tests | ✅ | ⬜ pending |
| 02-05-01 | 05 | 2 | CALR-01 | unit | `pnpm vitest run src/calendar/` | ❌ W0 | ⬜ pending |
| 02-05-02 | 05 | 2 | CALR-02 | unit | `pnpm vitest run src/calendar/` | ❌ W0 | ⬜ pending |
| 02-05-03 | 05 | 2 | CALR-03 | unit | `pnpm vitest run src/calendar/` | ❌ W0 | ⬜ pending |
| 02-05-04 | 05 | 2 | CALR-04 | unit | `pnpm vitest run src/calendar/` | ❌ W0 | ⬜ pending |
| 02-06-01 | 06 | 3 | APPR-01 | unit | `pnpm vitest run src/theme/` | ❌ W0 | ⬜ pending |
| 02-06-02 | 06 | 3 | APPR-02 | unit | `pnpm vitest run src/theme/` | ❌ W0 | ⬜ pending |
| 02-06-03 | 06 | 3 | APPR-03 | manual-only | Visual inspection | N/A | ⬜ pending |
| 02-07-01 | 07 | 3 | KEYS-01 | unit | `pnpm vitest run src/shared/` | ❌ W0 | ⬜ pending |
| 02-07-02 | 07 | 3 | KEYS-02 | unit | `pnpm vitest run src/shared/` | ❌ W0 | ⬜ pending |
| 02-07-03 | 07 | 3 | KEYS-03 | manual-only | TipTap built-in; verified in Phase 1 | N/A | ⬜ pending |
| 02-07-04 | 07 | 3 | KEYS-04 | unit | `pnpm vitest run src/shared/` | ❌ W0 | ⬜ pending |
| 02-08-01 | 08 | 3 | A11Y-01 | unit | `pnpm vitest run --grep "aria"` | ❌ W0 | ⬜ pending |
| 02-08-02 | 08 | 3 | A11Y-02 | integration | `pnpm vitest run --grep "keyboard"` | ❌ W0 | ⬜ pending |
| 02-08-03 | 08 | 3 | A11Y-03 | unit | `pnpm vitest run src/shared/` | ❌ W0 | ⬜ pending |
| 02-08-04 | 08 | 3 | A11Y-04 | manual-only | Visual inspection + contrast checker | N/A | ⬜ pending |
| 02-08-05 | 08 | 3 | A11Y-05 | integration | `pnpm vitest run --grep "focus"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/layout/__tests__/split-pane.test.tsx` — stubs for LAYO-01, LAYO-02
- [ ] `src/daily/__tests__/use-daily-note.test.ts` — stubs for DALY-01, DALY-03
- [ ] `src/weekly/__tests__/get-week-id.test.ts` — stubs for WEEK-01, WEEK-02
- [ ] `src/permanent/__tests__/use-permanent-notes.test.ts` — stubs for PERM-01, PERM-02
- [ ] `src/calendar/__tests__/calendar-grid.test.tsx` — stubs for CALR-01 through CALR-04
- [ ] `src/theme/__tests__/use-theme.test.ts` — stubs for APPR-01, APPR-02
- [ ] `src/shared/__tests__/use-keyboard-shortcuts.test.ts` — stubs for KEYS-01, KEYS-02
- [ ] `src/shared/__tests__/collapsible-section.test.tsx` — stubs for LAYO-04, A11Y-01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Typography matches spec | APPR-03 | Visual design assessment | Compare rendered typography against UI-SPEC font stack/sizes |
| Formatting shortcuts | KEYS-03 | TipTap built-in, verified Phase 1 | Test Cmd+B, Cmd+I, Cmd+U in editor |
| Color contrast AA | A11Y-04 | Requires visual contrast measurement | Use browser DevTools contrast checker on all text/background pairs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending