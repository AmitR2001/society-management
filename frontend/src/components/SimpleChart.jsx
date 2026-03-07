import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SimpleChart = ({ data }) => (
  <div style={{ width: '100%', height: 260 }}>
    <ResponsiveContainer>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#0d6efd" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default SimpleChart;
