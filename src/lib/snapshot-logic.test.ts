import { describe, it, expect } from "vitest";
import { calculateInitialBalances } from "./snapshot-logic";
import type { Account } from "@/types";
import type { SnapshotWithEntries } from "@/lib/store";

describe("calculateInitialBalances", () => {
  it("returns 0s if there is no previous snapshot", () => {
    const accounts: Account[] = [
      { id: "acc-1", user_id: "user-1", name: "Checking", type: "asset", is_active: true, created_at: "" },
      { id: "acc-2", user_id: "user-1", name: "Savings", type: "asset", is_active: true, created_at: "" },
    ];

    const result = calculateInitialBalances(accounts);

    expect(result).toEqual({
      "acc-1": "0",
      "acc-2": "0",
    });
  });

  it("carries over balances correctly from the provided latest snapshot", () => {
    const accounts: Account[] = [
      { id: "acc-1", user_id: "user-1", name: "Checking", type: "asset", is_active: true, created_at: "" },
      { id: "acc-2", user_id: "user-1", name: "Savings", type: "asset", is_active: true, created_at: "" },
    ];

    const latestSnapshot: SnapshotWithEntries = {
      id: "snap-1",
      user_id: "user-1",
      created_at: "2026-08-01",
      entries: [
        { id: "entry-1", snapshot_id: "snap-1", account_id: "acc-1", balance: 1500.5 },
        { id: "entry-2", snapshot_id: "snap-1", account_id: "acc-2", balance: 3000 },
      ],
    };

    const result = calculateInitialBalances(accounts, latestSnapshot);

    expect(result).toEqual({
      "acc-1": "1500.5",
      "acc-2": "3000",
    });
  });

  it("defaults newly added accounts to 0 while carrying over older ones", () => {
    const accounts: Account[] = [
      { id: "acc-1", user_id: "user-1", name: "Checking", type: "asset", is_active: true, created_at: "" },
      { id: "acc-2", user_id: "user-1", name: "Savings", type: "asset", is_active: true, created_at: "" },
      { id: "acc-3", user_id: "user-1", name: "Credit Card", type: "liability", is_active: true, created_at: "" },
    ];

    const latestSnapshot: SnapshotWithEntries = {
      id: "snap-1",
      user_id: "user-1",
      created_at: "2026-08-01",
      entries: [
        { id: "entry-1", snapshot_id: "snap-1", account_id: "acc-1", balance: 1500.5 },
        { id: "entry-2", snapshot_id: "snap-1", account_id: "acc-2", balance: 3000 },
      ],
    };

    const result = calculateInitialBalances(accounts, latestSnapshot);

    expect(result).toEqual({
      "acc-1": "1500.5",
      "acc-2": "3000",
      "acc-3": "0",
    });
  });
});

import { calculateChartData } from "./snapshot-logic";

