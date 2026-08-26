import type { Account } from "@/types";
import type { SnapshotWithEntries } from "@/lib/store";

export function calculateInitialBalances(
  accounts: Account[],
  latestSnapshot?: SnapshotWithEntries,
): Record<string, string> {
  const result: Record<string, string> = {};

  if (!latestSnapshot) {
    accounts.forEach((acc) => {
      result[acc.id] = "0";
    });
    return result;
  }

  const previousBalances = new Map<string, number>();
  latestSnapshot.entries.forEach((entry) => {
    previousBalances.set(entry.account_id, entry.balance);
  });

  accounts.forEach((acc) => {
    if (previousBalances.has(acc.id)) {
      const prev = previousBalances.get(acc.id);
      result[acc.id] = prev !== undefined ? prev.toString() : "0";
    } else {
      result[acc.id] = "0";
    }
  });

  return result;
}
