CREATE OR REPLACE FUNCTION create_snapshot_with_entries(
  p_entries JSONB,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_entry JSONB;
BEGIN
  INSERT INTO snapshots (user_id, created_at)
  VALUES (auth.uid(), COALESCE(p_date, NOW()))
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
