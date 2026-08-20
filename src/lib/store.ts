import { atom } from "nanostores";
import type { Account, Snapshot, SnapshotEntry } from "@/types";

export type SnapshotWithEntries = Snapshot & { entries: SnapshotEntry[] };

export const accountsStore = atom<Account[]>([]);
export const snapshotsStore = atom<SnapshotWithEntries[]>([]);
export const storeLoading = atom<boolean>(true);
export const storeError = atom<boolean>(false);

let fetchPromise: Promise<void> | null = null;

export const fetchDashboardData = async (force = false) => {
  if (!force && fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    storeLoading.set(true);
    storeError.set(false);
    try {
      const [snapRes, accRes] = await Promise.all([
        fetch("/api/snapshots"),
        fetch("/api/accounts?include_inactive=true"),
      ]);
      if (!snapRes.ok || !accRes.ok) throw new Error("Fetch failed");

      const snapData = (await snapRes.json()) as SnapshotWithEntries[];
      const accData = (await accRes.json()) as Account[];

      snapshotsStore.set(snapData);
      accountsStore.set(accData);
    } catch (_err) {
      storeError.set(true);
    } finally {
      storeLoading.set(false);
    }
  })();

  return fetchPromise;
};
