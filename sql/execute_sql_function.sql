
-- Function to execute arbitrary SQL statements
CREATE OR REPLACE FUNCTION execute_sql(sql TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;
