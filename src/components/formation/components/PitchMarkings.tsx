
import { FormationFormat } from "../types";

interface PitchMarkingsProps {
  format: FormationFormat;
}

export const PitchMarkings = ({ format }: PitchMarkingsProps) => {
  switch (format) {
    case "11-a-side":
      return (
        <>
          <div className="absolute w-full h-[80%] border-2 border-white/40 rounded"></div>
          <div className="absolute w-[60%] h-[30%] border-2 border-white/40 bottom-[20%] left-[20%]"></div>
          <div className="absolute w-[20%] h-[10%] border-2 border-white/40 bottom-[20%] left-[40%]"></div>
          <div className="absolute w-[60%] h-[30%] border-2 border-white/40 top-0 left-[20%]"></div>
          <div className="absolute w-[20%] h-[10%] border-2 border-white/40 top-0 left-[40%]"></div>
          <div className="absolute w-[30%] rounded-full border-2 border-white/40 h-[20%] bottom-[20%] left-[35%]"></div>
          <div className="absolute w-[30%] rounded-full border-2 border-white/40 h-[20%] top-0 left-[35%]"></div>
          <div className="absolute w-[20%] h-[20%] rounded-full border-2 border-white/40 top-[40%] left-[40%]"></div>
        </>
      );
    case "9-a-side":
    case "7-a-side":
      return (
        <>
          <div className="absolute w-full h-[80%] border-2 border-white/40 rounded"></div>
          <div className="absolute w-[50%] h-[25%] border-2 border-white/40 bottom-[20%] left-[25%]"></div>
          <div className="absolute w-[50%] h-[25%] border-2 border-white/40 top-0 left-[25%]"></div>
          <div className="absolute w-[20%] h-[20%] rounded-full border-2 border-white/40 top-[40%] left-[40%]"></div>
        </>
      );
    case "5-a-side":
      return (
        <>
          <div className="absolute w-full h-[80%] border-2 border-white/40 rounded"></div>
          <div className="absolute w-[40%] h-[20%] border-2 border-white/40 bottom-[20%] left-[30%]"></div>
          <div className="absolute w-[40%] h-[20%] border-2 border-white/40 top-0 left-[30%]"></div>
          <div className="absolute w-[16%] h-[16%] rounded-full border-2 border-white/40 top-[42%] left-[42%]"></div>
        </>
      );
    default:
      return null;
  }
};
