
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    // Extract the payload from the message
    const payload = message?.button?.payload;
    const phone = message?.from;

    if (!payload || !phone) {
      throw new Error('Missing required fields');
    }

    const [status, eventId] = payload.split(':');

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get parent by phone number
    const { data: parent } = await supabase
      .from('player_parents')
      .select('id, player_id')
      .eq('phone', phone)
      .single();

    if (!parent) {
      throw new Error('Parent not found');
    }

    // Update attendance status
    const { error: updateError } = await supabase
      .from('event_attendance')
      .update({
        status: status === 'attending' ? 'attending' : 'not_attending',
        response_time: new Date().toISOString(),
        responded_by: 'whatsapp'
      })
      .eq('event_id', eventId)
      .eq('player_id', parent.player_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error handling attendance response:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
