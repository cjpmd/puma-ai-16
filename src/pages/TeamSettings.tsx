
import { useState, useEffect } from "react";
import { AttributeSettingsManager } from "@/components/settings/AttributeSettingsManager";
import { FAConnectionSettings } from "@/components/settings/FAConnectionSettings";
import { WhatsAppIntegration } from "@/components/settings/WhatsAppIntegration";
import { TeamInfoSettings } from "@/components/settings/TeamInfoSettings";
import { FormatsAndCategoriesSettings } from "@/components/settings/FormatsAndCategoriesSettings";
import { supabase } from "@/integrations/supabase/client";

export default function TeamSettings() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkTables = async () => {
      try {
        // Check performance_categories table
        const { data: categories, error: catError } = await supabase
          .from('performance_categories')
          .select('*');
        
        if (catError) {
          console.error('Error fetching performance categories:', catError);
        }
        
        // Check game_formats table
        const { data: formats, error: formatError } = await supabase
          .from('game_formats')
          .select('*');
          
        if (formatError) {
          console.error('Error fetching game formats:', formatError);
        }

        // Update debug info
        setDebugInfo({
          categories: categories || [],
          formats: formats || [],
          categoryError: catError?.message || null,
          formatError: formatError?.message || null
        });
        
        // Check tables and ensure they exist with default data
        if (!categories || categories.length === 0 || catError) {
          await createDefaultCategories();
        }
        
        if (!formats || formats.length === 0 || formatError) {
          await createDefaultFormats();
        }
      } catch (error) {
        console.error('Error in checkTables:', error);
        setDebugInfo(prev => ({ ...prev, error: String(error) }));
      }
    };
    
    checkTables();
  }, []);

  const createDefaultCategories = async () => {
    try {
      // Try to create the table first
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS performance_categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      
      // Insert default categories
      const { error } = await supabase
        .from('performance_categories')
        .upsert([
          { id: 'messi', name: 'Messi', description: 'Messi performance category' },
          { id: 'ronaldo', name: 'Ronaldo', description: 'Ronaldo performance category' },
          { id: 'jags', name: 'Jags', description: 'Jags performance category' }
        ], { onConflict: 'id' });
        
      if (error) {
        console.error('Error creating default categories:', error);
      }
    } catch (error) {
      console.error('Error in createDefaultCategories:', error);
    }
  };
  
  const createDefaultFormats = async () => {
    try {
      // Try to create the table first
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS game_formats (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      
      // Insert default formats
      const { error } = await supabase
        .from('game_formats')
        .upsert([
          { id: '4-a-side', name: '4-a-side', description: '4 players per team' },
          { id: '5-a-side', name: '5-a-side', description: '5 players per team' },
          { id: '7-a-side', name: '7-a-side', description: '7 players per team' },
          { id: '9-a-side', name: '9-a-side', description: '9 players per team' },
          { id: '11-a-side', name: '11-a-side', description: '11 players per team' }
        ], { onConflict: 'id' });
        
      if (error) {
        console.error('Error creating default formats:', error);
      }
    } catch (error) {
      console.error('Error in createDefaultFormats:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Team Settings</h1>
      
      <TeamInfoSettings />
      <FormatsAndCategoriesSettings />
      <FAConnectionSettings />
      <WhatsAppIntegration />
      
      <div className="mt-8">
        <AttributeSettingsManager />
      </div>
    </div>
  );
}
