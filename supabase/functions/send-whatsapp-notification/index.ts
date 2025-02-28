
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getWhatsAppSettings() {
  try {
    const { data, error } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching WhatsApp settings:", error);
    throw error;
  }
}

async function formatMessage(payload: any) {
  let messageText = "";
  
  if (payload.type === 'FIXTURE') {
    const location = payload.is_home ? 'Home' : 'Away';
    const meetingTime = payload.time ? `Meet at ${payload.time}` : 'Time TBC';
    
    messageText = `⚽ MATCH DAY ⚽\n\n`;
    messageText += `${payload.date}\n`;
    messageText += `vs ${payload.opponent}\n`;
    messageText += `${location} game\n`;
    messageText += `${meetingTime}\n\n`;
    messageText += `Please confirm attendance ASAP`;
  } else {
    // Default message for other types
    messageText = JSON.stringify(payload);
  }
  
  return messageText;
}

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Received notification payload:", payload);
    
    // Get WhatsApp API settings
    const settings = await getWhatsAppSettings();
    
    if (!settings?.access_token || !settings?.phone_number_id) {
      throw new Error("WhatsApp API credentials not configured");
    }
    
    // Format message based on payload type
    const messageText = await formatMessage(payload);
    
    // Determine recipient
    let recipient;
    if (payload.groupId) {
      recipient = payload.groupId;
    } else if (payload.phoneNumber) {
      recipient = payload.phoneNumber;
    } else {
      // Fetch from team settings if not provided directly
      const { data: teamSettings } = await supabase
        .from('team_settings')
        .select('whatsapp_group_id')
        .single();
      
      recipient = teamSettings?.whatsapp_group_id;
      if (!recipient) {
        throw new Error("No recipient specified and no default group ID configured");
      }
    }
    
    // Send message via WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${settings.phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.access_token}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: payload.groupId ? "group" : "individual",
          to: recipient,
          type: "text",
          text: {
            body: messageText
          }
        })
      }
    );
    
    const responseData = await response.json();
    console.log("WhatsApp API response:", responseData);
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`);
    }
    
    // Log the successful send in the database
    await supabase.from('whatsapp_sent_messages').insert({
      recipient: recipient,
      message: messageText,
      response: responseData,
      payload: payload
    });
    
    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
