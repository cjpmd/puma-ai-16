
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamSubscription } from "@/types/subscription";

interface ActiveSubscriptionsTableProps {
  subscriptions: TeamSubscription[] | any[];
}

export const ActiveSubscriptionsTable: React.FC<ActiveSubscriptionsTableProps> = ({ subscriptions }) => {
  if (!subscriptions || subscriptions.length === 0) {
    return <div>No active subscriptions found.</div>;
  }

  return (
    <Table>
      <TableCaption>Your active subscriptions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Subscription Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell>{sub.subscription_plan || "Standard"}</TableCell>
            <TableCell>£{sub.subscription_amount}</TableCell>
            <TableCell>
              <Badge variant={sub.status === "active" ? "default" : "destructive"}>
                {sub.status}
              </Badge>
            </TableCell>
            <TableCell>
              {sub.start_date
                ? new Date(sub.start_date).toLocaleDateString()
                : "N/A"}
            </TableCell>
            <TableCell>
              {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "N/A"}
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
