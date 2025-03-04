
import { FixtureCard } from "@/components/calendar/FixtureCard";
import type { Fixture } from "@/types/fixture";

interface FixturesSectionProps {
  fixtures: Fixture[];
  onEditFixture: (fixture: Fixture) => void;
  onDeleteFixture: (fixtureId: string) => void;
  onUpdateFixtureDate: (fixtureId: string, newDate: Date) => void;
}

export const FixturesSection = ({
  fixtures,
  onEditFixture,
  onDeleteFixture,
  onUpdateFixtureDate,
}: FixturesSectionProps) => {
  if (!fixtures.length) return null;
  
  // Convert string dates to Date objects
  const handleFixtureDateChange = (fixtureId: string, newDate: Date) => {
    onUpdateFixtureDate(fixtureId, newDate);
  };

  return (
    <>
      {fixtures.map((fixture) => (
        <FixtureCard 
          key={fixture.id} 
          fixture={fixture}
          onEdit={() => {
            console.log("Calling onEditFixture for fixture:", fixture.id);
            onEditFixture(fixture);
          }}
          onDelete={onDeleteFixture}
          onDateChange={handleFixtureDateChange}
        />
      ))}
    </>
  );
};
