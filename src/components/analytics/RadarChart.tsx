import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface RadarChartProps {
  data: { name: string; value: number }[];
  title: string;
}

export const RadarChart = ({ data, title }: RadarChartProps) => {
  // Calculate the domain dynamically based on the data
  const maxValue = Math.max(...data.map(d => d.value));
  const domain: [number, number] = [0, Math.ceil(maxValue * 1.1)]; // Add 10% padding

  return (
    <div className="h-64">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis domain={domain} />
          <Radar
            name="Attributes"
            dataKey="value"
            stroke="#4ADE80"
            fill="#4ADE80"
            fillOpacity={0.6}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};