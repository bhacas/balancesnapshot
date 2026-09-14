---
date: 2026-09-03T12:42:02Z
researcher: Antigravity
git_commit: d4cdcb2b9b274e33beb9c63ae26c993756ebcdb1
branch: master
repository: bhacas/BalanceSnapshot
topic: "test-accounts-api"
tags: [research, codebase, api, ssr, tests]
status: complete
last_updated: 2026-09-03
last_updated_by: Antigravity
---

# Research: test-accounts-api

**Date**: 2026-09-03T12:42:02Z
**Researcher**: Antigravity
**Git Commit**: d4cdcb2b9b274e33beb9c63ae26c993756ebcdb1
**Branch**: master
**Repository**: bhacas/BalanceSnapshot

## Research Question

test-accounts-api (Account CRUD API routes and SSR error handling / R-04 and R-05)

## Summary

The API routes in `src/pages/api/` handle Account and Snapshot operations.

- **Account CRUD (R-04)**: Accounts are validated robustly using Zod (`z.enum(["asset", "liability"])`) ensuring misclassification at the API boundary is impossible.
- **SSR Route Failures (R-05)**: There are notable issues in the API routes that can lead to 500 errors in Cloudflare. Missing env vars correctly trigger a 500, but there's an issue where malformed dates bypass Zod validation (using `.optional()`) and crash the underlying Postgres RPC, returning a 500. Error handling also leaks raw Postgres error messages to the client.
- **Testing Pattern**: There are currently no API/Integration tests configured for Astro endpoints in this repo. Testing API routes will require configuring Vitest (or a similar tool) to hit the endpoints, or factoring out the route logic into testable controller functions, or using Playwright API testing.

## Detailed Findings

### Account CRUD Operations

- **Creation**: `src/pages/api/accounts/index.ts` (POST) relies on Zod `accountSchema` to enforce `type: z.enum(["asset", "liability"])`.
- **Editing**: `src/pages/api/accounts/[id].ts` (PUT) uses the exact same schema.
- **Deletion**: The `DELETE` method performs a soft delete by setting `is_active: false` in Supabase. The `GET` method successfully filters out inactive accounts by default unless `include_inactive` is present in the query string.

### SSR Endpoint Failures & Error Handling

- **Database / RPC Exceptions**: If a Supabase query fails, it explicitly returns a 500 status but unfortunately exposes the raw `error.message` to the client, which is an information leakage risk.
- **Date Validation Crash**: In `src/pages/api/snapshots/index.ts`, `date` is checked via `new Date(date) > new Date()`. An invalid string evaluates to `Invalid Date`, the condition evaluates to `false`, and the invalid string is passed to the Postgres RPC, crashing it and resulting in a 500 instead of a 400 Bad Request.
- **IDOR Risk**: The API routes do not explicitly enforce authorization ownership on `UPDATE`/`DELETE`. They rely 100% on Supabase Row Level Security (RLS) policies.

## Code References

- [src/pages/api/accounts/index.ts:41-86](https://github.com/bhacas/BalanceSnapshot/blob/d4cdcb2b9b274e33beb9c63ae26c993756ebcdb1/src/pages/api/accounts/index.ts#L41-L86) - Account Creation logic and Zod validation.
- [src/pages/api/accounts/[id].ts:63-89](https://github.com/bhacas/BalanceSnapshot/blob/d4cdcb2b9b274e33beb9c63ae26c993756ebcdb1/src/pages/api/accounts/[id].ts#L63-L89) - Soft deletion of accounts (`is_active: false`).
- [src/pages/api/snapshots/index.ts:72](https://github.com/bhacas/BalanceSnapshot/blob/d4cdcb2b9b274e33beb9c63ae26c993756ebcdb1/src/pages/api/snapshots/index.ts#L72) - Date validation vulnerability that crashes the Postgres RPC.

## Architecture Insights

The API routes follow a very thin controller pattern, extracting auth from the request headers via `createClient`, validating the body via Zod, and then directly issuing Supabase queries. Because the logic is not abstracted away from the `Request`/`Response` API, unit testing them requires mocking the standard web `Request` object and Supabase client, or spinning up an integration test runner that hits them over HTTP.

## Historical Context (from prior changes)

- `context/archive/2026-08-26-test-bootstrap-snapshot-logic/plan.md` - Bootstrapped Vitest for pure functions in Node environment. Does not cover Astro API routes.
- `context/foundation/test-plan.md` - R-04 and R-05 identify the accounts API and SSR failures as integration testing targets.

## Open Questions

- What is the preferred method for testing these Astro endpoints? Should we mock `Request` and `Response` and call the handlers directly with a mocked Supabase client, or should we use Playwright API testing to hit them over HTTP in an integration environment?
