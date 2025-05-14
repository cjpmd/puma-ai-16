
export interface PlayerSubscription {
  id?: string;
  player_id: string;
  status: 'active' | 'paused' | 'cancelled';
  subscription_type: 'monthly' | 'annual';
  subscription_amount: number;
  last_payment_date?: string;
  next_payment_due?: string;
  stripe_subscription_id?: string;
  payment_method?: 'direct_debit' | 'card';
  created_at?: string;
  updated_at?: string;
}

export interface TeamSubscription {
  id?: string;
  team_id: string;
  status: 'active' | 'inactive' | 'trial' | 'overdue';
  subscription_plan?: string;
  subscription_amount: number;
  subscription_period: 'monthly' | 'annual';
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentHistory {
  id?: string;
  player_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
}

export interface StripeCheckoutResponse {
  url: string;
  error?: string;
}

export interface StripeVerificationResponse {
  subscribed: boolean;
  subscription_id?: string;
  status?: 'active' | 'paused' | 'cancelled';
  amount?: number;
  next_payment_due?: string;
  payment_method?: 'direct_debit' | 'card';
  message?: string;
  error?: string;
}
