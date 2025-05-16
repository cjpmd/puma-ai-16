
import { LockIcon, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface SubscriptionBannerProps {
  isSubscribed: boolean;
  isLoading: boolean;
}

export const SubscriptionBanner = ({ isSubscribed, isLoading }: SubscriptionBannerProps) => {
  const navigate = useNavigate();
  
  const handleSubscribeClick = () => {
    // Navigate to subscription management
    navigate("/subscription");
  };
  
  if (isSubscribed || isLoading) return null;
  
  return (
    <Card className="mb-6 border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <LockIcon className="h-5 w-5" />
          Premium Analytics Locked
        </CardTitle>
        <CardDescription className="text-amber-700">
          Upgrade to access enhanced analytics features
        </CardDescription>
      </CardHeader>
      <CardContent className="text-amber-700">
        <p>Enhanced analytics features include:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Connect to wearables for enhanced training data</li>
          <li>Performance trends over time</li>
          <li>Position distribution analysis</li>
          <li>Advanced player metrics</li>
          <li>Custom data visualizations</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          variant="default"
          className="bg-amber-600 hover:bg-amber-700"
          onClick={handleSubscribeClick}
        >
          Upgrade to Premium
        </Button>
      </CardFooter>
    </Card>
  );
};
