import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'

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
    console.log('Generating report for player:', playerId)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Fetch player data with attributes
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select(`
        *,
        player_attributes (*)
      `)
      .eq('id', playerId)
      .single()

    if (playerError) {
      console.error('Error fetching player:', playerError)
      throw playerError
    }

    // Fetch objectives
    const { data: objectives, error: objectivesError } = await supabase
      .from('player_objectives')
      .select('*')
      .eq('player_id', playerId)

    if (objectivesError) {
      console.error('Error fetching objectives:', objectivesError)
      throw objectivesError
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const page = pdfDoc.addPage()
    const { height, width } = page.getSize()
    
    // Add header
    page.drawText('Player Performance Report', {
      x: 50,
      y: height - 50,
      size: 24,
      font: helveticaBold,
    })

    // Add player info
    page.drawText(`Name: ${player.name}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font: helveticaFont,
    })

    page.drawText(`Squad Number: ${player.squad_number}`, {
      x: 50,
      y: height - 120,
      size: 12,
      font: helveticaFont,
    })

    page.drawText(`Category: ${player.player_category}`, {
      x: 50,
      y: height - 140,
      size: 12,
      font: helveticaFont,
    })

    // Add attributes section
    page.drawText('Attributes:', {
      x: 50,
      y: height - 180,
      size: 14,
      font: helveticaBold,
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
          font: helveticaBold,
        })

        yOffset += 20
        
        for (const attr of categoryAttributes) {
          page.drawText(`${attr.name}: ${attr.value}/20`, {
            x: 70,
            y: height - yOffset,
            size: 10,
            font: helveticaFont,
          })
          yOffset += 15
        }
        
        yOffset += 10
      }
    }

    // Add objectives section if available
    if (objectives && objectives.length > 0) {
      // Check if we need a new page
      if (yOffset > height - 100) {
        const newPage = pdfDoc.addPage()
        yOffset = 50
      }

      page.drawText('Objectives:', {
        x: 50,
        y: height - yOffset - 30,
        size: 14,
        font: helveticaBold,
      })

      yOffset += 50
      
      for (const objective of objectives) {
        // Check if we need a new page
        if (yOffset > height - 100) {
          const newPage = pdfDoc.addPage()
          yOffset = 50
        }

        page.drawText(`${objective.title} (${objective.status})`, {
          x: 70,
          y: height - yOffset,
          size: 10,
          font: helveticaFont,
        })
        yOffset += 20

        if (objective.description) {
          const words = objective.description.split(' ')
          let line = ''
          let lineY = yOffset

          for (const word of words) {
            const testLine = line + word + ' '
            const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10)

            if (textWidth > width - 140) {
              page.drawText(line, {
                x: 90,
                y: height - lineY,
                size: 10,
                font: helveticaFont,
              })
              line = word + ' '
              lineY += 15
            } else {
              line = testLine
            }
          }

          if (line.trim().length > 0) {
            page.drawText(line, {
              x: 90,
              y: height - lineY,
              size: 10,
              font: helveticaFont,
            })
          }

          yOffset = lineY + 20
        }
      }
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    return new Response(
      pdfBytes,
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="player-report-${player.name}.pdf"`,
          'Content-Length': pdfBytes.length.toString()
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