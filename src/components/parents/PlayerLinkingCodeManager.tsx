
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateChildLinkingCode } from "@/utils/database/setupUserRolesTable";
import { Copy, Check, RefreshCw, Loader2, AlertCircle, Wrench } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addLinkingCodeColumn } from "@/utils/database/createTables";

interface PlayerLinkingCodeManagerProps {
  playerId: string;
  playerName: string;
}

export const PlayerLinkingCodeManager = ({ playerId, playerName }: PlayerLinkingCodeManagerProps) => {
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the current linking code when component mounts
  const fetchLinkingCode = async () => {
    setIsLoading(true);
    setDbError(null);
    
    try {
      // Try direct query first
      const { data, error } = await supabase
        .from("players")
        .select("linking_code")
        .eq("id", playerId)
        .single();
      
      if (error) {
        if (error.message?.includes("column") && error.message?.includes("does not exist")) {
          setDbError("The linking_code column doesn't exist yet. Please use the 'Fix Database' button below.");
        } else {
          console.error("Error fetching linking code:", error);
          setDbError("Failed to fetch linking code. Database issue detected.");
        }
      } else if (data && data.linking_code) {
        setLinkingCode(data.linking_code);
      }
    } catch (error) {
      console.error("Exception fetching linking code:", error);
      setDbError("An unexpected error occurred while fetching the linking code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a new linking code and save it to the database
  const generateNewLinkingCode = async () => {
    setIsGenerating(true);
    setDbError(null);
    
    try {
      // Generate a new code
      const newCode = generateChildLinkingCode();
      
      // First check if we need to fix the schema
      const { data: checkData, error: checkError } = await supabase
        .from("players")
        .select("linking_code")
        .limit(1);
        
      if (checkError && checkError.message?.includes("does not exist")) {
        setDbError("Cannot generate code: The linking_code column doesn't exist yet. Please use the 'Fix Database' button.");
        return;
      }
      
      // Try to save it directly to the database
      const { error } = await supabase
        .from("players")
        .update({ linking_code: newCode })
        .eq("id", playerId);
      
      if (error) {
        // Handle other types of errors
        console.error("Error generating new linking code:", error);
        if (error.message?.includes("update") && error.message?.includes("player_category")) {
          setDbError("Database trigger error. Please update the player profile first or contact support.");
        } else {
          toast({
            variant: "destructive",
            description: "Failed to generate new linking code: " + error.message,
          });
        }
      } else {
        // Update the UI
        setLinkingCode(newCode);
        toast({
          description: "New linking code generated successfully",
        });
      }
    } catch (error) {
      console.error("Exception generating new linking code:", error);
      toast({
        variant: "destructive",
        description: "An unexpected error occurred while generating a new linking code.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fix database schema
  const fixDatabaseSchema = async () => {
    setIsFixing(true);
    try {
      const success = await addLinkingCodeColumn();
      
      if (success) {
        setDbError(null);
        toast({
          description: "Database fixed successfully. Try generating a code now.",
        });
        
        // Refresh
        await fetchLinkingCode();
      } else {
        toast({
          variant: "destructive",
          description: "Failed to fix database schema. Please contact support.",
        });
      }
    } catch (error) {
      console.error("Error fixing database:", error);
      toast({
        variant: "destructive",
        description: "An error occurred while fixing the database.",
      });
    } finally {
      setIsFixing(false);
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

  // Fetch code on initial load
  useEffect(() => {
    if (!isLoading) {
      fetchLinkingCode();
    }
  }, [playerId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Player Linking Code
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateNewLinkingCode}
            disabled={isGenerating || !!dbError}
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
        {dbError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span>{dbError}</span>
              {dbError.includes("column doesn't exist") && (
                <Button 
                  size="sm" 
                  onClick={fixDatabaseSchema}
                  disabled={isFixing}
                  className="mt-2 self-start"
                >
                  {isFixing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wrench className="h-4 w-4 mr-2" />
                  )}
                  Fix Database
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        
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
            <p className="text-muted-foreground">{dbError ? "Cannot generate linking code due to database issue." : "No linking code found."}</p>
            {!dbError && (
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={generateNewLinkingCode}
                disabled={isGenerating}
              >
                Generate Code
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
