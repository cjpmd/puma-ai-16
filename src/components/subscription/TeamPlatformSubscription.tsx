
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth.tsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SubscriptionPlan } from "@/types/subscription";

export const TeamPlatformSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("club_plans")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      
      // Convert Json features to string[] if needed
      const formattedPlans = (data || []).map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? JSON.parse(plan.features) 
          : (Array.isArray(plan.features) ? plan.features : [])
      }));
      
      setPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!profile || !profile.club_id) {
      toast.error("You need to create a club first");
      navigate("/club-settings");
      return;
    }

    const selectedPlan = plans.find((plan) => plan.id === planId);
    if (!selectedPlan) {
      toast.error("Selected plan not found");
      return;
    }

    try {
      // In a real app, redirect to payment processing
      // For this demo, we'll just create a subscription record
      const { error } = await supabase.from("club_subscriptions").insert({
        club_id: profile.club_id,
        subscription_amount: selectedPlan.price_monthly,
        subscription_plan: selectedPlan.name,
        subscription_period: "monthly",
        status: "active",
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      });

      if (error) throw error;

      toast.success("Club subscription created successfully");
      navigate("/platform");
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Platform Subscription</h1>
      <p className="text-muted-foreground mb-8">
        Choose a subscription plan to enable multi-team management features
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading subscription plans...</p>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.max_teams ? `Up to ${plan.max_teams} teams` : "Unlimited teams"}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">£{plan.price_monthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSubscribe(plan.id)} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
