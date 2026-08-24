import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { Account } from "@/types";
import { Pencil, Trash2, Plus } from "lucide-react";

import { useStore } from "@nanostores/react";
import { accountsStore, storeLoading, fetchDashboardData } from "@/lib/store";

export default function AccountsManager() {
  const allAccounts = useStore(accountsStore);
  const loading = useStore(storeLoading);
  const accounts = allAccounts.filter((a) => a.is_active);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const fetchAccounts = async (force = false) => {
    try {
      await fetchDashboardData(force);
    } catch (_err) {
      toast.error("Could not load accounts");
    }
  };

  useEffect(() => {
    void fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Account deleted");
      void fetchAccounts(true);
    } catch (_err) {
      toast.error("Failed to delete account");
    }
  };

  const assets = accounts.filter((a) => a.type === "asset");
  const liabilities = accounts.filter((a) => a.type === "liability");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Toaster />
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Accounts</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <AccountForm
              onSuccess={() => {
                setIsAddOpen(false);
                void fetchAccounts(true);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading accounts...</div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-green-600 dark:text-green-400">Assets</h2>
            <AccountList items={assets} onEdit={setEditAccount} onDelete={handleDelete} />
          </div>
          <div>
            <h2 className="mb-4 text-xl font-semibold text-red-600 dark:text-red-400">Liabilities</h2>
            <AccountList items={liabilities} onEdit={setEditAccount} onDelete={handleDelete} />
          </div>
        </div>
      )}

      <Dialog
        open={!!editAccount}
        onOpenChange={(open) => {
          if (!open) setEditAccount(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          {editAccount && (
            <AccountForm
              initialData={editAccount}
              onSuccess={() => {
                setEditAccount(null);
                void fetchAccounts(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountList({
  items,
  onEdit,
  onDelete,
}: {
  items: Account[];
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) return <div className="text-muted-foreground italic">No accounts found.</div>;

  return (
    <div className="space-y-3">
      {items.map((account) => (
        <div
          key={account.id}
          className="bg-card text-card-foreground flex items-center justify-between rounded-lg border p-4 shadow-sm"
        >
          <span className="font-medium">{account.name}</span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                onEdit(account);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                onDelete(account.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: Account }) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<"asset" | "liability">(initialData?.type ?? "asset");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/api/accounts/${initialData.id}` : "/api/accounts";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });

      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errorData = await res.json().catch(() => null);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const msg = String(errorData?.error?.[0]?.message ?? errorData?.error ?? "Failed to save account");
        throw new Error(msg);
      }

      toast.success(`Account ${initialData ? "updated" : "created"} successfully`);
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

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 pt-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Account Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          className="bg-background w-full rounded-md border p-2"
          placeholder="e.g. Chase Checking"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Account Type</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as "asset" | "liability");
          }}
          className="bg-background w-full rounded-md border p-2"
        >
          <option value="asset">Asset (Bank, Brokerage, etc.)</option>
          <option value="liability">Liability (Credit Card, Loan, etc.)</option>
        </select>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "Saving..." : "Save Account"}
        </Button>
      </div>
    </form>
  );
}
