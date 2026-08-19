import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { Account, Snapshot, SnapshotEntry } from "@/types";
import { Plus, Calendar } from "lucide-react";

type SnapshotWithEntries = Snapshot & { entries: SnapshotEntry[] };

export default function SnapshotManager() {
  const [snapshots, setSnapshots] = useState<SnapshotWithEntries[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [snapRes, accRes] = await Promise.all([fetch("/api/snapshots"), fetch("/api/accounts")]);

      if (!snapRes.ok) throw new Error("Failed to fetch snapshots");
      if (!accRes.ok) throw new Error("Failed to fetch accounts");

      const snapData = (await snapRes.json()) as SnapshotWithEntries[];
      const accData = (await accRes.json()) as Account[];

      setSnapshots(snapData);
      setAccounts(accData);
    } catch (_err) {
      toast.error("Could not load snapshot data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Toaster />
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Balance Snapshots</h2>
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (open) void fetchData();
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={accounts.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Record Snapshot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Today&apos;s Balances</DialogTitle>
            </DialogHeader>
            <SnapshotForm
              accounts={accounts}
              onSuccess={() => {
                setIsAddOpen(false);
                void fetchData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-muted-foreground py-8 text-center">Loading...</div>
      ) : (
        <SnapshotList snapshots={snapshots} />
      )}
    </div>
  );
}

function SnapshotList({ snapshots }: { snapshots: SnapshotWithEntries[] }) {
  if (snapshots.length === 0) {
    return <div className="text-muted-foreground italic">No snapshots recorded yet.</div>;
  }

  return (
    <div className="space-y-3">
      {snapshots.map((snapshot) => (
        <div
          key={snapshot.id}
          className="bg-card text-card-foreground flex items-center justify-between rounded-lg border p-4 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <Calendar className="text-muted-foreground h-5 w-5" />
            <span className="font-medium">
              {new Date(snapshot.created_at).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="text-muted-foreground text-sm">{snapshot.entries.length} accounts recorded</div>
        </div>
      ))}
    </div>
  );
}

function SnapshotForm({ accounts, onSuccess }: { accounts: Account[]; onSuccess: () => void }) {
  // Store balances as strings to allow empty inputs while typing
  const [balances, setBalances] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = accounts.map((acc) => ({
      account_id: acc.id,
      balance: parseFloat(balances[acc.id] ?? "0"),
    }));

    try {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errorData = await res.json().catch(() => null);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const msg = String(errorData?.error?.[0]?.message ?? errorData?.error ?? "Failed to save snapshot");
        throw new Error(msg);
      }

      toast.success("Snapshot recorded successfully!");
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error(String(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = accounts.every((acc) => balances[acc.id] !== undefined && balances[acc.id] !== "");

  const assets = accounts.filter((a) => a.type === "asset");
  const liabilities = accounts.filter((a) => a.type === "liability");

  const renderInputs = (items: Account[]) => {
    if (items.length === 0) return <div className="text-muted-foreground text-sm italic">None</div>;
    return (
      <div className="space-y-3">
        {items.map((acc) => (
          <div key={acc.id} className="flex items-center justify-between gap-4">
            <label className="flex-1 truncate text-sm font-medium" title={acc.name}>
              {acc.name}
            </label>
            <div className="relative w-32">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">$</span>
              <input
                type="number"
                step="0.01"
                value={balances[acc.id] ?? ""}
                onChange={(e) => {
                  setBalances((prev) => ({ ...prev, [acc.id]: e.target.value }));
                }}
                className="bg-background w-full rounded-md border p-2 pl-7 text-right"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-h-[70vh] space-y-6 overflow-y-auto px-1 pt-4">
      <div>
        <h3 className="mb-3 font-semibold text-green-600 dark:text-green-400">Assets</h3>
        {renderInputs(assets)}
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-red-600 dark:text-red-400">Liabilities</h3>
        {renderInputs(liabilities)}
      </div>

      <div className="bg-background/95 sticky bottom-0 flex justify-end border-t py-4 pt-4 backdrop-blur">
        <Button type="submit" disabled={isSubmitting || !isComplete}>
          {isSubmitting ? "Saving..." : "Save Snapshot"}
        </Button>
      </div>
    </form>
  );
}
