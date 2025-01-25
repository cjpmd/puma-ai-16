import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NotificationData {
  type: 'FIXTURE';
  date: string;
  time?: string | null;
  opponent: string;
  location?: string;
  category: string;
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