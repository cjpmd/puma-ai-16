import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb } from 'https://cdn.skypack.dev/pdf-lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { playerId } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Fetch player data
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select(`
        *,
        player_attributes (*)
      `)
      .eq('id', playerId)
      .single()

    if (playerError) throw playerError

    // Fetch objectives
    const { data: objectives } = await supabase
      .from('player_objectives')
      .select('*')
      .eq('player_id', playerId)

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { height, width } = page.getSize()
    
    // Add content
    page.drawText('Player Report', {
      x: 50,
      y: height - 50,
      size: 20,
    })

    page.drawText(`Name: ${player.name}`, {
      x: 50,
      y: height - 100,
      size: 12,
    })

    page.drawText(`Squad Number: ${player.squad_number}`, {
      x: 50,
      y: height - 120,
      size: 12,
    })

    page.drawText(`Category: ${player.player_category}`, {
      x: 50,
      y: height - 140,
      size: 12,
    })

    // Add attributes section
    page.drawText('Attributes:', {
      x: 50,
      y: height - 180,
      size: 14,
    })

    let yOffset = 200
    const categories = ['TECHNICAL', 'MENTAL', 'PHYSICAL', 'GOALKEEPING']
    
    for (const category of categories) {
      const categoryAttributes = player.player_attributes.filter(
        (attr: any) => attr.category === category
      )

      if (categoryAttributes.length > 0) {
        page.drawText(category, {
          x: 50,
          y: height - yOffset,
          size: 12,
        })

        yOffset += 20
        
        for (const attr of categoryAttributes) {
          page.drawText(`${attr.name}: ${attr.value}/20`, {
            x: 70,
            y: height - yOffset,
            size: 10,
          })
          yOffset += 15
        }
        
        yOffset += 10
      }
    }

    // Add objectives section if available
    if (objectives && objectives.length > 0) {
      page.drawText('Objectives:', {
        x: 50,
        y: height - yOffset - 30,
        size: 14,
      })

      yOffset += 50
      
      for (const objective of objectives) {
        page.drawText(`${objective.title} (${objective.status})`, {
          x: 70,
          y: height - yOffset,
          size: 10,
        })
        yOffset += 20
      }
    }

    // Generate PDF
    const pdfBytes = await pdfDoc.save()

    return new Response(
      pdfBytes,
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="player-report-${player.name}.pdf"`
        } 
      }
    )
  } catch (error) {
    console.error('Error generating report:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate report' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})