import React, { useState, useEffect } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

interface MetricChartProps {
  title: string;
  unit: string;
  color: string;
}

const generateInitialData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    name: i,
    value: Math.random() * 50 + 20,
  }));
};

const MetricChart: React.FC<MetricChartProps> = ({ title, unit, color }) => {
  const [data, setData] = useState(generateInitialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const lastValue = newData[newData.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.5) * 10;
        newData.push({
          name: prevData.length,
          value: Math.max(10, Math.min(90, newValue)), // Clamp value
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentValue = data[data.length - 1].value.toFixed(1);

  return (
    <div className="bg-background-dark/50 p-3 rounded-lg h-32 flex flex-col">
        <div className="flex justify-between items-baseline">
            <p className="text-sm text-text-muted-dark">{title}</p>
            <p className="font-bold text-lg text-text-dark">
                {currentValue} <span className="text-sm text-text-muted-dark">{unit}</span>
            </p>
        </div>
        <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <YAxis domain={[0, 100]} hide />
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} isAnimationActive={false}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default MetricChart;
