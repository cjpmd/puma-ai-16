
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    // Parse request body
    const { playerId } = await req.json();
    
    if (!playerId) {
      throw new Error("Missing required field: playerId");
    }
    
    logStep("Request data", { playerId });

    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get player details
    const { data: playerData, error: playerError } = await supabaseClient
      .from('players')
      .select('name, team_id')
      .eq('id', playerId)
      .single();
      
    if (playerError) throw new Error(`Error fetching player: ${playerError.message}`);
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Search for subscriptions with this player ID in metadata
    const subscriptions = await stripe.subscriptions.search({
      query: `metadata['player_id']:'${playerId}'`,
    });
    
    logStep("Subscriptions found", { count: subscriptions.data.length });
    
    if (subscriptions.data.length === 0) {
      // Check if there's a stored player subscription locally
      const { data: existingSub } = await supabaseClient
        .from('player_subscriptions')
        .select('*')
        .eq('player_id', playerId)
        .maybeSingle();
      
      if (existingSub && existingSub.status !== 'cancelled') {
        // Update local record to cancelled since no Stripe record exists
        await supabaseClient
          .from('player_subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('player_id', playerId);
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        message: "No active subscription found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Find active subscription
    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === 'active' || sub.status === 'trialing');
    
    if (!activeSubscription) {
      // Update local database if needed
      const { data: existingSub } = await supabaseClient
        .from('player_subscriptions')
        .select('*')
        .eq('player_id', playerId)
        .maybeSingle();
      
      if (existingSub && existingSub.status !== 'cancelled') {
        await supabaseClient
          .from('player_subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('player_id', playerId);
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        message: "No active subscription found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Get price details
    const priceId = activeSubscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    
    // Calculate next billing date
    const nextBillingDate = new Date(activeSubscription.current_period_end * 1000);
    
    // Update player_subscriptions table
    const { error: upsertError } = await supabaseClient
      .from('player_subscriptions')
      .upsert({
        player_id: playerId,
        status: activeSubscription.pause_collection ? 'paused' : 'active',
        subscription_type: 'monthly',
        subscription_amount: (price.unit_amount || 0) / 100,
        last_payment_date: new Date(activeSubscription.current_period_start * 1000).toISOString(),
        next_payment_due: nextBillingDate.toISOString(),
        stripe_subscription_id: activeSubscription.id,
        payment_method: activeSubscription.default_payment_method ? 'card' : 'direct_debit',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'player_id'
      });
      
    if (upsertError) {
      logStep("Error updating subscription record", { error: upsertError.message });
    } else {
      logStep("Updated subscription record successfully");
    }
    
    return new Response(JSON.stringify({
      subscribed: true,
      subscription_id: activeSubscription.id,
      status: activeSubscription.pause_collection ? 'paused' : 'active',
      amount: (price.unit_amount || 0) / 100,
      next_payment_due: nextBillingDate.toISOString(),
      payment_method: activeSubscription.default_payment_method ? 'card' : 'direct_debit'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
