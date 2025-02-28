import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface NotificationData {
  type: 'FIXTURE' | 'TOURNAMENT' | 'FESTIVAL';
  date: string;
  time?: string;
  opponent?: string;
  location?: string;
  category: string;
  eventId?: string;
  groupId?: string;
}

serve(async (req) => {
  try {
    // Get request data
    const data: NotificationData = await req.json();
    console.log('Received notification request with data:', data);

    // Get environment variables
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

    if (!whatsappApiKey) {
      console.error('WHATSAPP_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({
          error: 'Configuration error: WhatsApp API key not found',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine if we should use a group chat
    const useGroupChat = !!data.groupId;
    console.log('Using group chat:', useGroupChat, 'Group ID:', data.groupId);

    let message = '';
    let recipients: string[] = [];

    // Build message based on notification type
    if (data.type === 'FIXTURE') {
      message = `📢 *Match Notification*\n\n`;
      message += `Team: *${data.category}*\n`;
      message += `Date: *${data.date}*\n`;
      if (data.time) message += `Meeting Time: *${data.time}*\n`;
      if (data.opponent) message += `Opponent: *${data.opponent}*\n`;
      if (data.location) message += `Location: *${data.location}*\n\n`;
      message += `Please reply with *YES* if you can attend or *NO* if you cannot.`;
    } else if (data.type === 'TOURNAMENT') {
      message = `📢 *Tournament Notification*\n\n`;
      // ... build message
    } else if (data.type === 'FESTIVAL') {
      message = `📢 *Festival Notification*\n\n`;
      // ... build message
    } else {
      message = `📢 *Team Notification*\n\n${JSON.stringify(data)}`;
    }

    // If using group chat, we'll send directly to the group
    if (useGroupChat) {
      console.log('Sending message to WhatsApp group');
      const response = await fetch('https://graph.facebook.com/v17.0/136631906193183/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'group',
          to: data.groupId,
          type: 'text',
          text: {
            body: message
          }
        }),
      });

      const result = await response.json();
      console.log('WhatsApp API response for group message:', result);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notification sent to WhatsApp group' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } 
    // Otherwise, fetch parent phone numbers and send individual messages
    else {
      console.log('Getting parent phone numbers for event ID:', data.eventId);
      
      if (!data.eventId) {
        return new Response(
          JSON.stringify({ error: 'Event ID not provided' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Query for players attending this event
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('event_attendance')
        .select('player_id')
        .eq('event_id', data.eventId)
        .eq('event_type', data.type);

      if (attendanceError) {
        console.error('Error fetching attendance data:', attendanceError);
        throw attendanceError;
      }

      console.log('Found attendance records:', attendanceData?.length);

      if (!attendanceData || attendanceData.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No attendance records found' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get player IDs from attendance records
      const playerIds = attendanceData.map(record => record.player_id);

      // Get parent phone numbers for these players
      const { data: parentData, error: parentError } = await supabase
        .from('players')
        .select('parent_details')
        .in('id', playerIds);

      if (parentError) {
        console.error('Error fetching parent data:', parentError);
        throw parentError;
      }

      // Extract phone numbers
      recipients = parentData
        .filter(player => player.parent_details && player.parent_details.phone)
        .map(player => player.parent_details.phone);

      console.log('Found parent phone numbers:', recipients.length);

      if (recipients.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No parent phone numbers found' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Send messages to each recipient
      for (const recipient of recipients) {
        try {
          console.log('Sending WhatsApp message to:', recipient);
          const response = await fetch('https://graph.facebook.com/v17.0/136631906193183/messages', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: recipient,
              type: 'text',
              text: {
                body: message
              }
            }),
          });

          const result = await response.json();
          console.log('WhatsApp API response:', result);
        } catch (e) {
          console.error('Error sending WhatsApp message to', recipient, e);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Notification sent to ${recipients.length} recipients` 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in send-whatsapp-notification edge function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
