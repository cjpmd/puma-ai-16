import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Settings configuration coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};