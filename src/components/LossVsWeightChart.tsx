'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { TaskType } from '@/lib/neural-network';

interface TrajectoryDataPoint {
  step: number;
  loss: number;
  weightValue: number;
  weightGradient: number;
}

interface LandscapeDataPoint {
  weightValue: number;
  loss: number;
}

interface LossVsWeightChartProps {
  data: TrajectoryDataPoint[];
  weightName?: string;
  className?: string;
  network?: {
    getWeights: () => {
      weights1: number[][];
      weights2: number[][];
      biases1: number[];
      biases2: number[];
    };
    setWeights: (weights: {
      weights1: number[][];
      weights2: number[][];
      biases1: number[];
      biases2: number[];
    }) => void;
    predict: (inputs: number[]) => number[];
  };
  currentInput?: number[];
  currentTarget?: number[];
  taskType: TaskType;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: LandscapeDataPoint;
  }>;
  label?: number;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 text-white p-3 rounded-md border border-gray-700 shadow-lg text-xs">
        <p>Weight: <span className="text-blue-400">{label?.toFixed(4)}</span></p>
        <p>Loss: <span className="text-red-400">{data.loss?.toFixed(4)}</span></p>
      </div>
    );
  }
  return null;
};

export const LossVsWeightChart: React.FC<LossVsWeightChartProps> = ({ 
  data,
  weightName = 'weights1[0][0]', 
  className = "",
  network,
  currentInput,
  currentTarget,
  taskType
}) => {
  // Generate loss landscape data
  const landscapeData = useMemo(() => {
    if (!network || !data || data.length === 0 || !currentInput || !currentTarget) return [];

    // Get current weight value
    const currentWeight = data[data.length - 1]?.weightValue || 0;
    
    // Generate a range of weight values around the current weight
    const weightRange = 2.0; // Range around current weight
    const numPoints = 50;
    const step = (2 * weightRange) / numPoints;
    
    const landscapePoints: LandscapeDataPoint[] = [];
    
    // Store original weights before any modifications
    const originalWeights = network.getWeights();
    
    for (let i = 0; i < numPoints; i++) {
      const testWeight = currentWeight - weightRange + (i * step);
      
      try {
        // Create a temporary modified network state
        const modifiedWeights = JSON.parse(JSON.stringify(originalWeights));
        
        // Modify the specific weight we're analyzing (weights1[0][0])
        if (modifiedWeights.weights1 && 
            modifiedWeights.weights1[0] && 
            modifiedWeights.weights1[0][0] !== undefined) {
          modifiedWeights.weights1[0][0] = testWeight;
          
          // Temporarily set the modified weights
          network.setWeights(modifiedWeights);
          
          // Compute loss at this weight value
          const prediction = network.predict(currentInput);
          const epsilon = 1e-12; // Small value to prevent log(0)
          let loss;

          if (taskType === 'classification') {
            loss = prediction.reduce((sum: number, pred: number, idx: number) => {
              const targetVal = currentTarget[idx] === undefined ? 0 : currentTarget[idx];
              const y = Math.max(epsilon, Math.min(1 - epsilon, pred)); // Clamp output
              return sum - (targetVal * Math.log(y) + (1 - targetVal) * Math.log(1 - y));
            }, 0) / prediction.length;
          } else { // Regression
            loss = prediction.reduce((sum: number, pred: number, idx: number) => {
              const targetVal = currentTarget[idx] === undefined ? 0 : currentTarget[idx];
              return sum + 0.5 * Math.pow(pred - targetVal, 2);
            }, 0) / prediction.length;
          }
          
          landscapePoints.push({
            weightValue: testWeight,
            loss: loss
          });
        }
      } catch (error) {
        // Skip this point if there's an error
        console.warn('Error computing loss at weight value:', testWeight, error);
      }
    }
    
    // Always restore original weights at the end
    try {
      network.setWeights(originalWeights);
    } catch (error) {
      console.warn('Error restoring original weights:', error);
    }
    
    return landscapePoints;
  }, [network, data, currentInput, currentTarget, taskType]);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">Loss Landscape - {weightName}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data yet. Start training to see the loss landscape.
        </div>
      </div>
    );
  }

  const currentWeight = data[data.length - 1]?.weightValue;
  const currentLoss = data[data.length - 1]?.loss;

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Loss Landscape - {weightName}
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              dataKey="weightValue"
              domain={['dataMin', 'dataMax']}
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#4B5563' }}
              label={{ value: `Weight (${weightName})`, position: 'insideBottom', dy: 15, fill:'#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="loss"
              domain={['dataMin', 'dataMax']}
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#4B5563' }}
              label={{ value: 'Loss', angle: -90, position: 'insideLeft', dx: -15, fill:'#9CA3AF', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Loss Landscape Curve */}
            {landscapeData.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="loss" 
                data={landscapeData}
                stroke="#8884d8" 
                strokeWidth={3}
                dot={false}
                name="Loss Landscape"
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Overlay current position as a scatter point */}
      {currentWeight !== undefined && currentLoss !== undefined && (
        <div className="absolute inset-0 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <XAxis 
                type="number" 
                dataKey="weightValue"
                domain={['dataMin', 'dataMax']}
                hide
              />
              <YAxis 
                type="number" 
                dataKey="loss"
                domain={['dataMin', 'dataMax']}
                hide
              />
              <Scatter 
                data={[{ weightValue: currentWeight, loss: currentLoss }]}
                fill="#ff7300"
                name="Current Position"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {data.length > 0 && currentWeight !== undefined && (
        <div className="mt-4 text-sm text-gray-300">
          <span>Current Weight: {currentWeight.toFixed(4)} | Current Loss: {currentLoss?.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
}; 