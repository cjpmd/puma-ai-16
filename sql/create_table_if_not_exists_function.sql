
CREATE OR REPLACE FUNCTION create_table_if_not_exists(
  p_table_name TEXT,
  p_columns TEXT
) RETURNS VOID AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if the table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  ) INTO table_exists;
  
  -- Create the table if it doesn't exist
  IF NOT table_exists THEN
    EXECUTE format('CREATE TABLE %I (%s)', p_table_name, p_columns);
  END IF;
END;
$$ LANGUAGE plpgsql;
