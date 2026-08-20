import React, { useState, useEffect, useMemo } from "react";
import type { Account, Snapshot, SnapshotEntry } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type SnapshotWithEntries = Snapshot & { entries: SnapshotEntry[] };

export default function NetWorthDashboard() {
  const [snapshots, setSnapshots] = useState<SnapshotWithEntries[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [snapRes, accRes] = await Promise.all([fetch("/api/snapshots"), fetch("/api/accounts")]);
        if (!snapRes.ok || !accRes.ok) throw new Error("Failed to fetch data");
        const snapData = (await snapRes.json()) as SnapshotWithEntries[];
        const accData = (await accRes.json()) as Account[];
        setSnapshots(snapData);
        setAccounts(accData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
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

  if (loading) {
    return <div className="p-8 text-center text-black">Loading Dashboard...</div>;
  }

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
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
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Net Worth</h2>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold">
            ${currentNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {previousNetWorth !== null && (
            <span className={`text-sm font-medium ${momChange >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
              {momChange >= 0 ? "+" : ""}{momChange.toFixed(1)}% MoM
            </span>
          )}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Net Worth"]}
              contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#000" }}
              itemStyle={{ color: "#000", fontWeight: "bold" }}
            />
            <Line 
              type="monotone" 
              dataKey="netWorth" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
