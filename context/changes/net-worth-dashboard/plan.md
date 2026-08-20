# Net Worth Dashboard Implementation Plan

## Overview

We are building a Net Worth Dashboard component (S-04) that aggregates the user's financial snapshots into a total net worth and visualizes the trend over time. This provides the core value of the product: showing wealth-building progress without transaction friction.

## Current State Analysis

- **Accounts:** Available via `/api/accounts` (each account is either an `asset` or `liability`).
- **Snapshots:** Available via `/api/snapshots` (each snapshot contains `entries` with an `account_id` and `balance`).
- **Dashboard:** Currently renders `AccountsManager` and `SnapshotManager`. There is no top-level visual aggregation.
- **Dependencies:** No charting library is currently installed.

## Desired End State

- The user sees their current Total Net Worth and a Month-over-Month percentage change on the dashboard.
- A Line chart displays the Net Worth trend over time.
- Net Worth is calculated client-side by joining accounts and snapshot entries.

### Key Discoveries:

- **Missing Balances:** Snapshots already require an entry for all active accounts upon creation (enforced by the backend). For newly added accounts, historical snapshots simply won't have an entry for them, which correctly means their historical balance was effectively $0.
- **Calculation Rule:** Net Worth = `Sum of Assets - Sum of Liabilities`.

## What We're NOT Doing

- Server-side calculation of net worth (this is deferred to keep the backend simple and fast).
- Advanced charts like Stacked Area charts.
- Calculating or storing historical net worth in the database.

## Implementation Approach

1. Install `recharts` for visualization.
2. Create `NetWorthDashboard.tsx` to fetch accounts and snapshots.
3. Compute the net worth for each snapshot sequentially.
4. Calculate the MoM change between the two most recent snapshots.
5. Render the metrics and a Line chart.
6. Insert the component at the top of `src/pages/dashboard.astro`.

## Critical Implementation Details

- **Data Fetching:** Fetch both `/api/accounts` and `/api/snapshots` in the `NetWorthDashboard` component. We must wait for both before computing.
- **Aggregation Logic:** For a given snapshot, iterate its `entries`. Find the corresponding account type from the accounts list. If `asset`, add to the total. If `liability`, subtract.
- **MoM Calculation:** Only calculate if there are at least two snapshots. Handle division by zero if the previous net worth was 0.
- **Chart Formatting:** Format the X-axis of the chart to show readable dates (e.g., "MMM YYYY") and format Y-axis values as currency.

## Progress

### Phase 1: Setup Dependencies
- [x] Install `recharts` dependency — c934ed5

### Phase 2: Data Aggregation & Calculation
- [x] Create `src/components/NetWorthDashboard.tsx`
- [x] Implement data fetching for `/api/accounts` and `/api/snapshots`
- [x] Implement net worth and MoM calculations

### Phase 3: Visualization & UI
- [ ] Render the Total Net Worth and MoM percentage
- [ ] Implement the `recharts` Line chart

### Phase 4: Integration
- [ ] Mount `NetWorthDashboard` in `src/pages/dashboard.astro`
