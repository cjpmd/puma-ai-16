
// Add a null/undefined check before accessing the 'type' property
const sessionType = (sessionsData.error && 'error' in sessionsData.error) 
  ? "Unknown" 
  : (sessionsData.data && sessionsData.data.type) || "Unknown";
