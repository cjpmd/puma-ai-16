import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart2, Calendar } from "lucide-react";

export default function Index() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center mb-12">
        <img src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png" alt="Logo" className="w-48 mb-8" />
        <h1 className="text-4xl font-bold text-center mb-4">Welcome to Puma.AI</h1>
        <p className="text-lg text-muted-foreground text-center">Your comprehensive football management solution</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        <Link to="/squad">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center p-4">
              <div className="mx-auto mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Squad Management</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-muted-foreground text-center">
                Manage your team roster, player attributes, and squad details efficiently
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center p-4">
              <div className="mx-auto mb-4">
                <BarChart2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-muted-foreground text-center">
                View comprehensive team and player performance analytics and statistics
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/fixtures">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center p-4">
              <div className="mx-auto mb-4">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Fixtures</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-muted-foreground text-center">
                Manage team fixtures, schedules, and match results efficiently
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}