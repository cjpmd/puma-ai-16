
import { Badge } from "@/components/ui/badge";
import { isAfter, isBefore } from "date-fns";

interface FixtureStatusProps {
  fixture: {
    date?: string;
    fixture_team_times?: Array<{
      team_number: number;
      start_time?: string | null;
      end_time?: string | null;
      performance_category?: string;
    }>;
  };
  currentTime: Date;
}

export const FixtureStatus = ({ fixture, currentTime }: FixtureStatusProps) => {
  const status = determineFixtureStatus(fixture, currentTime);
  const { variant, text } = getBadgeVariant(status);

  return <Badge variant={variant}>{text}</Badge>;
};

const determineFixtureStatus = (
  fixture: FixtureStatusProps["fixture"],
  now: Date
): "upcoming" | "live" | "completed" => {
  // If fixture has no team times, use the main time fields
  if (!fixture.fixture_team_times || fixture.fixture_team_times.length === 0) {
    // Default status logic if no team times available
    return "upcoming";
  }
  
  // Get the latest end time from all teams
  const lastTeamToFinish = [...fixture.fixture_team_times].sort((a, b) => {
    // Default parsing for comparison, handling null values
    const endTimeA = a.end_time ? parseISO(`2000-01-01T${a.end_time}`) : new Date(0);
    const endTimeB = b.end_time ? parseISO(`2000-01-01T${b.end_time}`) : new Date(0);
    return endTimeB.getTime() - endTimeA.getTime(); // Sort descending
  })[0];
  
  // Get the earliest start time from all teams
  const firstTeamToStart = [...fixture.fixture_team_times].sort((a, b) => {
    // Default parsing for comparison, handling null values
    const startTimeA = a.start_time ? parseISO(`2000-01-01T${a.start_time}`) : new Date(0);
    const startTimeB = b.start_time ? parseISO(`2000-01-01T${b.start_time}`) : new Date(0);
    return startTimeA.getTime() - startTimeB.getTime(); // Sort ascending
  })[0];
  
  if (!lastTeamToFinish.end_time || !firstTeamToStart.start_time) {
    return "upcoming"; // Default to upcoming if times are missing
  }
  
  // Parse fixture date and times
  const fixtureDate = fixture.date ? new Date(fixture.date) : new Date();
  const todayDate = new Date();
  
  // Check if the fixture is today
  const isSameDay = 
    fixtureDate.getDate() === todayDate.getDate() &&
    fixtureDate.getMonth() === todayDate.getMonth() &&
    fixtureDate.getFullYear() === todayDate.getFullYear();
  
  if (!isSameDay) {
    // If fixture is in the past, mark as completed
    if (isBefore(fixtureDate, todayDate)) {
      return "completed";
    }
    // If fixture is in the future, mark as upcoming
    return "upcoming";
  }
  
  // For fixtures today, use the time to determine status
  // Extract hours and minutes for comparison
  const [startHours, startMinutes] = firstTeamToStart.start_time.split(':').map(Number);
  const [endHours, endMinutes] = lastTeamToFinish.end_time.split(':').map(Number);
  
  // Create Date objects for start and end times today
  const startTime = new Date();
  startTime.setHours(startHours, startMinutes, 0);
  
  const endTime = new Date();
  endTime.setHours(endHours, endMinutes, 0);
  
  // Compare current time with start and end times
  if (isBefore(now, startTime)) {
    return "upcoming";
  } else if (isAfter(now, endTime)) {
    return "completed";
  } else {
    return "live";
  }
};

const getBadgeVariant = (status: "live" | "completed" | "upcoming") => {
  switch (status) {
    case "live":
      return { variant: "success" as const, text: "Live" };
    case "completed":
      return { variant: "secondary" as const, text: "Completed" };
    case "upcoming":
    default:
      return { variant: "default" as const, text: "Upcoming" };
  }
};

// Add missing import
import { parseISO } from "date-fns";
