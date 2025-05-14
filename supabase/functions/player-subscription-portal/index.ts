
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
  console.log(`[SUBSCRIPTION-PORTAL] ${step}${detailsStr}`);
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
    const { playerId, parentEmail } = await req.json();
    
    if (!playerId || !parentEmail) {
      throw new Error("Missing required fields: playerId or parentEmail");
    }
    
    logStep("Request data", { playerId, parentEmail });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find customer by email
    const customers = await stripe.customers.list({ 
      email: parentEmail,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found with this email");
    }
    
    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });
    
    // Create a billing portal session
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/player/${playerId}`
    });
    
    logStep("Created billing portal session", { sessionUrl: session.url });
    
    return new Response(JSON.stringify({ url: session.url }), {
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
