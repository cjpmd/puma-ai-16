import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface RadarChartProps {
  data: { name: string; value: number }[];
  title: string;
}

export const RadarChart = ({ data, title }: RadarChartProps) => {
  // Remove duplicate entries by name
  const uniqueData = data.reduce((acc, current) => {
    const existingItem = acc.find(item => item.name === current.name);
    if (!existingItem) {
      acc.push(current);
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="h-64">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={uniqueData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis domain={[0, 20]} /> {/* Fixed domain to match attribute scale */}
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