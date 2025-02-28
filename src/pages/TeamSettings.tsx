
import { AttributeSettingsManager } from "@/components/settings/AttributeSettingsManager";
import { FAConnectionSettings } from "@/components/settings/FAConnectionSettings";
import { WhatsAppIntegration } from "@/components/settings/WhatsAppIntegration";
import { TeamInfoSettings } from "@/components/settings/TeamInfoSettings";

export default function TeamSettings() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Team Settings</h1>
      
      <TeamInfoSettings />
      <FAConnectionSettings />
      <WhatsAppIntegration />
      
      <div className="mt-8">
        <AttributeSettingsManager />
      </div>
    </div>
  );
}
