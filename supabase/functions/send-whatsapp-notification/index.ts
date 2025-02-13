
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationData {
  type: 'FIXTURE';
  date: string;
  time?: string | null;
  opponent: string;
  location?: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, date, time, opponent, location, category } = await req.json() as NotificationData;

    const WHATSAPP_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN');
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('Missing WhatsApp configuration');
    }

    // Get the template message based on event type
    let templateName = '';
    let components = [];

    switch (type) {
      case 'FIXTURE':
        templateName = 'fixture_notification';
        components = [
          {
            type: "body",
            parameters: [
              { type: "text", text: date },
              { type: "text", text: time || 'TBD' },
              { type: "text", text: opponent },
              { type: "text", text: location || 'TBD' },
              { type: "text", text: category }
            ]
          }
        ];
        break;
      default:
        throw new Error('Invalid event type');
    }

    // Fetch phone numbers from player_parents table
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: parents, error: parentsError } = await supabase
      .from('player_parents')
      .select('phone')
      .not('phone', 'is', null);

    if (parentsError) {
      throw parentsError;
    }

    // Send WhatsApp message to each parent
    const sendPromises = parents.map(async (parent) => {
      if (!parent.phone) return;

      const messageBody = {
        messaging_product: "whatsapp",
        to: parent.phone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en"
          },
          components
        }
      };

      const response = await fetch(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageBody),
        }
      );

      if (!response.ok) {
        console.error(`Failed to send WhatsApp message to ${parent.phone}`);
        console.error(await response.text());
      }

      return response;
    });

    await Promise.all(sendPromises);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in WhatsApp notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
