
-- Function to get column names from a specific table
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS text[] AS $$
DECLARE
    column_names text[];
BEGIN
    SELECT array_agg(column_name::text) INTO column_names
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = $1;
    
    RETURN column_names;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO anon;
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO service_role;
