-- Run this in the Supabase SQL Editor

-- 1. Create snapshots table
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for snapshots
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own snapshots
CREATE POLICY "Users can manage their own snapshots" 
ON snapshots 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 2. Create snapshot_entries table
CREATE TABLE snapshot_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL,
  UNIQUE(snapshot_id, account_id)
);

-- Enable RLS for snapshot_entries
ALTER TABLE snapshot_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own entries through snapshots
CREATE POLICY "Users can manage their own snapshot entries" 
ON snapshot_entries 
FOR ALL 
USING (
  snapshot_id IN (
    SELECT id FROM snapshots WHERE user_id = auth.uid()
  )
  AND account_id IN (
    SELECT id FROM accounts WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  snapshot_id IN (
    SELECT id FROM snapshots WHERE user_id = auth.uid()
  )
  AND account_id IN (
    SELECT id FROM accounts WHERE user_id = auth.uid()
  )
);

-- 3. Create indexes for foreign keys to improve join/delete performance
CREATE INDEX idx_snapshots_user_id ON snapshots(user_id);
CREATE INDEX idx_snapshot_entries_snapshot_id ON snapshot_entries(snapshot_id);
CREATE INDEX idx_snapshot_entries_account_id ON snapshot_entries(account_id);

-- 4. Create RPC for atomic snapshot creation
CREATE OR REPLACE FUNCTION create_snapshot_with_entries(
  p_entries JSONB
) RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_entry JSONB;
BEGIN
  INSERT INTO snapshots (user_id)
  VALUES (auth.uid())
  RETURNING id INTO v_snapshot_id;

  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
  LOOP
    INSERT INTO snapshot_entries (snapshot_id, account_id, balance)
    VALUES (
      v_snapshot_id,
      (v_entry->>'account_id')::UUID,
      (v_entry->>'balance')::NUMERIC
    );
  END LOOP;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
