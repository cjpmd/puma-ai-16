
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to verify webhook from WhatsApp/Meta
async function verifyWebhook(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  
  // Get verification token from database
  const { data, error } = await supabase
    .from('whatsapp_settings')
    .select('verification_token')
    .single();
  
  if (error) {
    console.error("Error fetching verification token:", error);
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  const verificationToken = data?.verification_token;
  
  // Verify that the request is from WhatsApp
  if (mode === "subscribe" && token === verificationToken && challenge) {
    console.log("Webhook verified successfully");
    return new Response(challenge, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
  
  return new Response(JSON.stringify({ error: "Verification failed" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Function to process incoming messages
async function processWebhookMessage(data: any): Promise<void> {
  try {
    // Extract the message data
    const entry = data.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    
    if (!value) {
      throw new Error("Invalid message format");
    }
    
    // Store the incoming message in the database
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: value.id || crypto.randomUUID(),
        phone_number: value.phone_number || value.from?.phone_number,
        message: value.messages?.[0]?.text?.body || JSON.stringify(value),
        raw_payload: data,
        processed: false
      });
      
    if (error) {
      throw error;
    }
    
    console.log("Message stored successfully");
  } catch (error) {
    console.error("Error processing webhook message:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // Handle verification request (GET)
    if (req.method === "GET") {
      return await verifyWebhook(req);
    }
    
    // Handle incoming webhook messages (POST)
    else if (req.method === "POST") {
      const data = await req.json();
      console.log("Received webhook data:", JSON.stringify(data));
      
      // Process the message asynchronously
      processWebhookMessage(data);
      
      // Return 200 immediately to acknowledge receipt
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle unsupported methods
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
