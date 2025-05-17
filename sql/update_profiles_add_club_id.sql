
-- Add club_id to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'club_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create an RLS policy to allow access to profiles with club associations
CREATE POLICY IF NOT EXISTS "club_admin_read_profiles" ON public.profiles
  FOR SELECT
  USING (club_id IN (SELECT id FROM public.clubs WHERE admin_id = auth.uid()));
