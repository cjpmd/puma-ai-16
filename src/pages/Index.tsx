import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Index() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center mb-12">
        <img src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png" alt="Logo" className="w-48 mb-8" />
        <h1 className="text-4xl font-bold">Welcome to Puma.AI</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/squad">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Squad Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage your team roster, player attributes, and squad details
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View team and player performance analytics and statistics
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/coaches">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Coaches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage coaching staff and their responsibilities
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}