
import { Json } from "@/integrations/supabase/types";

export interface PlayerSubscription {
  id: string;
  player_id: string;
  subscription_id?: string;
  status: 'active' | 'inactive' | 'cancelled';
  created_at: string;
  payment_date?: string;
  payment_amount?: number;
  payment_method?: string;
  next_payment_date?: string;
}

export interface TeamSubscription {
  id?: string;
  team_id: string;
  subscription_amount: number;
  subscription_period: 'monthly' | 'annual' | string;  // Allow string for data from DB
  status: 'active' | 'inactive' | 'cancelled' | string; // Allow string for data from DB
  created_at?: string;
  updated_at?: string;
  subscription_plan?: string;
  start_date?: string;
  end_date?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: string[] | Json | any; // Allow different types for flexibility
  max_teams?: number;
  max_players?: number;
  description?: string;
}
