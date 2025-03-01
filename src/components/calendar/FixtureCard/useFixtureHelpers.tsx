
import { useState, useEffect } from "react";

export const useFixtureHelpers = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time for display, handling nullable times
  const formatTime = (timeString?: string | null) => {
    if (!timeString) return null;
    
    // Try to split the time in HH:MM:SS format
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      // Convert to 12-hour format
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert '0' to '12'
      return `${hours}:${minutes} ${ampm}`;
    }
    
    return timeString; // Return the original format if parsing fails
  };

  return {
    currentTime,
    formatTime
  };
};
