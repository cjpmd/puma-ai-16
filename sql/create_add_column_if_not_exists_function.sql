
-- Function to add a column to a table if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  p_table TEXT,
  p_column TEXT,
  p_type TEXT
) RETURNS VOID AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Check if column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = p_table
    AND column_name = p_column
  ) INTO column_exists;
  
  -- Add column if it doesn't exist
  IF NOT column_exists THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', p_table, p_column, p_type);
  END IF;
END;
$$ LANGUAGE plpgsql;
