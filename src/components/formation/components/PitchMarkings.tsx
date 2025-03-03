
import { FormationFormat } from "../types";

interface PitchMarkingsProps {
  format: FormationFormat;
}

export const PitchMarkings = ({ format }: PitchMarkingsProps) => {
  switch (format) {
    case "11-a-side":
      return (
        <>
          {/* Center line */}
          <div className="absolute w-full h-[1px] bg-white top-1/2 transform -translate-y-1/2"></div>
          
          {/* Center circle */}
          <div className="absolute w-[40%] h-[26%] rounded-full border-2 border-white/70 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Center spot */}
          <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Top goal area */}
          <div className="absolute w-[70%] h-[15%] border-2 border-white/70 top-0 left-1/2 transform -translate-x-1/2"></div>
          <div className="absolute w-[40%] h-[7%] border-2 border-white/70 top-0 left-1/2 transform -translate-x-1/2"></div>
          
          {/* Top penalty arc */}
          <div className="absolute w-[50%] h-[10%] border-b-2 border-white/70 rounded-b-full top-[15%] left-1/2 transform -translate-x-1/2"></div>
          
          {/* Bottom goal area */}
          <div className="absolute w-[70%] h-[15%] border-2 border-white/70 bottom-0 left-1/2 transform -translate-x-1/2"></div>
          <div className="absolute w-[40%] h-[7%] border-2 border-white/70 bottom-0 left-1/2 transform -translate-x-1/2"></div>
          
          {/* Bottom penalty arc */}
          <div className="absolute w-[50%] h-[10%] border-t-2 border-white/70 rounded-t-full bottom-[15%] left-1/2 transform -translate-x-1/2"></div>
        </>
      );
    case "9-a-side":
    case "7-a-side":
      return (
        <>
          {/* Center line */}
          <div className="absolute w-full h-[1px] bg-white top-1/2 transform -translate-y-1/2"></div>
          
          {/* Center circle */}
          <div className="absolute w-[40%] h-[26%] rounded-full border-2 border-white/70 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Center spot */}
          <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Top goal area */}
          <div className="absolute w-[60%] h-[12%] border-2 border-white/70 top-0 left-1/2 transform -translate-x-1/2"></div>
          
          {/* Bottom goal area */}
          <div className="absolute w-[60%] h-[12%] border-2 border-white/70 bottom-0 left-1/2 transform -translate-x-1/2"></div>
        </>
      );
    case "5-a-side":
      return (
        <>
          {/* Center line */}
          <div className="absolute w-full h-[1px] bg-white top-1/2 transform -translate-y-1/2"></div>
          
          {/* Center circle */}
          <div className="absolute w-[30%] h-[20%] rounded-full border-2 border-white/70 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Center spot */}
          <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Top D */}
          <div className="absolute w-[50%] h-[10%] border-2 border-white/70 top-0 left-1/2 transform -translate-x-1/2"></div>
          
          {/* Bottom D */}
          <div className="absolute w-[50%] h-[10%] border-2 border-white/70 bottom-0 left-1/2 transform -translate-x-1/2"></div>
        </>
      );
    default:
      return null;
  }
};