describe("calculateChartData", () => {
  const mockNow = new Date("2026-09-03T12:00:00Z").getTime();

  const accounts: Account[] = [
    { id: "a1", user_id: "u1", name: "Checking", type: "asset", is_active: true, created_at: "" },
    { id: "a2", user_id: "u1", name: "Credit", type: "liability", is_active: true, created_at: "" },
  ];

  it("handles empty snapshots array gracefully", () => {
    const result = calculateChartData([], accounts, "all", mockNow);
    expect(result.chartData).toEqual([]);
    expect(result.currentNetWorth).toBe(0);
    expect(result.previousNetWorth).toBe(null);
    expect(result.momChange).toBe(0);
  });

  it("calculates basic net worth correctly", () => {
    const snaps: SnapshotWithEntries[] = [
      {
        id: "s1",
        user_id: "u1",
        created_at: "2026-08-01T12:00:00Z",
        entries: [
          { id: "e1", snapshot_id: "s1", account_id: "a1", balance: 5000 },
          { id: "e2", snapshot_id: "s1", account_id: "a2", balance: 1000 },
        ],
      },
    ];

    const result = calculateChartData(snaps, accounts, "all", mockNow);
    expect(result.chartData.length).toBe(1);
    expect(result.chartData[0].assets).toBe(5000);
    expect(result.chartData[0].liabilities).toBe(1000);
    expect(result.chartData[0].netWorth).toBe(4000);
    expect(result.currentNetWorth).toBe(4000);
    expect(result.previousNetWorth).toBe(null);
    expect(result.momChange).toBe(0);
  });

  it("calculates MoM change avoiding division by zero when previous is 0", () => {
    const snaps: SnapshotWithEntries[] = [
      {
        id: "s1",
        user_id: "u1",
        created_at: "2026-08-01T12:00:00Z",
        entries: [
          { id: "e1", snapshot_id: "s1", account_id: "a1", balance: 1000 },
          { id: "e2", snapshot_id: "s1", account_id: "a2", balance: 1000 }, // net worth 0
        ],
      },
      {
        id: "s2",
        user_id: "u1",
        created_at: "2026-09-01T12:00:00Z",
        entries: [
          { id: "e3", snapshot_id: "s2", account_id: "a1", balance: 2000 },
          { id: "e4", snapshot_id: "s2", account_id: "a2", balance: 1000 }, // net worth 1000
        ],
      },
    ];

    const result = calculateChartData(snaps, accounts, "all", mockNow);
    expect(result.previousNetWorth).toBe(0);
    expect(result.currentNetWorth).toBe(1000);
    expect(result.momChange).toBe(0); // Prevents Infinity/NaN
  });

  it("calculates MoM change correctly with a negative previous net worth", () => {
    const snaps: SnapshotWithEntries[] = [
      {
        id: "s1",
        user_id: "u1",
        created_at: "2026-08-01T12:00:00Z",
        entries: [
          { id: "e1", snapshot_id: "s1", account_id: "a1", balance: 1000 },
          { id: "e2", snapshot_id: "s1", account_id: "a2", balance: 3000 }, // net worth -2000
        ],
      },
      {
        id: "s2",
        user_id: "u1",
        created_at: "2026-09-01T12:00:00Z",
        entries: [
          { id: "e3", snapshot_id: "s2", account_id: "a1", balance: 2000 },
          { id: "e4", snapshot_id: "s2", account_id: "a2", balance: 3000 }, // net worth -1000
        ],
      },
    ];

    const result = calculateChartData(snaps, accounts, "all", mockNow);
    expect(result.previousNetWorth).toBe(-2000);
    expect(result.currentNetWorth).toBe(-1000);
    expect(result.momChange).toBe(50); // Increased by 1000 over 2000 absolute base = +50%
  });

  it("safely ignores entries for accounts that are completely missing from the store", () => {
    const snaps: SnapshotWithEntries[] = [
      {
        id: "s1",
        user_id: "u1",
        created_at: "2026-08-01T12:00:00Z",
        entries: [
          { id: "e1", snapshot_id: "s1", account_id: "a1", balance: 5000 },
          { id: "missing", snapshot_id: "s1", account_id: "a-deleted", balance: 10000 }, // missing
        ],
      },
    ];

    const result = calculateChartData(snaps, accounts, "all", mockNow);
    expect(result.chartData[0].netWorth).toBe(5000); // The 10000 is ignored
  });

  it("filters correctly by timeframe boundaries (30days)", () => {
    const snaps: SnapshotWithEntries[] = [
      { id: "s-old", user_id: "u1", created_at: "2026-07-01T12:00:00Z", entries: [] },
      { id: "s-new", user_id: "u1", created_at: "2026-08-15T12:00:00Z", entries: [] }, // Within 30 days of 2026-09-03
    ];

    const result = calculateChartData(snaps, accounts, "30days", mockNow);
    expect(result.chartData.length).toBe(1);
    expect(result.chartData[0].id).toBe("s-new");
  });

  it("filters correctly by specific month", () => {
    const snaps: SnapshotWithEntries[] = [
      { id: "s-july", user_id: "u1", created_at: "2026-07-15T12:00:00Z", entries: [] },
      { id: "s-aug", user_id: "u1", created_at: "2026-08-15T12:00:00Z", entries: [] },
    ];

    const result = calculateChartData(snaps, accounts, "month-2026-08", mockNow);
    expect(result.chartData.length).toBe(1);
    expect(result.chartData[0].id).toBe("s-aug");
  });
});
