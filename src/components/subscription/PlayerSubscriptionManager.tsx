import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useNavigate } from "react-router-dom";

interface PlayerSubscriptionManagerProps {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
}

export function PlayerSubscriptionManager({
  playerId,
  playerName,
  teamId,
  teamName,
}: PlayerSubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("10");
  const [interval, setInterval] = useState<"monthly">("monthly");
  const supabase = createClientComponentClient();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Create a subscription record in the database
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([
          {
            player_id: playerId,
            team_id: teamId,
            amount: parseFloat(amount),
            interval: interval,
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Subscription created successfully");
      navigate(`/team-dashboard`);
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Player Subscription</CardTitle>
        <CardDescription>
          Set up a subscription for {playerName} with {teamName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Monthly Subscription Amount (£)</Label>
          <Input
            id="amount"
            placeholder="10.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Billing Interval</Label>
          <RadioGroup
            defaultValue="monthly"
            value={interval}
            onValueChange={(value) => setInterval(value as "monthly")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Create Subscription"}
        </Button>
      </CardFooter>
    </Card>
  );
}
