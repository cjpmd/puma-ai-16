
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerLinkingCodeManagerProps {
  playerId: string;
}

export const PlayerLinkingCodeManager = ({ playerId }: PlayerLinkingCodeManagerProps) => {
  const [linkingCode, setLinkingCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Load any existing linking code
  useEffect(() => {
    const fetchLinkingCode = async () => {
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
      }
    };

    fetchLinkingCode();
  }, [playerId]);

  // Generate a new linking code
  const generateCode = (length = 6): string => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Fix the async handling in this function
  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const newCode = generateCode(6);
      
      const { error } = await supabase
        .from("players")
        .update({ linking_code: newCode })
        .eq("id", playerId);

      if (error) throw error;
      
      // Now that we have the code, update state with it
      setLinkingCode(newCode);
      
      toast({
        title: "Code Generated",
        description: "New linking code has been generated.",
      });
    } catch (error) {
      console.error("Error generating linking code:", error);
      toast({
        title: "Error",
        description: "Failed to generate linking code.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (linkingCode) {
      navigator.clipboard.writeText(linkingCode);
      toast({
        title: "Code Copied",
        description: "Linking code copied to clipboard.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Player Linking Code</Label>
        <div className="flex gap-2">
          <Input
            value={linkingCode || ""}
            readOnly
            placeholder="No code generated yet"
          />
          <Button onClick={handleCopyCode} disabled={!linkingCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        onClick={handleGenerateCode}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Code
          </>
        )}
      </Button>
    </div>
  );
};
