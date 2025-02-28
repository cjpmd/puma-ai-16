
import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  type: 'FIXTURE';
  date: string;
  time?: string | null;
  opponent: string;
  location?: string;
  category: string;
  eventId?: string;  // Made optional to maintain backward compatibility
  groupId?: string;  // Added to support group chats
}

export const sendFixtureNotification = async (data: NotificationData) => {
  try {
    // If no groupId is provided in the data, fetch it from team settings
    if (!data.groupId) {
      const { data: settings, error: settingsError } = await supabase
        .from('team_settings')
        .select('whatsapp_group_id')
        .single();
        
      if (!settingsError && settings?.whatsapp_group_id) {
        data.groupId = settings.whatsapp_group_id;
      }
    }
    
    console.log('Sending WhatsApp notification with data:', {
      ...data,
      groupId: data.groupId ? 'Provided' : 'Not provided'
    });

    const { error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: data
    });

    if (notificationError) {
      console.error('Error sending WhatsApp notification:', notificationError);
      throw notificationError;
    }
    
    console.log('WhatsApp notification sent successfully');
  } catch (error) {
    console.error('Error in sendFixtureNotification:', error);
    throw error;
  }
};
