
export interface WhatsAppSettings {
  id?: string;
  enabled: boolean;
  whatsapp_business_id?: string;
  whatsapp_phone_id?: string;
  team_id?: string;
  business_phone_number?: string; // Add missing property
}

export interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  player_id?: string;
  created_at?: string;
}
