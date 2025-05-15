
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerType } from "@/types/player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { differenceInYears } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { 
  GOALKEEPER_ATTRIBUTES, 
  TECHNICAL_ATTRIBUTES, 
  MENTAL_ATTRIBUTES, 
  PHYSICAL_ATTRIBUTES 
} from "@/constants/attributes";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Plus, User, X } from "lucide-react";
import { generateChildLinkingCode } from "@/utils/database/setupUserRolesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  squadNumber: z.string().min(1, "Squad number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  playerType: z.string(),
  // Parent fields are optional
  parentName: z.string().optional(),
  parentEmail: z.string().email("Must be a valid email").optional(),
});

export const AddPlayerDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("player");
  const [playerData, setPlayerData] = useState<any>(null);
  const [linkingCode, setLinkingCode] = useState<string>("");
  const [codeCopied, setCodeCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      squadNumber: "",
      dateOfBirth: "",
      playerType: "OUTFIELD",
      parentName: "",
      parentEmail: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      squadNumber: "",
      dateOfBirth: "",
      playerType: "OUTFIELD",
      parentName: "",
      parentEmail: "",
    });
    setActiveTab("player");
    setPlayerData(null);
    setLinkingCode("");
    setCodeCopied(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setOpen(open);
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(linkingCode);
    setCodeCopied(true);
    toast({
      description: "Linking code copied to clipboard",
    });
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const onSubmitPlayerInfo = async (values: any) => {
    setIsSaving(true);
    try {
      if (!values.dateOfBirth) {
        toast({
          variant: "destructive",
          description: "Date of birth is required",
        });
        setIsSaving(false);
        return;
      }

      // Calculate age based on date of birth
      const age = differenceInYears(new Date(), new Date(values.dateOfBirth));

      // Generate a unique linking code
      const code = generateChildLinkingCode();

      const { data, error } = await supabase
        .from("players")
        .insert([
          {
            name: values.name,
            squad_number: values.squadNumber,
            date_of_birth: values.dateOfBirth,
            player_type: values.playerType,
            age: age,
            linking_code: code
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add initial attributes based on player type
      const attributes = values.playerType === "GOALKEEPER" 
        ? GOALKEEPER_ATTRIBUTES 
        : [...TECHNICAL_ATTRIBUTES, ...MENTAL_ATTRIBUTES, ...PHYSICAL_ATTRIBUTES];

      const { error: attributesError } = await supabase
        .from("player_attributes")
        .insert(
          attributes.map((attr) => ({
            player_id: data.id,
            name: attr.name,
            value: 10,
            category: attr.category,
          }))
        );

      if (attributesError) throw attributesError;

      // Set player data and linking code for parent tab
      setPlayerData(data);
      setLinkingCode(code);
      
      toast({
        description: "Player added successfully",
      });

      // If parent info was provided, move to parent tab
      if (values.parentName || values.parentEmail) {
        setActiveTab("parent");
      } else {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        setTimeout(() => {
          setIsSaving(false);
          setActiveTab("linkingCode");
        }, 500);
      }
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        variant: "destructive",
        description: "Failed to add player",
      });
      setIsSaving(false);
    }
  };

  const onAddParent = async () => {
    if (!playerData) return;
    
    setIsSaving(true);
    try {
      const values = form.getValues();
      
      if (!values.parentName && !values.parentEmail) {
        setActiveTab("linkingCode");
        setIsSaving(false);
        return;
      }
      
      // Add parent info to database
      const { error } = await supabase
        .from("player_parents")
        .insert([
          {
            player_id: playerData.id,
            name: values.parentName || "Parent",
            email: values.parentEmail,
            is_verified: false
          },
        ]);

      if (error) throw error;

      toast({
        description: "Parent information added successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["players"] });
      setTimeout(() => {
        setIsSaving(false);
        setActiveTab("linkingCode");
      }, 500);
    } catch (error) {
      console.error("Error adding parent:", error);
      toast({
        variant: "destructive",
        description: "Failed to add parent information",
      });
      setIsSaving(false);
    }
  };

  const finishProcess = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>Add Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
          <DialogDescription>
            Create a player profile and optionally add parent information
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="player" disabled={isSaving}>Player Info</TabsTrigger>
            <TabsTrigger value="parent" disabled={!playerData || isSaving}>Parent Info</TabsTrigger>
            <TabsTrigger value="linkingCode" disabled={!linkingCode || isSaving}>Linking Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="player">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPlayerInfo)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="squadNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Squad Number</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="playerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GOALKEEPER">Goalkeeper</SelectItem>
                          <SelectItem value="OUTFIELD">Outfield</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className={`w-full transition-all ${isSaving ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Saving Player...
                    </span>
                  ) : (
                    'Save & Continue'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="parent">
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-medium">Player: {playerData?.name}</p>
                <p className="text-sm text-muted-foreground">Squad #: {playerData?.squad_number}</p>
              </div>
              
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter parent name" />
                        </FormControl>
                        <FormDescription>Optional: Add parent name now</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="parent@example.com" type="email" />
                        </FormControl>
                        <FormDescription>
                          Optional: Parent can use this email to register and link to the player
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("player")}
                  disabled={isSaving}
                >
                  Back
                </Button>
                <Button 
                  onClick={onAddParent}
                  disabled={isSaving}
                  className={isSaving ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Add Parent Info
                    </span>
                  )}
                </Button>
              </div>
              
              <div className="text-center pt-4">
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab("linkingCode")}
                  className="text-sm"
                  disabled={isSaving}
                >
                  Skip & Go to Linking Code
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="linkingCode">
            <div className="space-y-5 py-2">
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="font-medium">Player: {playerData?.name}</p>
                <p className="text-sm text-muted-foreground">Squad #: {playerData?.squad_number}</p>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <p className="text-sm font-medium mb-2">Player Linking Code:</p>
                <div className="flex items-center gap-2">
                  <div className="bg-white p-3 rounded border flex-1 text-center font-mono text-lg tracking-wider">
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
                <p className="text-sm mt-2 text-muted-foreground">
                  Share this code with the player's parent. They can use it to link to their child in the parent dashboard.
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This code can only be used once and will securely link a parent account to this player.
                </p>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button onClick={finishProcess}>
                Complete
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
