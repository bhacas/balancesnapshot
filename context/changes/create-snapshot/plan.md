# Create Snapshot Implementation Plan

## Overview

Implement the core snapshot feature allowing users to capture their active account balances at a point in time. This provides the historical data foundation for net worth tracking and financial analysis.

## Current State Analysis

- The `Account` entity and `AccountsManager` UI exist and function correctly.
- Supabase is configured with RLS and user authentication.
- API validation uses Zod schemas (`src/pages/api/accounts/index.ts`).
- There are no entities or UI for capturing point-in-time balances of these accounts.

## Desired End State

- Users can create a single snapshot per day (or multiple, but timestamped) that records the balance of all their active accounts.
- The data is stored relationally in Supabase (`snapshots` and `snapshot_entries` tables).
- A UI flow on the dashboard allows users to submit these balances via a modal dialogue, with validation ensuring no active accounts are left blank.
- The dashboard displays a basic list/history of created snapshots.

### Key Discoveries:

- **Pattern to follow**: API endpoints in `src/pages/api/` use Zod for validation and standard `Response` objects.
- **Pattern to follow**: React components in `src/components/` use `lucide-react` for icons, shadcn/ui components (`Dialog`, `Button`, `Toaster`), and `sonner` for toast notifications.
- **Constraint to work within**: Snapshots must retain the historical account ID. This relies on the system soft-deleting accounts rather than hard-deleting them, to ensure historical records remain intact and linkable.

## What We're NOT Doing

- We are not building trend charts or complex analytics in this change.
- We are not adding support for multi-currency or per-account notes.
- We are not allowing partial snapshots (every active account must have a balance entered).

## Implementation Approach

- **Schema**: Introduce `snapshots` (id, user_id, date/timestamp) and `snapshot_entries` (id, snapshot_id, account_id, balance) tables.
- **API**: Create a `POST /api/snapshots` endpoint that receives an array of `{ account_id, balance }` objects, creates a snapshot record, and then bulk inserts the entries.
- **UI**: Add a `SnapshotManager.tsx` component that queries the active accounts, presents a form in a modal requiring a balance for each, and submits to the new API.

## Critical Implementation Notes

- **Data Integrity**: Ensure the API validates that balances are provided for _all_ currently active accounts belonging to the user.
- **Transactions**: Since Supabase JS client doesn't natively support multi-statement transactions without an RPC, either use a Postgres RPC function or ensure the API handles partial failures gracefully (e.g. inserting entries after snapshot creation, and if entries fail, attempting to delete the snapshot). Using sequential inserts is acceptable if RPC is too complex, but must be error-handled.
- **Type Definitions**: Update `src/types.ts` with `Snapshot` and `SnapshotEntry` interfaces before writing the UI.

## Progress

1. **Phase 1: Data Model Updates**
   - [x] 1.1 Update `src/types.ts` to include `Snapshot` and `SnapshotEntry` interfaces.
   - [x] 1.2 Document the required Supabase schema SQL statements in a `schema.sql` file (or instructions) for the user to run on their database.

2. **Phase 2: API Routes**
   - [x] 2.1 Create `src/pages/api/snapshots/index.ts`.
   - [x] 2.2 Implement `GET` to list user's historical snapshots.
   - [x] 2.3 Implement `POST` to accept snapshot data, validate using Zod, and insert into the database.

3. **Phase 3: UI Components**
   - [x] 3.1 Create `src/components/SnapshotManager.tsx`.
   - [x] 3.2 Implement a "Create Snapshot" modal that fetches active accounts and renders numeric inputs for each.
   - [x] 3.3 Add client-side validation to ensure all fields are filled before enabling the submit button.
   - [x] 3.4 Implement a basic list/table view below the button to display historical snapshots.

4. **Phase 4: Dashboard Integration**
   - [x] 4.1 Import and render `<SnapshotManager client:load />` in `src/pages/dashboard.astro`.
