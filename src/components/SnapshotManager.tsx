import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { Account, Snapshot, SnapshotEntry } from "@/types";
import { Plus, Calendar, Pencil, Trash2 } from "lucide-react";

type SnapshotWithEntries = Snapshot & { entries: SnapshotEntry[] };

export default function SnapshotManager() {
  const [snapshots, setSnapshots] = useState<SnapshotWithEntries[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState<SnapshotWithEntries | undefined>(undefined);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;
    try {
      const res = await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete snapshot");
      toast.success("Snapshot deleted");
      void fetchData();
    } catch (_err) {
      toast.error("Failed to delete snapshot");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Toaster />
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Balance Snapshots</h2>
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) setEditingSnapshot(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button
              disabled={accounts.length === 0}
              onClick={() => {
                setIsAddOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Record Snapshot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSnapshot ? "Edit Balances" : "Record Balances"}</DialogTitle>
            </DialogHeader>
            <SnapshotForm
              accounts={accounts}
              initialSnapshot={editingSnapshot}
              onSuccess={() => {
                setIsAddOpen(false);
                setEditingSnapshot(undefined);
                void fetchData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-muted-foreground py-8 text-center">Loading...</div>
      ) : (
        <SnapshotList
          snapshots={snapshots}
          onDelete={handleDelete}
          onEdit={(s) => {
            setEditingSnapshot(s);
            setIsAddOpen(true);
          }}
        />
      )}
    </div>
  );
}

function SnapshotList({
  snapshots,
  onDelete,
  onEdit,
}: {
  snapshots: SnapshotWithEntries[];
  onDelete: (id: string) => void;
  onEdit: (s: SnapshotWithEntries) => void;
}) {
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
          <div className="flex items-center space-x-4">
            <div className="text-muted-foreground text-sm">{snapshot.entries.length} accounts recorded</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onEdit(snapshot);
              }}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                onDelete(snapshot.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SnapshotForm({
  accounts,
  onSuccess,
  initialSnapshot,
}: {
  accounts: Account[];
  onSuccess: () => void;
  initialSnapshot?: SnapshotWithEntries;
}) {
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getInitialDateStr = () => {
    if (!initialSnapshot) return getTodayStr();
    const d = new Date(initialSnapshot.created_at);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getInitialBalances = () => {
    if (!initialSnapshot) return {};
    const b: Record<string, string> = {};
    initialSnapshot.entries.forEach((e) => {
      b[e.account_id] = e.balance.toString();
    });
    return b;
  };

  const [date, setDate] = useState(getInitialDateStr());
  // Store balances as strings to allow empty inputs while typing
  const [balances, setBalances] = useState<Record<string, string | undefined>>(getInitialBalances());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const entries = Object.keys(balances).map((accountId) => ({
      account_id: accountId,
      balance: parseFloat(balances[accountId] ?? "0"),
    }));

    try {
      const url = initialSnapshot ? `/api/snapshots/${initialSnapshot.id}` : "/api/snapshots";
      const method = initialSnapshot ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, entries }),
      });

      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errorData = await res.json().catch(() => null);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const msg = String(errorData?.error?.[0]?.message ?? errorData?.error ?? "Failed to save snapshot");
        throw new Error(msg);
      }

      toast.success(initialSnapshot ? "Snapshot updated successfully!" : "Snapshot recorded successfully!");
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

  // Allow saving if all existing active accounts have balances (when creating).
  // When editing, all rendered inputs must have balances.

  const renderedAccounts = React.useMemo(() => {
    const accMap = new Map(accounts.map((a) => [a.id, a]));
    if (initialSnapshot) {
      initialSnapshot.entries.forEach((e) => {
        if (!accMap.has(e.account_id)) {
          // Should fetch or handle deleted accounts, but for now just use what's in state
        }
      });
    }
    // We'll just render active accounts for now, but also include accounts that are in the snapshot but inactive
    // Wait, the parent component only fetches `is_active=true` accounts.
    return accounts;
  }, [accounts, initialSnapshot]);

  const isComplete = renderedAccounts.every((acc) => balances[acc.id] !== undefined && balances[acc.id] !== "");

  const assets = renderedAccounts.filter((a) => a.type === "asset");
  const liabilities = renderedAccounts.filter((a) => a.type === "liability");

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
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="max-h-[70vh] space-y-6 overflow-y-auto px-1 pt-4"
    >
      <div>
        <h3 className="mb-3 font-semibold">Date</h3>
        <input
          type="date"
          value={date}
          max={getTodayStr()}
          onChange={(e) => {
            setDate(e.target.value);
          }}
          required
          className="bg-background w-full rounded-md border p-2 text-sm"
        />
      </div>

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
