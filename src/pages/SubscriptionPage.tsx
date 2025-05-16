
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, ArrowLeft } from "lucide-react";
import { TeamPlatformSubscription } from "@/components/subscription/TeamPlatformSubscription";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { Skeleton } from "@/components/ui/skeleton";

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { isSubscribed, isLoading, subscriptionTier, checkSubscriptionStatus } = useSubscriptionStatus();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // For the demo, we'll use the team subscription component
  // In a real app, you might want to create a separate component for player subscriptions

  const handleManualRefresh = () => {
    checkSubscriptionStatus();
    toast({
      title: "Refreshing subscription status",
      description: "Please wait while we check your subscription information."
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Current Subscription Status
            </CardTitle>
            <CardDescription>
              Your account's subscription information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-lg font-semibold flex items-center gap-2">
                  Status: 
                  <span className={isSubscribed ? "text-green-600" : "text-amber-600"}>
                    {isSubscribed ? "Active" : "Inactive"}
                  </span>
                </div>
                {isSubscribed && (
                  <div className="text-sm text-muted-foreground">
                    Subscription Tier: {subscriptionTier || "Premium"}
                  </div>
                )}
                <div className="flex items-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManualRefresh}
                  >
                    Refresh Status
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Subscription plans */}
      <TeamPlatformSubscription />
      
      {/* Feature comparison */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Analytics Feature Comparison</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic plan */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Plan</CardTitle>
              <CardDescription>Free with your account</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Basic player statistics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Minutes played tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Fixture category breakdown</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Simple player radar charts</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Premium plan */}
          <Card className="border-primary">
            <CardHeader>
              <div className="bg-primary text-primary-foreground text-xs py-1 px-3 rounded-full w-fit mb-2">
                RECOMMENDED
              </div>
              <CardTitle>Premium Analytics</CardTitle>
              <CardDescription>Enhanced analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>All Basic Plan features</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Performance trends over time</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Position distribution analysis</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Advanced player metrics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Interactive data visualizations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Enterprise plan */}
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For professional clubs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>All Premium Analytics features</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Custom data integrations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Advanced reporting tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Data export capabilities</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
