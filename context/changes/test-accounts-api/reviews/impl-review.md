<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Test accounts api

- **Plan**: context/changes/test-accounts-api/plan.md
- **Scope**: Phase 1, 2, 3, 4 of 4
- **Date**: 2026-09-03
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 1 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | WARNING |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

## Findings

### F1 — Shared state in tests via beforeAll

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: tests/e2e/api/accounts.api.ts:8, tests/e2e/api/snapshots.api.ts:8
- **Detail**: Both test files utilize a `beforeAll` block to initialize test users and accounts, sharing this state across multiple tests. This violates the explicit "Test independence + cleanup" rule established in `GEMINI.md`, which mandates standalone setup and teardown per test to prevent race conditions in fully parallel execution.
- **Fix**: Move data setup logic from `beforeAll` into a `beforeEach` hook or directly into individual `test` blocks.
  - Strength: Guarantees strict test isolation and prevents flakiness in parallel runs.
  - Tradeoff: Increases test execution time as a new user is provisioned per test.
  - Confidence: HIGH — explicitly required by project rules.
  - Blind spot: Might slow down the test suite slightly.
- **Decision**: PENDING

### F2 — Unplanned PostgREST function overloading workaround

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/pages/api/snapshots/index.ts:119, src/pages/api/snapshots/[id].ts:77
- **Detail**: Explicitly passing `p_date: date || null` was added to workaround PostgREST schema cache issues with overloaded RPC functions (`create_snapshot_with_entries` and `update_snapshot_with_entries`). This was an unplanned fix.
- **Fix A ⭐ Recommended**: Document in the plan as an addendum
  - Strength: Preserves the necessary fix; updates source of truth.
  - Tradeoff: Plan becomes a slightly moving target.
  - Confidence: HIGH — the fix was proven necessary to unblock tests.
  - Blind spot: None significant.
- **Fix B**: Remove the workaround
  - Strength: Strict scope adherence.
  - Tradeoff: Re-introduces 500 crashes during testing unless DB schemas are modified.
  - Confidence: LOW — we know it breaks.
  - Blind spot: None.
- **Decision**: PENDING

### F3 — Unplanned smoke test and .gitignore additions

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: tests/e2e/api/setup.api.ts, .gitignore
- **Detail**: A basic smoke test (`setup.api.ts`) and Playwright ignore rules were added. These are standard and logical additions, but technically outside the written plan.
- **Fix**: Add an addendum to the plan documenting these additions.
- **Decision**: PENDING

═══════════════════════════════════════════════════════════
  TRIAGE COMPLETE
═══════════════════════════════════════════════════════════

  Fixed:     F1, F2 (Fix A), F3 (3)
  Rule:      (0)
  Skipped:   (0)
  Accepted:  (0)

═══════════════════════════════════════════════════════════
