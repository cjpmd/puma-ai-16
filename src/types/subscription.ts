
export interface PlayerSubscription {
  id: string;
  player_id: string;
  subscription_id: string;
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
  subscription_period: 'monthly' | 'annual';
  status: 'active' | 'inactive' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}
