import React, { useMemo, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

import { useStore } from "@nanostores/react";
import { snapshotsStore, accountsStore, storeLoading, storeError, fetchDashboardData } from "@/lib/store";

export default function NetWorthDashboard() {
  const snapshots = useStore(snapshotsStore);
  const accounts = useStore(accountsStore);
  const loading = useStore(storeLoading);
  const error = useStore(storeError);

  const [timeframe, setTimeframe] = useState("all");

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    snapshots.forEach((s) => years.add(new Date(s.created_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [snapshots]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    snapshots.forEach((s) => {
      const d = new Date(s.created_at);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [snapshots]);

  const chartData = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let filtered = sorted;
    const now = new Date().getTime();
    if (timeframe === "30days") {
      filtered = sorted.filter((s) => new Date(s.created_at).getTime() >= now - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "60days") {
      filtered = sorted.filter((s) => new Date(s.created_at).getTime() >= now - 60 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "90days") {
      filtered = sorted.filter((s) => new Date(s.created_at).getTime() >= now - 90 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "thisYear") {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
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

    return filtered.map((snap) => {
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
  }, [snapshots, accounts, timeframe]);

  if (error) {
    return <div className="text-destructive p-8 text-center">Failed to load dashboard data.</div>;
  }

  if (loading) {
    return <div className="text-muted-foreground p-8 text-center">Loading Dashboard...</div>;
  }

  if (snapshots.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        Record your first snapshot to see your net worth trend.
      </div>
    );
  }

  const currentNetWorth = chartData.length > 0 ? chartData[chartData.length - 1].netWorth : 0;
  const previousNetWorth = chartData.length > 1 ? chartData[chartData.length - 2].netWorth : null;

  let momChange = 0;
  if (previousNetWorth !== null && previousNetWorth !== 0) {
    momChange = ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">Total Net Worth</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">
              ${currentNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {previousNetWorth !== null && chartData.length > 0 && (
              <span
                className={cn(
                  "text-sm font-medium",
                  previousNetWorth === 0
                    ? "text-muted-foreground"
                    : momChange >= 0
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-red-600 dark:text-red-500",
                )}
              >
                {previousNetWorth === 0 ? "N/A" : `${momChange >= 0 ? "+" : ""}${momChange.toFixed(1)}%`}
              </span>
            )}
          </div>
        </div>

        <select
          value={timeframe}
          onChange={(e) => {
            setTimeframe(e.target.value);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          <optgroup label="Presets">
            <option value="all">All Time</option>
            <option value="30days">Last 30 Days</option>
            <option value="60days">Last 60 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="thisYear">This Year</option>
          </optgroup>
          {availableYears.length > 0 && (
            <optgroup label="By Year">
              {availableYears.map((y) => (
                <option key={`year-${y}`} value={`year-${y}`}>
                  {y}
                </option>
              ))}
            </optgroup>
          )}
          {availableMonths.length > 0 && (
            <optgroup label="By Month">
              {availableMonths.map((m) => {
                const [y, mo] = m.split("-");
                const date = new Date(Number(y), Number(mo) - 1, 1);
                const label = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
                return (
                  <option key={`month-${m}`} value={`month-${m}`}>
                    {label}
                  </option>
                );
              })}
            </optgroup>
          )}
        </select>
      </div>

      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
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
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#10b981", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No data for the selected period.
          </div>
        )}
      </div>
    </div>
  );
}
