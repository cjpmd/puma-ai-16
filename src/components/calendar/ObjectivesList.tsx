import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ObjectivesListProps {
  date: Date;
  objectives: any[];
  onEditObjective: (objective: any) => void;
}

export const ObjectivesList = ({
  date,
  objectives,
  onEditObjective
}: ObjectivesListProps) => {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Objectives for {format(date, 'MMMM yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {objectives?.map((objective) => (
            <div 
              key={objective.id} 
              className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
              onClick={() => onEditObjective(objective)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{objective.title}</h4>
                  <p className="text-sm text-muted-foreground">{objective.description}</p>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>Player: {objective.players?.name}</span>
                    <span className="mx-2">•</span>
                    <span>Coach: {objective.profiles?.name}</span>
                    <span className="mx-2">•</span>
                    <span>Review: {format(new Date(objective.review_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    objective.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                    objective.status === 'IMPROVING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {objective.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {objectives?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No objectives scheduled for review this month
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};