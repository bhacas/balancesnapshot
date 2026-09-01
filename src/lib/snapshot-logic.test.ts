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
