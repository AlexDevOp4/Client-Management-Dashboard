import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProgressChart = ({ progressData, metric }) => {
  if (!progressData || progressData.length === 0) {
    return <p>No progress data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={progressData}>
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={metric}
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
