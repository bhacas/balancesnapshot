export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: "asset" | "liability";
  is_active: boolean;
  created_at: string;
}

export interface Snapshot {
  id: string;
  user_id: string;
  created_at: string;
}

export interface SnapshotEntry {
  id: string;
  snapshot_id: string;
  account_id: string;
  balance: number;
}
