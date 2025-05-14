
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Check, CreditCard, AlertTriangle, Lock, Unlock } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  max_players: number;
  features: string[];
  is_active: boolean;
}

export function TeamPlatformSubscription() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Get team info
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select(`
            id, 
            team_name,
            team_subscriptions (
              id,
              status,
              subscription_plan,
              subscription_amount,
              start_date,
              end_date
            )
          `)
          .eq('admin_id', profile.id)
          .single();

        if (teamError) {
          console.error("Error fetching team:", teamError);
          throw new Error("No team found. Please create a team first.");
        }

        setTeam(teamData);
        
        // Set current subscription if exists
        if (teamData.team_subscriptions && teamData.team_subscriptions.length > 0) {
          setCurrentSubscription(teamData.team_subscriptions[0]);
        }

        // Get subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('team_plans')
          .select('*')
          .eq('is_active', true);

        if (plansError) {
          console.error("Error fetching plans:", plansError);
          throw new Error("Failed to load subscription plans.");
        }

        // Transform features from JSONB to array
        const transformedPlans = plansData.map(plan => ({
          ...plan,
          features: Object.keys(plan.features || {}).filter(key => plan.features[key])
        }));

        setPlans(transformedPlans);
      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load subscription data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const handleSubscribe = async (planId: string) => {
    if (!team) return;

    setCheckoutLoading(true);
    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-team-subscription', {
        body: {
          teamId: team.id,
          planId: planId
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to create subscription");
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!team || !currentSubscription) return;

    setCheckoutLoading(true);
    try {
      // Call Supabase Edge Function for customer portal
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { teamId: team.id }
      });

      if (error) {
        throw new Error(error.message || "Failed to open customer portal");
      }

      // Redirect to Stripe customer portal
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const isActive = currentSubscription?.status === 'active';
  const isExpired = currentSubscription?.end_date && new Date(currentSubscription.end_date) < new Date();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Subscription</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <p className="text-muted-foreground">Loading subscription data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <span>Puma AI Platform Subscription</span>
        </CardTitle>
        <CardDescription>
          Choose a subscription plan for your team to access premium features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {currentSubscription ? (
          <div className="mb-6">
            <div className="bg-muted/50 rounded-lg p-4 border">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Current Subscription
                {isActive ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {isExpired ? "Expired" : currentSubscription.status}
                  </Badge>
                )}
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{currentSubscription.subscription_plan || "Standard"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">£{currentSubscription.subscription_amount?.toFixed(2) || "0.00"}/month</span>
                </div>
                {currentSubscription.end_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next billing date:</span>
                    <span className="font-medium">{format(new Date(currentSubscription.end_date), "PPP")}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Loading..." : "Manage Subscription"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h3 className="text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>No active subscription</span>
              </h3>
              <p className="text-amber-700 mt-1 text-sm">
                Subscribe to a plan below to access premium features for your team.
              </p>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.subscription_plan === plan.name;
            
            return (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative overflow-hidden",
                  isCurrentPlan && "border-primary border-2"
                )}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs py-1 px-2 rounded-bl-md">
                    Your Plan
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">£{plan.price_monthly.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mb-4">per month</div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Up to {plan.max_players} players</span>
                    </div>
                    
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || checkoutLoading}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isCurrentPlan ? "Current Plan" : checkoutLoading ? "Loading..." : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
