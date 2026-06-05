---
project: BalanceSnapshot
version: 1
status: draft
created: 2026-06-05
updated: 2026-06-05
prd_version: 1
main_goal: speed
top_blocker: time
---

# Roadmap: BalanceSnapshot

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

The current landscape of budgeting apps is too high-friction, forcing a daily transaction grind, while banking apps keep data siloed. BalanceSnapshot is a simple tool that takes a monthly snapshot of total wealth from all sources. By removing the exhaustion of transaction categorization, it focuses entirely on revealing the user's real wealth-building trend over time.

## North star

**S-02: user can create and backdate a snapshot by entering current balances for their accounts.** — This is the validation milestone (the smallest end-to-end slice whose successful delivery would prove the core product hypothesis — placed as early as Prerequisites allow because everything else only matters if this works), proving that a simple periodic snapshot provides enough value without transaction tracking.

## At a glance

| ID | Change ID | Outcome (user can …) | Prerequisites | PRD refs | Status |
|---|---|---|---|---|---|
| S-01 | manage-accounts | user can add, edit, and delete accounts, classifying them as assets or liabilities | — | US-01, FR-001, FR-002 | ready |
| S-02 | create-snapshot | user can create and backdate a snapshot by entering current balances for their accounts | S-01 | US-02, FR-003 | proposed |
| S-04 | net-worth-dashboard | user can see their true Net Worth calculated and charted over time | S-02 | US-04, FR-004, FR-005 | proposed |
| S-03 | edit-delete-snapshots | user can fix mistakes in past snapshots | S-02 | US-03, FR-003 | proposed |

## Baseline

What's already in place in the codebase as of `2026-06-05` (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — Astro + React 19 + TailwindCSS 4 (per package.json)
- **Backend / API:** present — Astro API Routes / SSR (per package.json)
- **Data:** present — Supabase (per tech-stack.md and package.json)
- **Auth:** present — Supabase Auth (per tech-stack.md and package.json)
- **Deploy / infra:** present — Cloudflare Pages + GitHub Actions (per tech-stack.md)
- **Observability:** absent — no error tracking or logging tooling found

## Foundations

(No foundations required. All essential layers for MVP are present in the baseline, and the strict 1-week `speed` goal defers non-essential scaffolding.)

## Slices

### S-01: Manage accounts

- **Outcome:** user can add, edit, and delete accounts, classifying them as assets or liabilities.
- **Change ID:** manage-accounts
- **PRD refs:** US-01, FR-001, FR-002
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Lowest risk conceptually, but requires establishing the Supabase database schema and RLS policies for the first time.
- **Status:** ready

### S-02: Create a monthly snapshot

- **Outcome:** user can create and backdate a snapshot by entering current balances for their accounts.
- **Change ID:** create-snapshot
- **PRD refs:** US-02, FR-003
- **Prerequisites:** S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Implementing the business logic to implicitly carry over unchanged balances from previous snapshots is the most complex data operation.
- **Status:** proposed

### S-04: View Net Worth dashboard

- **Outcome:** user can see their true Net Worth calculated and charted over time.
- **Change ID:** net-worth-dashboard
- **PRD refs:** US-04, FR-004, FR-005
- **Prerequisites:** S-02
- **Parallel with:** S-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Integrating a charting library might slow down the 1-week timeline; we may need to fallback to a simple table if visualization becomes a time-sink.
- **Status:** proposed

### S-03: Edit or delete existing snapshots

- **Outcome:** user can fix mistakes in past snapshots.
- **Change ID:** edit-delete-snapshots
- **PRD refs:** US-03, FR-003
- **Prerequisites:** S-02
- **Parallel with:** S-04
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Modifying a historical snapshot may require recalculating balance carry-overs for all subsequent snapshots.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
|---|---|---|---|---|
| S-01 | manage-accounts | Build account management (CRUD + asset/liability classification) | yes | Run `/10x-plan manage-accounts` |
| S-02 | create-snapshot | Build snapshot creation and balance entry | no | Requires S-01 |
| S-04 | net-worth-dashboard | Build Net Worth calculation and charting dashboard | no | Requires S-02 |
| S-03 | edit-delete-snapshots | Build snapshot editing and deletion | no | Requires S-02 |

## Open Roadmap Questions

1. **target_scale** — Owner: TBD. Block: no. (What is the expected scale? Not blocking MVP.)
2. **Non-Functional Requirements** — Owner: TBD. Block: no. (What are the measurable performance or availability targets? Not blocking MVP.)

## Parked

- **Tracking individual transactions (income/expenses)** — Why parked: Explicit Non-Goal in PRD to keep friction low.
- **Direct integrations with banks (Open Banking/PSD2)** — Why parked: Explicit Non-Goal in PRD.
- **Multi-currency support and dynamic exchange rate conversion** — Why parked: Explicit Non-Goal in PRD.
- **Advanced investment forecasting or inflation calculation** — Why parked: Explicit Non-Goal in PRD.

## Done

