# Test Dashboard Integration Implementation Plan

## Overview

Extract the Net Worth Dashboard chart data calculation into a pure, testable function and cover it with comprehensive unit tests using Vitest. This satisfies Phase 2 of the test plan (testing component data calculations) without violating the architectural rule of zero React component tests.

## Current State Analysis

- The `NetWorthDashboard.tsx` component tightly couples the financial calculation, timeframe filtering, and Month-over-Month (MoM) calculation within a `useMemo` hook.
- React component tests (e.g., `jsdom`) are explicitly rejected in this repository (`vitest.config.ts` is `node`-only).
- Historical net worth calculation currently works correctly even with soft-deleted accounts, because the backend fetches inactive accounts. We confirmed there is no underlying data bug.

## Desired End State

- A pure function `calculateChartData(snapshots, accounts, timeframe, now)` exists in `src/lib/snapshot-logic.ts`.
- `NetWorthDashboard.tsx` calls this function inside its `useMemo` hook, keeping the component as a thin view layer.
- `src/lib/snapshot-logic.test.ts` has tests covering calculations, missing/inactive accounts, division-by-zero MoM scenarios, and timeframe filtering.

### Key Discoveries:

- **Constraint**: `Date.now()` inside pure logic makes it untestable. We must pass `now` as an argument to `calculateChartData` from the component.
- **Pattern**: Existing pure functions live in `src/lib/snapshot-logic.ts` and are tested in `src/lib/snapshot-logic.test.ts` via Vitest.

## What We're NOT Doing

- We are NOT writing React component tests using `testing-library` or `jsdom`.
- We are NOT changing the visual rendering of the Recharts components.
- We are NOT writing E2E tests for the dashboard here (that is Phase 4 / R-06).

## Implementation Approach

By extracting the entire `chartData` map and the `momChange` calculation into a pure function, we can test all data edge cases in a fraction of a second using Vitest. We will pass a specific `now` timestamp in tests to verify the 30/60/90 days filters deterministically.

## Critical Implementation Details

- Ensure `calculateChartData` handles `snapshots.length === 0` by returning an empty array and `0` for MoM change.
- The MoM calculation logic must explicitly handle negative previous net worth (using `Math.abs(previousNetWorth)` as the denominator) and `previousNetWorth === 0` (division by zero prevention).

## Implementation Phases

### Phase 1: Refactor Logic

Extract the logic out of the React component.

- Move the `useMemo` logic from `NetWorthDashboard.tsx` into an exported function `calculateChartData(snapshots, accounts, timeframe, nowTimestamp)` in `src/lib/snapshot-logic.ts`.
- The function should return `{ chartData, currentNetWorth, previousNetWorth, momChange }`.
- Update `NetWorthDashboard.tsx` to invoke this function. Ensure the app still runs properly.

### Phase 2: Write Unit Tests

Add tests to the Vitest suite for the newly extracted logic.

- Create mock snapshot and account fixtures.
- Test `timeframe` logic: Verify `30days`, `60days`, `90days`, `thisYear`, `year-YYYY`, and `month-YYYY-MM` using a mocked `nowTimestamp`.
- Test Math & Edge cases:
  - Empty snapshots array.
  - Snapshots containing missing account IDs.
  - Division by zero MoM (e.g., previous net worth was 0).
  - Negative previous net worth.

## Progress

- [x] Phase 1: Refactor Logic — 18d1d01
- [x] Phase 2: Write Unit Tests
