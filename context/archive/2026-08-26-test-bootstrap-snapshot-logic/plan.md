# Test Bootstrap & Snapshot Logic Implementation Plan

## Overview

Bootstrap Vitest as the testing framework and implement the missing "implicit carry-over" logic for balance snapshots. This ensures users don't have to re-type unchanged balances every month, while historical edits safely affect only the targeted snapshot (Risk R-01 & R-03).

## Current State Analysis

- The `SnapshotManager` UI currently requires users to manually input every balance when creating a new snapshot.
- The `POST /api/snapshots` backend route strictly requires exactly one balance for each active account, meaning any empty fields will cause the request to fail.
- There is currently no test runner configured in the project.

## Desired End State

- Vitest is configured to run tests in a fast Node environment.
- A pure function `calculateInitialBalances` reliably derives the starting balances for the form based on active accounts and the user's latest snapshot.
- New accounts without history default safely to `0.00`.
- Editing a historical snapshot correctly pre-fills only that specific snapshot's data without cascading changes.
- The UI wires this pure function to the form state, preventing users from seeing blank inputs for existing accounts.
- The test runner proves this logic is rock solid before UI wiring.

### Key Discoveries:

- `src/components/SnapshotManager.tsx:190` - `getInitialBalances` currently returns an empty object if `!initialSnapshot`. This is the exact injection point for the new logic.
- `src/pages/api/snapshots/index.ts:96` - The backend API rejects the payload if it's missing any active account balance, confirming the pre-fill _must_ happen on the frontend.
- `src/lib/store.ts` - `snapshotsStore` holds `SnapshotWithEntries[]` in descending order (`created_at`). The first item is always the latest snapshot.

## What We're NOT Doing

- We are not writing React component tests (no `jsdom` or `@testing-library/react`).
- We are not modifying the strict Supabase RPCs or API route validations.
- We are not implementing "ripple effect" updates for historical edits. Editing January will not magically update February.

## Implementation Approach

1. Extract the carry-over logic out of the React component into a pure, highly testable function in `src/lib/snapshot-logic.ts`.
2. Write unit tests targeting this function using Vitest to assert behavior for standard carry-over, new accounts, and historical edits.
3. Wire the pure function back into `SnapshotManager.tsx` to handle the `useState` initialization for `balances`.

## Critical Implementation Details

- **Input format:** The pure function should return `Record<string, string>` (mapping `account_id` to a stringified float like `"1250.00"` or `"0"`) so the React inputs can safely hold the state while the user types.
- **Latest Snapshot Discovery:** When creating a _new_ snapshot, the logic must find the absolute latest snapshot from the store to use as the base.
- **Historical Edits:** When editing an _existing_ snapshot, the logic must ONLY use the balances from the snapshot being edited, explicitly ignoring newer or older snapshots.

## Progress

- [x] Phase 1: Bootstrap Vitest Setup — 2527e2a
  - [x] Install `vitest` as a dev dependency. — 2527e2a
  - [x] Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `package.json`. — 2527e2a
  - [x] Create `vitest.config.ts` configuring a standard Node environment with TypeScript support. — 2527e2a
- [x] Phase 2: Implement Carry-Over Pure Logic — 3e9b52b
  - [x] Create `src/lib/snapshot-logic.ts`. — 3e9b52b
  - [x] Implement and export `calculateInitialBalances(accounts: Account[], latestSnapshot?: SnapshotWithEntries): Record<string, string>`. — 3e9b52b
  - [x] Ensure new accounts default to `"0"`. — 3e9b52b
- [x] Phase 3: Write Unit Tests — 72251c8
  - [x] Create `src/lib/snapshot-logic.test.ts`. — 72251c8
  - [x] Test case: Returns empty (or 0s) if there is no previous snapshot. — 72251c8
  - [x] Test case: Carries over balances correctly from the provided latest snapshot. — 72251c8
  - [x] Test case: Defaults newly added accounts to `0` while carrying over older ones. — 72251c8
- [x] Phase 4: Wire Logic to UI — 60f057a
  - [x] In `SnapshotManager.tsx`, import `calculateInitialBalances`. — 60f057a
  - [x] Modify `getInitialBalances` to pass the active accounts and either the `initialSnapshot` (if editing) or `snapshots[0]` (if creating new). — 60f057a
- [x] Phase 5: Update Cookbook — 7a2f364
  - [x] Update `context/foundation/test-plan.md` section 6 to include the Vitest pure-logic testing pattern. — 7a2f364
