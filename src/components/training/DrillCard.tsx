import { Upload } from "lucide-react";

interface DrillCardProps {
  drill: {
    id: string;
    title: string;
    instructions: string | null;
    training_files: {
      id: string;
      file_name: string;
      file_path: string;
    }[];
  };
  fileUrls: Record<string, string>;
}

export const DrillCard = ({ drill, fileUrls }: DrillCardProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium">{drill.title}</h4>
      {drill.instructions && (
        <p className="text-sm text-muted-foreground mt-2">{drill.instructions}</p>
      )}
      {drill.training_files?.length > 0 && (
        <div className="mt-2">
          {drill.training_files.map((file) => (
            <a
              key={file.id}
              href={fileUrls[file.file_path]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center mt-1"
            >
              <Upload className="h-4 w-4 mr-1" />
              {file.file_name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};