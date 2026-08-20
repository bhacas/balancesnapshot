<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Net Worth Dashboard

- **Plan**: context/changes/net-worth-dashboard/plan.md
- **Scope**: All Phases
- **Date**: 2026-08-20
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 5 observations

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

### F1 — Soft-Deleted Accounts Corrupt Historical Net Worth

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Safety & Quality
- **Location**: src/components/NetWorthDashboard.tsx:44
- **Detail**: `accountTypeMap` uses `GET /api/accounts` which filters out inactive (soft-deleted) accounts. For past snapshots containing entries for a now-deleted account, the balance is ignored, silently corrupting the historical net worth trend.
- **Fix A ⭐ Recommended**: Adjust API / Component to include inactive accounts for the dashboard map
  - Strength: Preserves accurate historical net worth data points on the client side.
  - Tradeoff: Minor endpoint update or client query param (`?include_inactive=true`).
  - Confidence: HIGH — standard fix for foreign key lookup on soft-deleted rows.
  - Blind spot: Might require backend changes depending on how the endpoint is written.
- **Fix B**: Join account types inside the `/api/snapshots` endpoint
  - Strength: Reduces client-side joining logic.
  - Tradeoff: Increases query complexity on the snapshots endpoint.
  - Confidence: MEDIUM — depends on Supabase query capabilities for JSON array entries.
  - Blind spot: Currently `entries` is a JSONB array, joining requires a view or RPC.
- **Decision**: FIXED (via Fix A)

### F2 — Manual Class Name Concatenation Violates Guidelines

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/NetWorthDashboard.tsx:92
- **Detail**: `AGENTS.md` explicitly specifies: "Styling: Do not concatenate class strings manually; use the cn() helper." The code uses a template string to toggle classes.
- **Fix**: Import `cn` from `@/lib/utils` and use it for conditional classes.
- **Decision**: PENDING

### F3 — API Failure Masked as False Empty State

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/NetWorthDashboard.tsx:23
- **Detail**: If `fetchData()` fails, it swallows the error (showing a toast) but leaves `chartData` empty, leading the component to show "Record your first snapshot..." which is misleading for a user with actual data but a network issue.
- **Fix**: Introduce an `error` state. If fetch fails, show a "Failed to load" message instead of the empty state.
- **Decision**: PENDING

### F4 — Uncoordinated React Islands Fetching Data Redundantly

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Architecture
- **Location**: src/pages/dashboard.astro
- **Detail**: The dashboard mounts 3 React components (`client:load`) that independently fetch `/api/accounts` and `/api/snapshots`, resulting in 5 duplicate requests on mount. NetWorthDashboard also doesn't update when a snapshot is added.
- **Fix**: Lift state to a shared store (e.g., `nanostores`) or Astro-level fetching.
  - Strength: Eliminates redundant calls and synchronizes UI components.
  - Tradeoff: Introduces new state management boilerplate or data passing props.
  - Confidence: HIGH — classic island architecture pain point.
  - Blind spot: This may exceed the scope of the immediate feature.
- **Decision**: PENDING

### F5 — Misplaced Import Statement

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/NetWorthDashboard.tsx:7
- **Detail**: `import { toast } from "sonner";` is placed below the `type` declaration instead of being grouped with top-level imports.
- **Fix**: Move the import to line 4.
- **Decision**: PENDING

### F6 — Potential Runtime Crash on Unsafe `snap.entries` Iteration

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/NetWorthDashboard.tsx:44
- **Detail**: `snap.entries.forEach(...)` assumes `entries` is always an array. If an API anomaly returns null, it crashes the render.
- **Fix**: Add optional chaining or fallback: `snap.entries?.forEach(...)`.
- **Decision**: PENDING

### F7 — Hardcoded Text Colors and Inline SVG Themes

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/NetWorthDashboard.tsx:63
- **Detail**: The loading state uses `text-black` (contrasts with dark mode). The tooltip uses inline colors `#ffffff` which breaks theming.
- **Fix**: Replace `text-black` with `text-muted-foreground` and use theme CSS variables for recharts.
- **Decision**: PENDING

### F8 — MoM Calculation Edge Case when Previous Net Worth is Zero

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/NetWorthDashboard.tsx:90
- **Detail**: If previous net worth was zero, calculation is skipped and momChange is 0, displaying as `+0.0% MoM` instead of indicating infinity or not applicable.
- **Fix**: Conditionally render the MoM badge, or show "N/A" if previous net worth was 0.
- **Decision**: PENDING
