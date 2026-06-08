# Manage Accounts Implementation Plan

## Overview

We are building the "Manage Accounts" feature (S-01) which allows users to add, edit, and delete accounts, classifying them as either assets or liabilities. This is the foundational data model for BalanceSnapshot.

## Current State Analysis

- The Astro + React + Tailwind + Supabase Auth stack is set up.
- The `accounts` database schema does not exist yet.
- There are no existing API routes for data mutation.
- UI has basic authentication but no dashboard functionality yet.

## Desired End State

Users can navigate to an accounts management view, see a list of their accounts grouped by asset/liability, add new accounts, edit existing ones, and soft/hard delete them. 

### Key Discoveries:

- Astro SSR + Supabase is configured in `src/lib/supabase.ts`.
- Shadcn UI is available for modals and toasts (`src/components/ui/`).

## What We're NOT Doing

- Tracking individual transactions.
- Connecting to banks (Open Banking).
- Capturing account balances on the `accounts` table (balances live exclusively in snapshots).

## Implementation Approach

1. Create a single `accounts` table in Supabase with a `type` text column ('asset', 'liability') and standard RLS policies tied to `user_id`.
2. Implement standard REST-like Astro API endpoints (`/api/accounts`) for CRUD operations.
3. Build a React interface that fetches from these endpoints and uses inline modals for creating/editing accounts. Validation errors will return structured JSON to show toast notifications. We will use an optimistic loading strategy (disabling buttons + refetching).

## Critical Implementation Details

- **Deletion Logic**: Deleting an account must soft-delete (`is_active = false`) if there are historical snapshots. While we don't have snapshots yet in S-01, we must implement the `is_active` flag now for future compatibility. The frontend and API GET endpoints must filter out `is_active = false`.

## Phase 1: Database Schema & RLS

### Overview
Create the `accounts` table and secure it.

### Changes Required:

#### 1. Supabase Migration
**File**: `supabase/migrations/0000_create_accounts.sql`
**Intent**: Create the `accounts` table with a `type` check constraint ('asset' or 'liability') and an `is_active` boolean defaulting to true. `user_id` should default to the authenticated user's ID.
**Contract**: `accounts` table with columns: `id` (uuid, pk), `user_id` (uuid, fk to auth.users, DEFAULT auth.uid()), `name` (text), `type` (text), `is_active` (boolean), `created_at` (timestamptz). Enable RLS and add policies for SELECT, INSERT, UPDATE, DELETE where `user_id = auth.uid()`.

### Success Criteria:

#### Automated Verification:
- [ ] Database migration applies successfully.

#### Manual Verification:
- [ ] RLS policies verify that a user can only access their own accounts.

---

## Phase 2: Shared Types

### Overview
Define the TypeScript types for the `Account` entity.

### Changes Required:

#### 1. Type Definitions
**File**: `src/types.ts`
**Intent**: Define the `Account` interface matching the database schema.
**Contract**: 
```typescript
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'asset' | 'liability';
  is_active: boolean;
  created_at: string;
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Type checking passes: `npm run build`

#### Manual Verification:
- [ ] (None)

---

## Phase 3: Astro API Endpoints

### Overview
Build the REST API for accounts.

### Changes Required:

#### 1. Accounts API Route
**File**: `src/pages/api/accounts/index.ts`
**Intent**: Handle GET (list active accounts) and POST (create new account). Returns structured JSON.
**Contract**: GET returns `Account[]` where `is_active = true`. POST uses Zod to validate `{ name, type }` (name is required, type is 'asset' | 'liability') and returns the created `Account`. Return 400 with Zod error details on failure. Ensure `const prerender = false`.

#### 2. Account ID API Route
**File**: `src/pages/api/accounts/[id].ts`
**Intent**: Handle PUT (update account) and DELETE (soft delete account).
**Contract**: PUT uses Zod to validate `{ name, type }`. DELETE sets `is_active = false`. Return 400 with Zod error details on failure. Ensure `const prerender = false`.

### Success Criteria:

#### Automated Verification:
- [ ] Linting passes: `npm run lint`

#### Manual Verification:
- [ ] Endpoints return 401 when unauthenticated.
- [ ] Endpoints correctly read/write to the Supabase database when authenticated.

---

## Phase 4: React Frontend

### Overview
Build the accounts list view, create/edit modals, and integrate with the API.

### Changes Required:

#### 1. Install Shadcn Components
**File**: Terminal
**Intent**: Install missing dialog and toast components for the UI.
**Contract**: Run `npx @tailwindcss/upgrade` if needed (Tailwind 4 is used), but for Astro+React, add Shadcn components manually or via standard CLI: `npx shadcn@latest add dialog toast`.

#### 2. Account Management UI
**File**: `src/components/AccountsManager.tsx`
**Intent**: A React component that fetches accounts, displays them grouped by Assets/Liabilities, and contains inline modals for adding/editing. 
**Contract**: React component using `fetch` to `/api/accounts`, showing Shadcn toasts on error, disabling submit buttons during API calls, and refetching the list on success.

#### 3. Dashboard Integration
**File**: `src/pages/dashboard.astro`
**Intent**: Render the `AccountsManager` component on the dashboard.
**Contract**: Add `<AccountsManager client:load />`.

### Success Criteria:

#### Automated Verification:
- [ ] Build succeeds: `npm run build`

#### Manual Verification:
- [ ] User can create a new asset and liability account.
- [ ] User can edit an existing account's name or type.
- [ ] User can delete an account, and it disappears from the list.
- [ ] Validation errors (e.g., missing name) show a toast notification.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Database Schema & RLS

#### Automated
- [x] 1.1 Database migration applies successfully.

#### Manual
- [x] 1.2 RLS policies verify that a user can only access their own accounts.

### Phase 2: Shared Types

#### Automated
- [ ] 2.1 Type checking passes.

### Phase 3: Astro API Endpoints

#### Automated
- [ ] 3.1 Linting passes.

#### Manual
- [ ] 3.2 Endpoints return 401 when unauthenticated.
- [ ] 3.3 Endpoints correctly read/write to the Supabase database.

### Phase 4: React Frontend

#### Automated
- [ ] 4.1 Install Shadcn components.
- [ ] 4.2 Build succeeds.

#### Manual
- [ ] 4.3 User can create a new asset and liability account.
- [ ] 4.4 User can edit an existing account's name or type.
- [ ] 4.5 User can delete an account.
- [ ] 4.6 Validation errors show a toast notification.
