
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, CreditCard } from "lucide-react";
import { ActiveSubscriptionsTable } from "./ActiveSubscriptionsTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth.tsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
}

export const SubscriptionManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from("team_plans")
          .select("*")
          .eq("is_active", true);

        if (plansError) throw plansError;
        
        // Ensure plansData is not null before setting state
        setPlans(plansData || []);

        // Fetch user subscriptions if logged in
        if (profile) {
          const { data: subscriptionsData, error: subscriptionsError } = await supabase
            .from("team_subscriptions")
            .select("*, team_plans(*)")
            .eq("team_id", profile.team_id);

          if (subscriptionsError) throw subscriptionsError;
          setUserSubscriptions(subscriptionsData || []);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const handleSubscribe = async (planId: string) => {
    if (!profile || !profile.team_id) {
      toast.error("You must be logged in and have a team to subscribe");
      navigate("/auth");
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
      const { error } = await supabase.from("team_subscriptions").insert({
        team_id: profile.team_id,
        subscription_amount: selectedPlan.price_monthly,
        subscription_plan: selectedPlan.name,
        subscription_period: "monthly",
        status: "active",
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      });

      if (error) throw error;

      toast.success("Subscription created successfully");
      // Refresh subscriptions
      const { data, error: fetchError } = await supabase
        .from("team_subscriptions")
        .select("*, team_plans(*)")
        .eq("team_id", profile.team_id);

      if (fetchError) throw fetchError;
      setUserSubscriptions(data || []);
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Team Subscriptions</h1>

      {userSubscriptions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Your Active Subscriptions</h2>
          <ActiveSubscriptionsTable subscriptions={userSubscriptions} />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-6">Available Subscription Plans</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading subscription plans...</p>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>Perfect for small to medium teams</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">£{plan.price_monthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
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
