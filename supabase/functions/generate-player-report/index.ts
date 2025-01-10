import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { playerId } = await req.json()
    console.log('Generating report for player:', playerId)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch player data with attributes
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select(`
        *,
        player_attributes (*),
        position_suitability (
          suitability_score,
          position_definitions (
            abbreviation,
            full_name
          )
        )
      `)
      .eq('id', playerId)
      .single()

    if (playerError) {
      console.error('Error fetching player:', playerError)
      throw playerError
    }

    if (!playerData) {
      throw new Error('Player not found')
    }

    console.log('Player data fetched successfully:', playerData.name)

    // Fetch objectives
    const { data: objectives, error: objectivesError } = await supabase
      .from('player_objectives')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })

    if (objectivesError) {
      console.error('Error fetching objectives:', objectivesError)
      throw objectivesError
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    
    const page = pdfDoc.addPage()
    const { height, width } = page.getSize()
    let yOffset = height - 50

    // Add header with player name
    page.drawText('Player Performance Report', {
      x: 50,
      y: yOffset,
      size: 24,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    })
    yOffset -= 40

    // Add player info section
    const playerInfo = [
      `Name: ${playerData.name}`,
      `Squad Number: ${playerData.squad_number}`,
      `Category: ${playerData.player_category}`,
      `Age: ${playerData.age}`,
      `Player Type: ${playerData.player_type}`,
    ]

    for (const info of playerInfo) {
      page.drawText(info, {
        x: 50,
        y: yOffset,
        size: 12,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      })
      yOffset -= 20
    }
    yOffset -= 20

    // Add attributes section
    const categories = ['TECHNICAL', 'MENTAL', 'PHYSICAL', 'GOALKEEPING']
    
    for (const category of categories) {
      const categoryAttributes = playerData.player_attributes.filter(
        (attr: any) => attr.category === category
      )

      if (categoryAttributes.length > 0) {
        // Check if we need a new page
        if (yOffset < 100) {
          page = pdfDoc.addPage()
          yOffset = height - 50
        }

        page.drawText(category, {
          x: 50,
          y: yOffset,
          size: 14,
          font: timesRomanBold,
          color: rgb(0, 0, 0),
        })
        yOffset -= 20

        for (const attr of categoryAttributes) {
          page.drawText(`${attr.name}: ${attr.value}/20`, {
            x: 70,
            y: yOffset,
            size: 10,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          })
          yOffset -= 15
        }
        yOffset -= 10
      }
    }

    // Add objectives section if available
    if (objectives && objectives.length > 0) {
      // Check if we need a new page
      if (yOffset < 200) {
        page = pdfDoc.addPage()
        yOffset = height - 50
      }

      page.drawText('Development Objectives:', {
        x: 50,
        y: yOffset,
        size: 14,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      })
      yOffset -= 30

      for (const objective of objectives) {
        // Check if we need a new page
        if (yOffset < 100) {
          page = pdfDoc.addPage()
          yOffset = height - 50
        }

        page.drawText(`${objective.title} (${objective.status})`, {
          x: 70,
          y: yOffset,
          size: 12,
          font: timesRomanBold,
          color: rgb(0, 0, 0),
        })
        yOffset -= 20

        if (objective.description) {
          const words = objective.description.split(' ')
          let line = ''
          let lineY = yOffset

          for (const word of words) {
            const testLine = line + word + ' '
            const textWidth = timesRomanFont.widthOfTextAtSize(testLine, 10)

            if (textWidth > width - 140) {
              page.drawText(line, {
                x: 70,
                y: lineY,
                size: 10,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              })
              line = word + ' '
              lineY -= 15
            } else {
              line = testLine
            }
          }

          if (line.trim().length > 0) {
            page.drawText(line, {
              x: 70,
              y: lineY,
              size: 10,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            })
          }
          yOffset = lineY - 20
        }
      }
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()
    console.log('PDF generated successfully, size:', pdfBytes.length)

    return new Response(
      pdfBytes,
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="player-report-${playerData.name}.pdf"`,
          'Content-Length': pdfBytes.length.toString()
        },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error generating report:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate report', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})