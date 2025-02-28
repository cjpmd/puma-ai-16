
-- Create table for WhatsApp settings (tokens, etc)
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_token TEXT,
  api_key TEXT,
  phone_number_id TEXT,
  access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for storing incoming WhatsApp messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  phone_number TEXT,
  message TEXT,
  raw_payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- If tables exist, ensure they have all required columns
DO $$
BEGIN
  -- Check and add columns to whatsapp_settings if needed
  PERFORM add_column_if_not_exists('whatsapp_settings', 'verification_token', 'TEXT');
  PERFORM add_column_if_not_exists('whatsapp_settings', 'api_key', 'TEXT');
  PERFORM add_column_if_not_exists('whatsapp_settings', 'phone_number_id', 'TEXT');
  PERFORM add_column_if_not_exists('whatsapp_settings', 'access_token', 'TEXT');
  
  -- Insert default record if none exists
  IF NOT EXISTS (SELECT 1 FROM whatsapp_settings LIMIT 1) THEN
    INSERT INTO whatsapp_settings (id) VALUES ('00000000-0000-0000-0000-000000000001');
  END IF;
END
$$;
