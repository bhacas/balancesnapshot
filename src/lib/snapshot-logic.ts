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

export interface ChartDataPoint {
  id: string;
  date: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

export interface DashboardCalculationResult {
  chartData: ChartDataPoint[];
  currentNetWorth: number;
  previousNetWorth: number | null;
  momChange: number;
}

export function calculateChartData(
  snapshots: SnapshotWithEntries[],
  accounts: Account[],
  timeframe: string,
  nowTimestamp: number,
): DashboardCalculationResult {
  const sorted = [...snapshots].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let filtered = sorted;
  if (timeframe === "30days") {
    filtered = sorted.filter((s) => new Date(s.created_at).getTime() >= nowTimestamp - 30 * 24 * 60 * 60 * 1000);
  } else if (timeframe === "60days") {
    filtered = sorted.filter((s) => new Date(s.created_at).getTime() >= nowTimestamp - 60 * 24 * 60 * 60 * 1000);
  } else if (timeframe === "90days") {
    filtered = sorted.filter((s) => new Date(s.created_at).getTime() >= nowTimestamp - 90 * 24 * 60 * 60 * 1000);
  } else if (timeframe === "thisYear") {
    const startOfYear = new Date(new Date(nowTimestamp).getFullYear(), 0, 1).getTime();
    filtered = sorted.filter((s) => new Date(s.created_at).getTime() >= startOfYear);
  } else if (timeframe.startsWith("year-")) {
    const year = parseInt(timeframe.split("-")[1], 10);
    filtered = sorted.filter((s) => new Date(s.created_at).getFullYear() === year);
  } else if (timeframe.startsWith("month-")) {
    const [, y, m] = timeframe.split("-");
    const year = parseInt(y, 10);
    const month = parseInt(m, 10) - 1;
    filtered = sorted.filter((s) => {
      const d = new Date(s.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  const accountTypeMap = new Map(accounts.map((a) => [a.id, a.type]));

  const chartData = filtered.map((snap) => {
    let assets = 0;
    let liabilities = 0;

    snap.entries.forEach((entry) => {
      const type = accountTypeMap.get(entry.account_id);
      if (type === "asset") assets += entry.balance;
      if (type === "liability") liabilities += entry.balance;
    });

    const netWorth = assets - liabilities;

    return {
      id: snap.id,
      date: new Date(snap.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      netWorth,
      assets,
      liabilities,
    };
  });

  const currentNetWorth = chartData.length > 0 ? chartData[chartData.length - 1].netWorth : 0;
  const previousNetWorth = chartData.length > 1 ? chartData[chartData.length - 2].netWorth : null;

  let momChange = 0;
  if (previousNetWorth !== null && previousNetWorth !== 0) {
    momChange = ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100;
  }

  return { chartData, currentNetWorth, previousNetWorth, momChange };
}
