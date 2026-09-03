# test-accounts-api Implementation Plan

## Overview

Implement true HTTP integration tests for the Account management and Snapshot API routes using Playwright API testing. This will cover risks R-04 (Account Misclassification) and R-05 (SSR Route Failures). As part of this change, we will patch the discovered 500-crash and info-leak vulnerabilities in the API endpoints and write tests verifying cross-user authorization boundaries (IDOR prevention).

## Current State Analysis

- The Astro API routes in `src/pages/api/` handle requests directly with raw `Request`/`Response` objects and communicate with Supabase.
- No integration tests exist for these API routes.
- A date validation vulnerability in `src/pages/api/snapshots/index.ts` allows malformed strings to crash the Postgres RPC, returning a 500 status.
- Raw Postgres error messages are leaked to the client upon database failure.
- Authorization relies entirely on Supabase RLS, which is untested at the API level.

## Desired End State

- A robust Playwright API testing suite running against the Astro dev server.
- The date validation and info-leak vulnerabilities in the snapshots API routes are patched.
- Comprehensive integration tests verifying account CRUD, soft-deletion, and strict Zod validation.
- Cross-user tests confirming that attempting to read, update, or delete another user's accounts or snapshots yields empty results or a 401/403, validating RLS policies.

### Key Discoveries:

- [src/pages/api/snapshots/index.ts:72](https://github.com/bhacas/BalanceSnapshot/blob/d4cdcb2b9b274e33beb9c63ae26c993756ebcdb1/src/pages/api/snapshots/index.ts#L72) - Vulnerable date validation.
- API endpoints expose `error.message` on failure, leaking db schema details.
- Playwright API testing (`@playwright/test`) is already installed in the repo as a dev dependency.

## What We're NOT Doing

- Not converting the API routes into pure functions; we are strictly adding integration tests via HTTP.
- Not writing E2E UI browser tests (that's Phase 4 of the test plan).
- Not refactoring the Supabase RLS policies themselves; we are only testing that they enforce the API boundaries correctly.

## Implementation Approach

1. Configure `@playwright/test` for API testing specifically, defining a separate project or config to run tests against the running local dev server (`http://localhost:4321/api`).
2. Implement auth helpers that can provision distinct test users in the local Supabase emulator, or mock the `createClient` auth flow in a test environment if hitting a live emulator is unfeasible.
3. Update `snapshots/index.ts` to use `z.string().datetime()` for rigorous date validation and replace raw `error.message` returns with generic "Internal Server Error" messages on 500s.
4. Write test suites for both `accounts` and `snapshots` endpoints asserting standard behavior, validation rules, and cross-user data isolation.

## Critical Implementation Details

- **Playwright Config**: Define `baseURL: 'http://localhost:4321'` in Playwright config and configure a `webServer` block to automatically start Astro before tests (`npm run dev`).
- **Auth Provisioning**: Since hitting an actual Supabase instance in CI/tests can be tricky, ensure we have a reliable mechanism to authenticate API requests. If a local Supabase stack is running, use its auth endpoints to generate JWTs for the tests.
- **Error Obfuscation**: Do not blindly remove error logging; log `error.message` to `console.error` for server-side debugging, but return `{ error: "Internal Server Error" }` to the client.

## Progress

### Phase 1: Playwright Setup & Auth Fixtures

- [x] Configure `playwright.config.ts` for API testing with a `webServer` block pointing to `npm run dev`. — 196d4b6
- [x] Create an API request helper utility to fetch authenticated JWT tokens for multiple test users. — 196d4b6

### Phase 2: Fix API Vulnerabilities (R-05)

- [x] Update Zod schema in `src/pages/api/snapshots/index.ts` to strictly validate `date` inputs. — 69a98e2
- [x] Sanitize 500 error responses in `src/pages/api/snapshots/index.ts` and `src/pages/api/snapshots/[id].ts` to avoid leaking database messages. — 69a98e2

### Phase 3: Test Accounts CRUD & Auth Boundaries

- [x] Write integration test for Account Creation (POST) including Zod validation failures (R-04). — 4108380
- [x] Write integration test for Account Soft-Deletion (DELETE) and ensuring `GET` filters inactive accounts. — 4108380
- [x] Write cross-user auth boundary tests proving User B cannot edit/delete User A's accounts. — 4108380

### Phase 4: Test Snapshots SSR Routes

- [x] Write integration tests for Snapshot standard CRUD operations. — aabaad8
- [x] Write tests verifying the date validation bug fix (assert 400 Bad Request instead of 500). — aabaad8

### Addendum
- Unplanned change: Explicitly pass `p_date: date || null` to Supabase RPCs `create_snapshot_with_entries` and `update_snapshot_with_entries` to workaround a PostgREST function overloading / schema cache bug that caused 500 errors.
- Unplanned change: Added a basic API auth smoke test (`setup.api.ts`) and Playwright `.gitignore` entries, necessary for the test suite setup.
