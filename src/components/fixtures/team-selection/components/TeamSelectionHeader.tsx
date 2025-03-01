
import { SaveSelectionButton } from "./SaveSelectionButton";
import { useTeamSelection } from "../context/TeamSelectionContext";

export const TeamSelectionHeader = () => {
  const { fixture } = useTeamSelection();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Team Selection - {fixture?.opponent}</h2>
      <SaveSelectionButton />
    </div>
  );
};
