'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line as RechartsLine } from 'recharts';
import { NeuralNetwork, TaskType } from '@/lib/neural-network';

interface TrainingDataPoint {
  inputs: number[];
  targets: number[];
  label?: number; 
}

interface DataScatterPlotProps {
  data: TrainingDataPoint[];
  network: NeuralNetwork | null;
  taskType: TaskType;
  // currentStepData?: TrainingDataPoint | null; // Removed for now
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    let predictionText = 'N/A';
    if (point.prediction !== undefined) {
        predictionText = Array.isArray(point.prediction) 
            ? point.prediction.map((p:number) => p.toFixed(3)).join(', ') 
            : point.prediction.toFixed(3);
    }

    return (
      <div className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 shadow-lg text-xs">
        {point.inputs && <p>Input: [{point.inputs.map((val:number) => val.toFixed(2)).join(', ')}]</p>}
        {point.targets && <p>Target: [{point.targets.map((val:number) => val.toFixed(2)).join(', ')}]</p>}
        {point.label !== undefined && <p>Class Label: {point.label}</p>}
        <p>Prediction: {predictionText}</p>
      </div>
    );
  }
  return null;
};

export const DataScatterPlot: React.FC<DataScatterPlotProps> = ({ data, network, taskType }) => {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data to display.</div>;
  }

  const plotData = data.map(d => ({
    ...d,
    x: d.inputs[0], 
    y: taskType === 'regression' ? d.targets[0] : (d.inputs[1] !== undefined ? d.inputs[1] : 0),
    prediction: network ? network.predict(d.inputs) : undefined
  }));

  const xValues = plotData.map(p => p.x);
  const yValues = plotData.map(p => p.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const xPadding = (maxX - minX) * 0.1 || 0.5;
  const yPadding = (maxY - minY) * 0.1 || 0.5;

  const xDomain: [number, number] = [minX - xPadding, maxX + xPadding];
  const yDomain: [number, number] = [minY - yPadding, maxY + yPadding];
  
  const regressionLineData: {x: number, y: number}[] = [];
  if (taskType === 'regression' && network && data.every(d => d.inputs.length === 1)) {
    const linePoints = 20;
    const step = (xDomain[1] - xDomain[0]) / linePoints;
    for(let i=0; i <= linePoints; i++){
        const xVal = xDomain[0] + i * step;
        const pred = network.predict([xVal]);
        regressionLineData.push({x: xVal, y: pred[0]});
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 15, right: 15, bottom: 25, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
            type="number" 
            dataKey="x" 
            name="Input X" 
            stroke="#9CA3AF" 
            fontSize={10} 
            tickLine={false} 
            axisLine={{ stroke: '#4B5563' }}
            domain={xDomain}
            allowDataOverflow={true}
            label={{ value: taskType === 'regression' ? 'Input (X)' : 'Input Feature 1', position: 'insideBottom', dy:15, fill:'#9CA3AF', fontSize: 10}}
        />
        <YAxis 
            type="number" 
            dataKey="y" 
            name={taskType === 'regression' ? 'Target/Prediction (Y)' : 'Input Feature 2'}
            stroke="#9CA3AF" 
            fontSize={10} 
            tickLine={false} 
            axisLine={{ stroke: '#4B5563' }}
            domain={yDomain}
            allowDataOverflow={true}
            label={{ value: taskType === 'regression' ? 'Target / Prediction (Y)' : 'Input Feature 2', angle: -90, position: 'insideLeft', dx: -10, fill:'#9CA3AF', fontSize: 10}}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#4B5563' }} content={<CustomTooltip />} />
        
        <Scatter name="Data Points" data={plotData} fillOpacity={0.7}>
          {plotData.map((entry, index) => (
            <Scatter // This is not how Recharts Scatter is typically used for multiple series.
                      // Instead, one <Scatter> component per series or use `shape` prop on a single Scatter.
              key={`cell-${index}`}
              dataKey="y" // This is bound to the YAxis, but individual point data is in `entry`
              fill={
                taskType === 'classification' ? 
                  (entry.label === 1 ? '#2563eb' : (entry.label === 0 ? '#dc2626' : '#6b7280')) // Blue for class 1, Red for class 0, Gray otherwise
                  : '#8884d8' // Default for regression
              }
            />
          ))}
        </Scatter>

        {taskType === 'regression' && regressionLineData.length > 0 && (
          <RechartsLine 
            type="monotone" 
            dataKey="y" 
            data={regressionLineData} 
            stroke="#34d399" 
            strokeWidth={2} 
            dot={false} 
            name="Regression Fit"
            isAnimationActive={false}
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
}; 