
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
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
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
    const { playerId, amount, parentEmail, paymentMethod, teamId } = await req.json();
    
    if (!playerId || !amount || !parentEmail || !teamId) {
      throw new Error("Missing required fields: playerId, amount, parentEmail, or teamId");
    }
    
    logStep("Request data", { playerId, amount, parentEmail, paymentMethod, teamId });

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
    logStep("Player data retrieved", playerData);

    // Get team details
    const { data: teamData, error: teamError } = await supabaseClient
      .from('teams')
      .select('team_name')
      .eq('id', teamId)
      .single();
      
    if (teamError) throw new Error(`Error fetching team: ${teamError.message}`);
    logStep("Team data retrieved", teamData);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: parentEmail, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const newCustomer = await stripe.customers.create({
        email: parentEmail,
        metadata: {
          player_id: playerId,
          team_id: teamId
        }
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Create a Checkout Session
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    const params = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: paymentMethod === 'direct_debit' ? 'setup' : 'subscription',
      success_url: `${origin}/player/${playerId}?subscription_success=true`,
      cancel_url: `${origin}/player/${playerId}?subscription_canceled=true`,
      metadata: {
        player_id: playerId,
        team_id: teamId
      },
      customer_email: customerId ? undefined : parentEmail
    };

    // Different setup based on payment method
    if (paymentMethod === 'direct_debit') {
      // For direct debit, we set up a payment method for future use
      const session = await stripe.checkout.sessions.create({
        ...params,
        payment_method_types: ['bacs_debit'],
        setup_intent_data: {
          metadata: {
            player_id: playerId,
            payment_type: 'recurring',
            amount: amount
          }
        }
      });
      
      logStep("Created setup session for direct debit", { sessionId: session.id });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // For card subscriptions, create a recurring subscription product/price
      // First check if we have a product for this team already
      let price;
      const existingProducts = await stripe.products.search({
        query: `metadata['team_id']:'${teamId}'`
      });
      
      if (existingProducts.data.length > 0) {
        // Find price with matching amount
        const prices = await stripe.prices.list({
          product: existingProducts.data[0].id,
          active: true
        });
        
        price = prices.data.find(p => p.unit_amount === amount * 100);
        
        if (!price) {
          // Create new price for existing product
          price = await stripe.prices.create({
            product: existingProducts.data[0].id,
            unit_amount: amount * 100,
            currency: 'gbp',
            recurring: { interval: 'month' }
          });
        }
        
        logStep("Found existing product and price", { productId: existingProducts.data[0].id, priceId: price.id });
      } else {
        // Create new product and price
        const product = await stripe.products.create({
          name: `${teamData.team_name} - Player Subscription`,
          metadata: {
            team_id: teamId
          }
        });
        
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: amount * 100,
          currency: 'gbp',
          recurring: { interval: 'month' }
        });
        
        logStep("Created new product and price", { productId: product.id, priceId: price.id });
      }
      
      // Create subscription checkout session
      const session = await stripe.checkout.sessions.create({
        ...params,
        line_items: [{
          price: price.id,
          quantity: 1,
        }],
        subscription_data: {
          metadata: {
            player_id: playerId,
            team_id: teamId
          }
        }
      });
      
      logStep("Created subscription checkout session", { sessionId: session.id });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
