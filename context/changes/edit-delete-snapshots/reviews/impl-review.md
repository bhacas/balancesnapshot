<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Edit and Delete Snapshots

- **Plan**: context/changes/edit-delete-snapshots/plan.md
- **Scope**: Phase 2 of 2
- **Date**: 2026-08-20
- **Verdict**: REJECTED
- **Findings**: 1 critical 0 warnings 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | FAIL |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Data loss potential during snapshot update

- **Severity**: ❌ CRITICAL
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Safety & Quality
- **Location**: src/pages/api/snapshots/[id].ts
- **Detail**: The `PUT` method performs non-atomic operations (update snapshot, delete entries, insert new entries). If the `insert` fails (e.g., due to an invalid `account_id` or network error), the previous entries are permanently deleted, resulting in data loss.
- **Fix**: Use a Supabase RPC to wrap the update, delete, and insert operations in a single Postgres transaction.
  - Strength: Guarantees atomicity and prevents data loss.
  - Tradeoff: Requires creating a new database migration and RPC function.
  - Confidence: HIGH — this matches the pattern used for creating snapshots (`create_snapshot_with_entries`).
  - Blind spot: None significant.
- **Decision**: FIXED
