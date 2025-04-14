
-- Create clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  contact_email TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  serial_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create teams table (extending from current single-team structure)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  age_group TEXT,
  location TEXT,
  contact_email TEXT,
  team_color TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  joined_club_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'trial',
  subscription_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Modify existing players table to support team association
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create player subscriptions table
CREATE TABLE IF NOT EXISTS public.player_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, overdue
  subscription_type TEXT DEFAULT 'monthly',
  subscription_amount DECIMAL(10, 2),
  last_payment_date TIMESTAMPTZ,
  next_payment_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create player payments table
CREATE TABLE IF NOT EXISTS public.player_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  payment_method TEXT, -- cash, bank_transfer, online, etc.
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create club subscriptions table
CREATE TABLE IF NOT EXISTS public.club_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, overdue
  subscription_plan TEXT, -- basic, premium, enterprise
  subscription_amount DECIMAL(10, 2),
  subscription_period TEXT, -- monthly, annual
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team subscriptions table
CREATE TABLE IF NOT EXISTS public.team_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, trial, overdue
  subscription_plan TEXT, -- basic, standard, premium
  subscription_amount DECIMAL(10, 2),
  subscription_period TEXT, -- monthly, annual
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create club membership plans table
CREATE TABLE IF NOT EXISTS public.club_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_annual DECIMAL(10, 2),
  max_teams INTEGER,
  max_players INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team membership plans table
CREATE TABLE IF NOT EXISTS public.team_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_annual DECIMAL(10, 2),
  max_players INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default team plans
INSERT INTO public.team_plans (name, description, price_monthly, price_annual, max_players, features, is_active)
VALUES
  ('Basic', 'Essential features for small teams', 9.99, 99.99, 20, '{"squad_management": true, "fixture_planning": true, "basic_analytics": true}', true),
  ('Standard', 'Advanced features for growing teams', 19.99, 199.99, 40, '{"squad_management": true, "fixture_planning": true, "advanced_analytics": true, "training_plans": true}', true),
  ('Premium', 'Complete solution for serious teams', 29.99, 299.99, 100, '{"squad_management": true, "fixture_planning": true, "advanced_analytics": true, "training_plans": true, "player_development": true, "video_analysis": true}', true);

-- Insert default club plans
INSERT INTO public.club_plans (name, description, price_monthly, price_annual, max_teams, max_players, features, is_active)
VALUES
  ('Basic', 'Essential features for small clubs', 29.99, 299.99, 3, 60, '{"multi_team_management": true, "basic_club_analytics": true}', true),
  ('Standard', 'Advanced features for growing clubs', 49.99, 499.99, 8, 160, '{"multi_team_management": true, "advanced_club_analytics": true, "player_development_tracking": true}', true),
  ('Enterprise', 'Complete solution for large clubs', 99.99, 999.99, 20, 500, '{"multi_team_management": true, "advanced_club_analytics": true, "player_development_tracking": true, "talent_identification": true, "coach_management": true}', true);

-- Add RLS policies
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_subscriptions ENABLE ROW LEVEL SECURITY;

-- Club policies
CREATE POLICY "club_admin_all" ON public.clubs
  USING (admin_id = auth.uid());

-- Team policies
CREATE POLICY "team_admin_all" ON public.teams
  USING (admin_id = auth.uid());

CREATE POLICY "club_admin_read_teams" ON public.teams
  FOR SELECT
  USING (club_id IN (SELECT id FROM public.clubs WHERE admin_id = auth.uid()));

-- Subscription policies
CREATE POLICY "team_admin_read_subscriptions" ON public.player_subscriptions
  FOR SELECT
  USING (player_id IN (
    SELECT id FROM public.players 
    WHERE team_id IN (
      SELECT id FROM public.teams 
      WHERE admin_id = auth.uid()
    )
  ));

-- Payment policies
CREATE POLICY "team_admin_read_payments" ON public.player_payments
  FOR SELECT
  USING (player_id IN (
    SELECT id FROM public.players 
    WHERE team_id IN (
      SELECT id FROM public.teams 
      WHERE admin_id = auth.uid()
    )
  ));

-- Create function to check if user is club admin 
CREATE OR REPLACE FUNCTION is_club_admin(club_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clubs
    WHERE id = club_id AND admin_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is team admin
CREATE OR REPLACE FUNCTION is_team_admin(team_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = team_id AND admin_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
