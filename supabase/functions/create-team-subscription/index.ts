
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for admin permissions
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { teamId, planId } = await req.json();
    if (!teamId || !planId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: teamId or planId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get team details
    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("*, team_subscriptions(*)")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return new Response(
        JSON.stringify({ error: "Team not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the subscription plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from("team_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Subscription plan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${plan.name} Team Subscription`,
              description: plan.description,
            },
            unit_amount: plan.price_monthly * 100, // Convert to cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/team-settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/team-settings`,
      metadata: {
        teamId,
        planId,
        userId: user.id
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating team subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
