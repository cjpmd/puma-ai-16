
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Debug log function
async function logDebug(message: string, data?: any) {
  console.log(`[WEBHOOK DEBUG] ${message}`, data ? JSON.stringify(data) : "");
  
  try {
    // Also log to a debug table if it exists
    await supabase.from('webhook_debug_logs').insert({
      message,
      data: data || null,
      timestamp: new Date().toISOString()
    }).catch(() => {
      // Silently fail if table doesn't exist
    });
  } catch (error) {
    // Don't let logging errors stop the main flow
    console.error("Error logging debug info:", error);
  }
}

// Function to verify webhook from WhatsApp/Meta
async function verifyWebhook(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  
  await logDebug("Verification request received", { mode, token: token ? "PRESENT" : "MISSING", challenge: challenge ? "PRESENT" : "MISSING" });
  
  // Get verification token from database
  const { data, error } = await supabase
    .from('whatsapp_settings')
    .select('verification_token')
    .single();
  
  if (error) {
    await logDebug("Error fetching verification token", error);
    return new Response(JSON.stringify({ error: "Verification failed: Database error" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  const verificationToken = data?.verification_token;
  await logDebug("Stored verification token", { stored: verificationToken ? "PRESENT" : "MISSING" });
  
  // Verify that the request is from WhatsApp
  if (!mode || !token) {
    await logDebug("Missing required verification parameters", { mode, token: token ? "PRESENT" : "MISSING" });
    return new Response(JSON.stringify({ error: "Verification failed: Missing parameters" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  if (mode === "subscribe" && token === verificationToken && challenge) {
    await logDebug("Webhook verified successfully", { challenge });
    return new Response(challenge, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
  
  await logDebug("Verification token mismatch", { 
    receivedToken: token, 
    storedToken: verificationToken,
    matches: token === verificationToken 
  });
  
  return new Response(JSON.stringify({ error: "Verification failed: Token mismatch" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Function to process incoming messages
async function processWebhookMessage(data: any): Promise<void> {
  try {
    await logDebug("Processing webhook message", { type: "message", dataType: typeof data });
    
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
        phone_number: value.phone_number || value.from?.phone_number || "unknown",
        message: value.messages?.[0]?.text?.body || JSON.stringify(value),
        raw_payload: data,
        processed: false
      });
      
    if (error) {
      await logDebug("Error storing message", error);
      throw error;
    }
    
    await logDebug("Message stored successfully");
  } catch (error) {
    await logDebug("Error processing webhook message", error);
    console.error("Error processing webhook message:", error);
  }
}

serve(async (req) => {
  await logDebug("Request received", { 
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });
  
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
      await logDebug("Received webhook data", data);
      
      // Process the message asynchronously
      processWebhookMessage(data);
      
      // Return 200 immediately to acknowledge receipt
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle unsupported methods
    await logDebug("Unsupported method", { method: req.method });
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    await logDebug("Error in request handler", { error: error.message, stack: error.stack });
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
