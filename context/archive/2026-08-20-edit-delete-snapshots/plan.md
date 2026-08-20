# Edit and Delete Snapshots Implementation Plan

## Overview
Implement the ability to edit existing snapshots and delete them. This gives users control over historical records if they made a mistake.

## Current State Analysis
- Users can create snapshots.
- `SnapshotManager.tsx` lists the snapshots.
- No UI or API to edit or delete snapshots.
- Supabase schema supports `DELETE` with CASCADE on `snapshot_entries`.

## Desired End State
- API endpoint `DELETE /api/snapshots/[id]` to delete a snapshot.
- API endpoint `PUT /api/snapshots/[id]` to update a snapshot's date and entries.
- UI allows deleting a snapshot with a confirmation dialog.
- UI allows editing a snapshot, reusing the form with pre-filled values.

## Implementation Approach
- Add `src/pages/api/snapshots/[id].ts` with `DELETE` and `PUT` methods.
- Update `SnapshotManager.tsx` to include Edit and Delete actions on each row.
- Reuse or adapt the existing modal for editing.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: API Endpoints

#### Automated
- [x] 1.1 Create `src/pages/api/snapshots/[id].ts` with `DELETE` method. — 40ce62b
- [x] 1.2 Implement `PUT` method in `src/pages/api/snapshots/[id].ts` to update date and entries. — 40ce62b



### Phase 2: UI Integration

#### Automated
- [x] 2.1 Update `SnapshotManager.tsx` to display Edit and Delete buttons for each snapshot. — 04bf2ef
- [x] 2.2 Implement Delete flow (calling `DELETE` API and updating state). — 04bf2ef
- [x] 2.3 Implement Edit flow (opening modal with existing values, calling `PUT` API, and updating state). — 04bf2ef


