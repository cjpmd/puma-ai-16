import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart2, UserCog } from "lucide-react";

export default function Index() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center mb-12">
        <img src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png" alt="Logo" className="w-48 mb-8" />
        <h1 className="text-4xl font-bold text-center mb-4">Welcome to Puma.AI</h1>
        <p className="text-lg text-muted-foreground text-center">Your comprehensive football management solution</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/squad">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Squad Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Manage your team roster, player attributes, and squad details efficiently
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <BarChart2 className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                View comprehensive team and player performance analytics and statistics
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/coaches">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <UserCog className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Coaches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Manage coaching staff and their responsibilities effectively
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}