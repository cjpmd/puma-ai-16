import { FormationSelector } from "@/components/FormationSelector";

export default function FormationSelectorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Formation Selector</h1>
      <FormationSelector 
        format="7-a-side"
        onSelectionChange={() => {}}
      />
    </div>
  );
}