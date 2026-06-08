import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { Account } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function AccountsManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json() as Account[];
      setAccounts(data);
    } catch (err) {
      toast.error('Could not load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Account deleted');
      void fetchAccounts();
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const assets = accounts.filter(a => a.type === 'asset');
  const liabilities = accounts.filter(a => a.type === 'liability');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Accounts</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <AccountForm 
              onSuccess={() => { setIsAddOpen(false); void fetchAccounts(); }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading accounts...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">Assets</h2>
            <AccountList 
              items={assets} 
              onEdit={setEditAccount} 
              onDelete={handleDelete} 
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Liabilities</h2>
            <AccountList 
              items={liabilities} 
              onEdit={setEditAccount} 
              onDelete={handleDelete} 
            />
          </div>
        </div>
      )}

      <Dialog open={!!editAccount} onOpenChange={(open) => !open && setEditAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          {editAccount && (
            <AccountForm 
              initialData={editAccount}
              onSuccess={() => { setEditAccount(null); void fetchAccounts(); }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountList({ items, onEdit, onDelete }: { items: Account[], onEdit: (a: Account) => void, onDelete: (id: string) => void }) {
  if (items.length === 0) return <div className="text-muted-foreground italic">No accounts found.</div>;
  
  return (
    <div className="space-y-3">
      {items.map(account => (
        <div key={account.id} className="flex justify-between items-center p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
          <span className="font-medium">{account.name}</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(account)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onDelete(account.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Account }) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<'asset'|'liability'>(initialData?.type || 'asset');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/api/accounts/${initialData.id}` : '/api/accounts';
      const method = initialData ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });
      
      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errorData = await res.json().catch(() => null);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new Error(errorData?.error?.[0]?.message || errorData?.error || 'Failed to save account');
      }
      
      toast.success(`Account ${initialData ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 pt-4">
      <div>
        <label className="block text-sm font-medium mb-1">Account Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md bg-background"
          placeholder="e.g. Chase Checking"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Account Type</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as 'asset'|'liability')}
          className="w-full p-2 border rounded-md bg-background"
        >
          <option value="asset">Asset (Bank, Brokerage, etc.)</option>
          <option value="liability">Liability (Credit Card, Loan, etc.)</option>
        </select>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? 'Saving...' : 'Save Account'}
        </Button>
      </div>
    </form>
  );
}
