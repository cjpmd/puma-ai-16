
import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  type: 'FIXTURE';
  date: string;
  time?: string | null;
  opponent: string;
  location?: string;
  category: string;
  eventId?: string;  // Made optional to maintain backward compatibility
}

export const sendFixtureNotification = async (data: NotificationData) => {
  const { error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
    body: data
  });

  if (notificationError) {
    console.error('Error sending WhatsApp notification:', notificationError);
    throw notificationError;
  }
};
