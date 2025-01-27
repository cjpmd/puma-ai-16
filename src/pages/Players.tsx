import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PlayersPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Players</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Players List</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Player management coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};