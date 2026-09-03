---
date: 2026-09-03T14:11:31+02:00
researcher: Antigravity
git_commit: e330bac27432b75385bc9211d9caed32aa4159ff
branch: master
repository: bhacas/balancesnapshot
topic: "test-dashboard-integration"
tags: [research, dashboard, testing, playwright, vitest]
status: complete
last_updated: 2026-09-03
last_updated_by: Antigravity
---

# Research: test-dashboard-integration

**Date**: 2026-09-03T14:11:31+02:00
**Researcher**: Antigravity
**Git Commit**: e330bac27432b75385bc9211d9caed32aa4159ff
**Branch**: master
**Repository**: bhacas/balancesnapshot

## Research Question

Analyze `NetWorthDashboard.tsx` for calculations, stability, and testing patterns to inform Phase 2 testing.

## Summary

The dashboard computes net worth entirely on the client, mapping snapshot entries to account types. While rendering and edge-case handling (empty states, division by zero) are robust, there is a silent data logic issue where deleted accounts cause historical net worth to be skewed. For testing, the project has explicitly avoided component-level testing (e.g., `jsdom`) in favor of pure logic testing via Vitest and E2E testing via Playwright.

## Detailed Findings

### Dashboard Calculation & Stability
- **Dependencies**: Uses `snapshotsStore`, `accountsStore`, `storeLoading`, and `storeError` from `@/lib/store` ([`src/components/NetWorthDashboard.tsx:7`](https://github.com/bhacas/balancesnapshot/blob/e330bac27432b75385bc9211d9caed32aa4159ff/src/components/NetWorthDashboard.tsx#L7)).
- **Net Worth Calculation**: Iterates over snapshot entries, referencing an `accountTypeMap`. Assets are added, liabilities are subtracted ([`src/components/NetWorthDashboard.tsx:69-75`](https://github.com/bhacas/balancesnapshot/blob/e330bac27432b75385bc9211d9caed32aa4159ff/src/components/NetWorthDashboard.tsx#L69-L75)).
- **Edge Cases**:
  - **Missing/Deleted Accounts**: If an account in a snapshot no longer exists in `accountsStore`, it is silently skipped. This corrupts historical net worth displays.
  - **Empty States**: Handled gracefully. If `snapshots.length === 0`, a fallback is shown ([`src/components/NetWorthDashboard.tsx:95`](https://github.com/bhacas/balancesnapshot/blob/e330bac27432b75385bc9211d9caed32aa4159ff/src/components/NetWorthDashboard.tsx#L95)). Month-over-Month calculation avoids division-by-zero ([`src/components/NetWorthDashboard.tsx:107`](https://github.com/bhacas/balancesnapshot/blob/e330bac27432b75385bc9211d9caed32aa4159ff/src/components/NetWorthDashboard.tsx#L107)).

### Testing Patterns
- **Vitest Configuration**: `vitest.config.ts` specifies `environment: "node"`. There is no `jsdom` or `happy-dom`.
- **Precedent**: The historical decision in `context/archive/2026-08-26-test-bootstrap-snapshot-logic/plan.md` explicitly opted out of component testing in Vitest, favoring testing pure logic functions instead.
- **E2E Approach**: The preferred way to test UI interactions and integration is via Playwright, as seen in `tests/e2e/account-persistence.spec.ts` and the `test-plan.md` update (Phase 4).

## Architecture Insights

The application strongly favors extracting business logic into pure functions (e.g., `calculateInitialBalances`) for unit testing, and keeping React components as thin view layers that read from Nano Stores. Component-level testing is not part of the established stack.

## Historical Context (from prior changes)

- `context/archive/2026-08-20-net-worth-dashboard/plan.md` - Established the client-side calculation architecture and Recharts integration.
- `context/archive/2026-08-26-test-bootstrap-snapshot-logic/plan.md` - Established the Node-only Vitest pattern and pure function extraction strategy, rejecting React component tests.

## Open Questions

- **Missing Accounts Bug**: Should we fix the silent failure for deleted accounts within this change, or create a separate bug report?
- **Testing Layer**: Since component testing is explicitly excluded, should Phase 2 (`test-dashboard-integration`) be refactored into extracting the calculation logic from `NetWorthDashboard` into a pure function (e.g. `calculateNetWorth`) and unit testing it via Vitest?
