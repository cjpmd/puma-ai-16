
// Add a default object with the expected properties for when data is missing
const defaultSettings = {
  team_name: "",
  team_colors: ["#ffffff", "#000000"],
  // Add other default properties as needed
};

// Use the settings object with fallbacks:
const settings = settingsData.data || defaultSettings;
const teamName = settings.team_name || "Team";
const teamColors = settings.team_colors || ["#ffffff", "#000000"];
