
import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  type: 'FIXTURE';
  date: string;
  time?: string | null;
  opponent: string;
  location?: string;
  category: string;
  is_home?: boolean;
  eventId?: string;
  groupId?: string;
  phoneNumber?: string;
}

export const sendFixtureNotification = async (data: NotificationData) => {
  try {
    // If no groupId is provided in the data, fetch it from team settings
    if (!data.groupId) {
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('team_settings')
          .select('*')
          .single();
          
        // Safe check if settings exist and contain a whatsapp_group_id field
        if (!settingsError && settings) {
          // Use optional chaining and type assertion to safely access whatsapp_group_id if it exists
          const groupId = (settings as any).whatsapp_group_id || '';
          data.groupId = groupId;
        }
      } catch (err) {
        console.error('Error fetching WhatsApp group ID:', err);
        // Continue without a groupId
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
    return { success: true };
  } catch (error) {
    console.error('Error in sendFixtureNotification:', error);
    throw error;
  }
};
