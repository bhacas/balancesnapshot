# Manage Accounts — Plan Brief

> Full plan: `context/changes/manage-accounts/plan.md`
> Roadmap: `context/foundation/roadmap.md`

## What & Why
We are building the core "Manage Accounts" feature (S-01). Users need the ability to add, edit, and delete their financial accounts (categorized as assets or liabilities) so that they can eventually use them to track their total Net Worth across monthly snapshots.

## Starting Point
The project has the basic Astro + React frontend and Supabase authentication working, but lacks any database schema or API endpoints for managing actual application data.

## Desired End State
The user can navigate to an account management view, see their active accounts split into Assets and Liabilities, and quickly add, edit, or remove accounts via inline forms. The data will be persisted securely in Supabase.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
|---|---|---|---|
| Account type schema | Single `type` text column | Simplest query pattern, matches UI groupings. | Plan |
| Account balances | No balance on `accounts` table | Balances live only in snapshots to prevent sync issues. | Plan |
| Deletion strategy | Soft delete (`is_active = false`) | Preserves historical snapshot integrity later. | Plan |
| API Strategy | Astro API endpoints | Standard pattern, separates concerns from UI. | Plan |
| Form interaction | Inline forms/dialogs | Keeps user in context, faster UX. | Plan |
| Loading strategy | Disable button + refetch list | Very reliable, guarantees UI reflects DB state. | Plan |
| Error handling | Return structured JSON, show toast | Clear separation, robust user experience. | Plan |

## Scope

**In scope:**
- `accounts` Supabase table and RLS policies
- Typescript definitions for `Account`
- Astro API routes for CRUD operations
- React components for the list and forms

**Out of scope:**
- Setting initial balances (this happens in snapshots)
- Tracking individual transactions
- Connecting to external banks

## Architecture / Approach
1. **Data**: A single `accounts` table in Supabase.
2. **API**: Astro API routes (`/api/accounts` and `/api/accounts/[id]`) that securely interact with Supabase using the user's auth token.
3. **UI**: A client-side React component (`AccountsManager`) that fetches from the API, handles form state, and manages loading/error states.

## Phases at a Glance

| Phase | What it delivers | Key risk |
|---|---|---|
| 1. Database Schema & RLS | Creates the `accounts` table securely | Misconfigured RLS could expose user data |
| 2. Shared Types | Defines the `Account` interface | — |
| 3. Astro API Endpoints | REST endpoints for mutations | Authentication gaps in the API route |
| 4. React Frontend | User interface for management | Edge cases in form state and API errors |

**Prerequisites:** None.
**Estimated effort:** ~2-3 sessions across 4 phases.

## Open Risks & Assumptions
- We assume `is_active` soft-deletion is sufficient and won't cause unique constraint issues with account names.

## Success Criteria (Summary)
- User can successfully add an asset or liability account to their list.
- User can edit and delete accounts, seeing the UI update accordingly.
- Changes persist securely to their own account in the database.
