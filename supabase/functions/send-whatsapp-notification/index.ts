import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationData {
  type: 'FIXTURE' | 'TRAINING'
  date: string
  time?: string
  opponent?: string
  location?: string
  category?: string
  title?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const WHATSAPP_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN')
    const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const TEST_NUMBER = Deno.env.get('WHATSAPP_TEST_NUMBER')

    const requestData = await req.json()
    console.log('Received request data:', requestData);

    if (!requestData || typeof requestData !== 'object') {
      throw new Error('Invalid request data');
    }

    const notificationData: NotificationData = requestData;
    console.log('Parsed notification data:', notificationData);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all players and their parents
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select(`
        id,
        name,
        player_category,
        player_parents (
          phone
        )
      `)
      .eq('player_category', notificationData.category)
      .not('player_parents', 'is', null)

    if (playersError) {
      throw playersError
    }

    // Construct message based on event type
    let message = ''
    if (notificationData.type === 'FIXTURE') {
      message = `🏃‍♂️ New Fixture Alert!\n\n`
      message += `📅 Date: ${notificationData.date}\n`
      if (notificationData.time) message += `⏰ Time: ${notificationData.time}\n`
      message += `🆚 Opponent: ${notificationData.opponent}\n`
      if (notificationData.location) message += `📍 Location: ${notificationData.location}\n`
      message += `\nPlease reply with:\n1️⃣ for YES - Player will attend\n2️⃣ for NO - Player cannot attend`
    } else {
      message = `⚽ New Training Session!\n\n`
      message += `📅 Date: ${notificationData.date}\n`
      if (notificationData.time) message += `⏰ Time: ${notificationData.time}\n`
      message += `📝 Title: ${notificationData.title}\n`
      if (notificationData.location) message += `📍 Location: ${notificationData.location}\n`
      message += `\nPlease reply with:\n1️⃣ for YES - Player will attend\n2️⃣ for NO - Player cannot attend`
    }

    console.log('Sending WhatsApp notifications for:', notificationData)

    // For now, just send to test number in development
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: TEST_NUMBER,
          type: 'text',
          text: { body: message }
        })
      }
    )

    const result = await response.json()
    console.log('WhatsApp API response:', result)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-whatsapp-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})