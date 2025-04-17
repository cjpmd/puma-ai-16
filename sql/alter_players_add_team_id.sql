
-- Add team_id column to players table if it doesn't exist
DO $$ 
BEGIN
  -- Check if the column exists first
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'team_id'
  ) THEN
    -- Add the column
    ALTER TABLE public.players ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
  END IF;
END $$;
