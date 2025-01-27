import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Welcome to your dashboard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};