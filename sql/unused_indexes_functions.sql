
-- Function to get count of unused indexes
CREATE OR REPLACE FUNCTION public.get_unused_indexes_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unused_count integer;
BEGIN
  WITH unused_indexes AS (
    SELECT s.indexrelid
    FROM pg_stat_user_indexes s
    JOIN pg_index i ON s.indexrelid = i.indexrelid
    WHERE s.idx_scan = 0 
      AND i.indisprimary = false 
      AND i.indisunique = false
      AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = s.indexrelid)
  )
  SELECT count(*) INTO unused_count FROM unused_indexes;
  
  RETURN unused_count;
END;
$$;

-- Function to get detailed info about unused indexes
CREATE OR REPLACE FUNCTION public.get_unused_indexes_info()
RETURNS TABLE(
  table_name text,
  index_name text,
  index_definition text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY 
  SELECT
    tablename::text AS table_name,
    indexname::text AS index_name,
    indexdef::text AS index_definition
  FROM pg_stat_user_indexes s
  JOIN pg_index i ON s.indexrelid = i.indexrelid
  JOIN pg_indexes AS idx ON s.schemaname = idx.schemaname AND s.tablename = idx.tablename AND s.indexrelname = idx.indexname
  WHERE s.idx_scan = 0 
    AND i.indisprimary = false 
    AND i.indisunique = false
    AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = s.indexrelid)
  ORDER BY s.schemaname, s.tablename;
END;
$$;

-- Function to remove unused indexes
CREATE OR REPLACE FUNCTION public.remove_unused_indexes()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  index_count integer := 0;
BEGIN
  -- Loop through unused indexes and drop them
  FOR r IN 
    SELECT
      s.schemaname,
      s.indexrelname
    FROM pg_stat_user_indexes s
    JOIN pg_index i ON s.indexrelid = i.indexrelid
    WHERE s.idx_scan = 0 
      AND i.indisprimary = false 
      AND i.indisunique = false
      AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = s.indexrelid)
    ORDER BY s.schemaname, s.tablename
  LOOP
    BEGIN
      EXECUTE format('DROP INDEX IF EXISTS %I.%I;', r.schemaname, r.indexrelname);
      index_count := index_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error dropping index %: %', r.indexrelname, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Removed % unused indexes', index_count;
  RETURN TRUE;
END;
$$;

-- Function to add missing foreign key indexes
CREATE OR REPLACE FUNCTION public.add_missing_fk_indexes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  index_count integer := 0;
  idx_name text;
BEGIN
  FOR r IN
    SELECT DISTINCT
      c.conrelid::regclass AS table_name,
      a.attname AS column_name,
      c.conname AS constraint_name
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    LEFT JOIN pg_index i ON i.indrelid = c.conrelid 
      AND (a.attnum = ANY(i.indkey) AND array_length(i.indkey, 1) = 1)
    WHERE c.contype = 'f'
      AND i.indexrelid IS NULL
  LOOP
    BEGIN
      idx_name := r.table_name || '_' || r.column_name || '_idx';
      EXECUTE format('CREATE INDEX %I ON %s (%I);', 
                    idx_name,
                    r.table_name,
                    r.column_name);
      index_count := index_count + 1;
      RAISE NOTICE 'Created index % on %.%', idx_name, r.table_name, r.column_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error creating index on %.%: %', r.table_name, r.column_name, SQLERRM;
    END;
  END LOOP;
  
  RETURN index_count;
END;
$$;

-- Function to get count of unindexed foreign keys
CREATE OR REPLACE FUNCTION public.get_unindexed_fks_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unindexed_count integer;
BEGIN
  SELECT count(*) INTO unindexed_count
  FROM (
    SELECT DISTINCT
      c.conrelid::regclass AS table_name,
      a.attname AS column_name
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    LEFT JOIN pg_index i ON i.indrelid = c.conrelid 
      AND (a.attnum = ANY(i.indkey) AND array_length(i.indkey, 1) = 1)
    WHERE c.contype = 'f'
      AND i.indexrelid IS NULL
  ) AS unindexed;
  
  RETURN unindexed_count;
END;
$$;

-- Function to get detailed info about unindexed foreign keys
CREATE OR REPLACE FUNCTION public.get_unindexed_fks_info()
RETURNS TABLE(
  table_name text,
  column_name text,
  constraint_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.conrelid::regclass::text AS table_name,
    a.attname::text AS column_name,
    c.conname::text AS constraint_name
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
  LEFT JOIN pg_index i ON i.indrelid = c.conrelid 
    AND (a.attnum = ANY(i.indkey) AND array_length(i.indkey, 1) = 1)
  WHERE c.contype = 'f'
    AND i.indexrelid IS NULL
  ORDER BY c.conrelid::regclass::text, a.attname;
END;
$$;

-- Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_unused_indexes_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unused_indexes_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_unused_indexes_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unused_indexes_info() TO anon;
GRANT EXECUTE ON FUNCTION public.remove_unused_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_unused_indexes() TO anon;
GRANT EXECUTE ON FUNCTION public.add_missing_fk_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_missing_fk_indexes() TO anon;
GRANT EXECUTE ON FUNCTION public.get_unindexed_fks_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unindexed_fks_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_unindexed_fks_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unindexed_fks_info() TO anon;
