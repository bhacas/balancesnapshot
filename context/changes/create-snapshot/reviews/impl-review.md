<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Create Snapshot

- **Plan**: context/changes/create-snapshot/plan.md
- **Scope**: Phase 1-4 of 4
- **Date**: 2026-08-19
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 5 warnings, 7 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | PASS    |

## Findings

### F1 — Missing unique constraint on (snapshot_id, account_id)

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: context/changes/create-snapshot/schema.sql:20
- **Detail**: The snapshot_entries table lacks a uniqueness constraint on (snapshot_id, account_id), allowing duplicates within a snapshot.
- **Fix**: Add a unique constraint to snapshot_entries in schema.sql.
- **Decision**: PENDING

### F2 — RLS policy does not verify account_id ownership

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: context/changes/create-snapshot/schema.sql:32
- **Detail**: RLS policy for snapshot_entries checks snapshot ownership but doesn't verify account_id belongs to the user.
- **Fix**: Expand the WITH CHECK and USING clauses to include account ownership verification.
- **Decision**: PENDING

### F3 — API validation permits duplicate and foreign account IDs

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/pages/api/snapshots/index.ts:81
- **Detail**: Validation checks for missing active accounts but permits duplicate entries or IDs belonging to other users.
- **Fix**: Validate exact match of account IDs using Sets (no duplicates, no foreign IDs).
- **Decision**: PENDING

### F4 — Non-atomic multi-step insert with manual rollback

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Safety & Quality
- **Location**: src/pages/api/snapshots/index.ts:95
- **Detail**: Sequential HTTP queries for insert snapshot -> insert entries -> delete snapshot on failure can leave orphaned snapshots.
- **Fix A ⭐ Recommended**: Use a Postgres RPC function
  - Strength: Guarantees atomic transaction; impossible to orphan a snapshot.
  - Tradeoff: Requires creating and maintaining a SQL function.
  - Confidence: HIGH — standard PostgreSQL best practice.
  - Blind spot: Might complicate Supabase local dev workflow if not managed.
- **Fix B**: Improve rollback error handling
  - Strength: Keeps logic in TypeScript.
  - Tradeoff: Network partitions can still cause orphaned snapshots.
  - Confidence: MEDIUM — accepts inherent risk of distributed state.
  - Blind spot: None significant.
- **Decision**: PENDING

### F5 — `<Toaster />` component not rendered

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/SnapshotManager.tsx
- **Detail**: SnapshotManager triggers toasts but does not render a `<Toaster />`.
- **Fix**: Render `<Toaster />` in the component to ensure notifications are visible even if AccountsManager is unmounted.
- **Decision**: PENDING
