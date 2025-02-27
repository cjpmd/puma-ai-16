
-- This SQL script creates a stored procedure to add missing columns to the fixture_team_selections table

CREATE OR REPLACE FUNCTION add_missing_columns_to_fixture_team_selections()
RETURNS void AS $$
BEGIN
    -- Check and add duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fixture_team_selections' AND column_name = 'duration'
    ) THEN
        ALTER TABLE fixture_team_selections ADD COLUMN duration INTEGER;
    END IF;

    -- Check and add performance_category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fixture_team_selections' AND column_name = 'performance_category'
    ) THEN
        ALTER TABLE fixture_team_selections ADD COLUMN performance_category TEXT;
    END IF;

    -- Check and add selections_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fixture_team_selections' AND column_name = 'selections_data'
    ) THEN
        ALTER TABLE fixture_team_selections ADD COLUMN selections_data JSONB;
    END IF;

    -- Check and add captain_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fixture_team_selections' AND column_name = 'captain_id'
    ) THEN
        ALTER TABLE fixture_team_selections ADD COLUMN captain_id UUID REFERENCES players(id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to execute the function (if needed)
-- GRANT EXECUTE ON FUNCTION add_missing_columns_to_fixture_team_selections() TO authenticated;
-- GRANT EXECUTE ON FUNCTION add_missing_columns_to_fixture_team_selections() TO anon;
-- GRANT EXECUTE ON FUNCTION add_missing_columns_to_fixture_team_selections() TO service_role;
