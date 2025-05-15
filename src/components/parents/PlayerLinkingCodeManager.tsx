
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateChildLinkingCode } from "@/utils/database/setupUserRolesTable";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";

interface PlayerLinkingCodeManagerProps {
  playerId: string;
  playerName: string;
}

export const PlayerLinkingCodeManager = ({ playerId, playerName }: PlayerLinkingCodeManagerProps) => {
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const { toast } = useToast();

  // Fetch the current linking code when component mounts
  const fetchLinkingCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("players")
        .select("linking_code")
        .eq("id", playerId)
        .single();
      
      if (error) throw error;
      
      if (data && data.linking_code) {
        setLinkingCode(data.linking_code);
      }
    } catch (error) {
      console.error("Error fetching linking code:", error);
      toast({
        variant: "destructive",
        description: "Failed to fetch linking code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a new linking code and save it to the database
  const generateNewLinkingCode = async () => {
    setIsGenerating(true);
    try {
      // Generate a new code
      const newCode = generateChildLinkingCode();
      
      // Save it to the database
      const { error } = await supabase
        .from("players")
        .update({ linking_code: newCode })
        .eq("id", playerId);
      
      if (error) throw error;
      
      // Update the UI
      setLinkingCode(newCode);
      toast({
        description: "New linking code generated successfully",
      });
    } catch (error) {
      console.error("Error generating new linking code:", error);
      toast({
        variant: "destructive",
        description: "Failed to generate new linking code",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy the code to clipboard
  const copyCodeToClipboard = () => {
    if (linkingCode) {
      navigator.clipboard.writeText(linkingCode);
      setCodeCopied(true);
      toast({
        description: "Linking code copied to clipboard",
      });
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // If we don't have the code yet and we're not loading, fetch it
  if (!linkingCode && !isLoading) {
    fetchLinkingCode();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Player Linking Code
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateNewLinkingCode}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Generate New</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Parents can use this code to link their account to {playerName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : linkingCode ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-muted p-3 rounded border flex-1 text-center font-mono text-lg tracking-wider">
                {linkingCode}
              </div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyCodeToClipboard}
              >
                {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with the player's parent to allow them to link their account.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No linking code found.</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={generateNewLinkingCode}
              disabled={isGenerating}
            >
              Generate Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
