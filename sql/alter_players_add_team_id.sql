
-- Add team_id column to players table if it doesn't exist (and if teams table exists)
DO $$ 
BEGIN
  -- First check if teams table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'teams'
  ) THEN
    -- Then check if the column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'team_id'
    ) THEN
      -- Add the column
      ALTER TABLE public.players ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
  ELSE
    RAISE NOTICE 'The teams table does not exist yet. Please create it first.';
  END IF;
END $$;
