-- Create RPC for atomic snapshot update
CREATE OR REPLACE FUNCTION update_snapshot_with_entries(
  p_snapshot_id UUID,
  p_entries JSONB,
  p_date TIMESTAMPTZ DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_entry JSONB;
BEGIN
  -- 1. Update the snapshot date if provided
  IF p_date IS NOT NULL THEN
    UPDATE snapshots 
    SET created_at = p_date 
    WHERE id = p_snapshot_id AND user_id = auth.uid();
  END IF;

  -- 2. Delete existing entries
  DELETE FROM snapshot_entries 
  WHERE snapshot_id = p_snapshot_id 
  AND snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid());

  -- 3. Insert new entries
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
  LOOP
    INSERT INTO snapshot_entries (snapshot_id, account_id, balance)
    VALUES (
      p_snapshot_id,
      (v_entry->>'account_id')::UUID,
      (v_entry->>'balance')::NUMERIC
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
