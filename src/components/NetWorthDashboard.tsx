import React, { useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

import { useStore } from "@nanostores/react";
import { snapshotsStore, accountsStore, storeLoading, storeError, fetchDashboardData } from "@/lib/store";

export default function NetWorthDashboard() {
  const snapshots = useStore(snapshotsStore);
  const accounts = useStore(accountsStore);
  const loading = useStore(storeLoading);
  const error = useStore(storeError);

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const chartData = useMemo(() => {
    // Snapshots API returns them ordered by created_at DESC (newest first).
    // We reverse it for chronological order in the chart.
    const sorted = [...snapshots].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Create a map for quick account lookup
    const accountTypeMap = new Map(accounts.map((a) => [a.id, a.type]));

    return sorted.map((snap) => {
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
  }, [snapshots, accounts]);

  if (error) {
    return <div className="text-destructive p-8 text-center">Failed to load dashboard data.</div>;
  }

  if (loading) {
    return <div className="text-muted-foreground p-8 text-center">Loading Dashboard...</div>;
  }

  if (chartData.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        Record your first snapshot to see your net worth trend.
      </div>
    );
  }

  const currentNetWorth = chartData[chartData.length - 1].netWorth;
  const previousNetWorth = chartData.length > 1 ? chartData[chartData.length - 2].netWorth : null;

  let momChange = 0;
  if (previousNetWorth !== null && previousNetWorth !== 0) {
    momChange = ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">Total Net Worth</h2>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold">
            ${currentNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {previousNetWorth !== null && (
            <span
              className={cn(
                "text-sm font-medium",
                previousNetWorth === 0
                  ? "text-muted-foreground"
                  : momChange >= 0
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500",
              )}
            >
              {previousNetWorth === 0 ? "N/A" : `${momChange >= 0 ? "+" : ""}${momChange.toFixed(1)}% MoM`}
            </span>
          )}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Net Worth"]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              itemStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "bold" }}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#8b5cf6", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
