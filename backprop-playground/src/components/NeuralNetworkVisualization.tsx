'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TaskType } from '@/lib/neural-network';

interface Node {
  id: string;
  x: number;
  y: number;
  value: number;
  layer: 'input' | 'hidden' | 'output';
  index: number;
}

interface Connection {
  from: Node;
  to: Node;
  weight: number;
  gradient?: number;
  isActive?: boolean;
}

interface NeuralNetworkVisualizationProps {
  inputs: number[];
  hiddenValues: number[];
  outputs: number[];
  weights1: number[][];
  weights2: number[][];
  biases1: number[];
  biases2: number[];
  gradients?: {
    weights1: number[][];
    weights2: number[][];
    hidden: number[];
    output: number[];
  };
  showGradients?: boolean;
  className?: string;
  taskType?: TaskType;
}

export const NeuralNetworkVisualization: React.FC<NeuralNetworkVisualizationProps> = ({
  inputs,
  hiddenValues,
  outputs,
  weights1,
  weights2,
  biases1,
  biases2,
  gradients,
  showGradients = false,
  className = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  taskType = 'classification',
}) => {
  const width = 800;
  const height = 400;
  const padding = 80;

  // Create nodes
  const inputNodes: Node[] = inputs.map((value, i) => ({
    id: `input-${i}`,
    x: padding,
    y: height / (inputs.length + 1) * (i + 1),
    value,
    layer: 'input',
    index: i,
  }));

  const hiddenNodes: Node[] = hiddenValues.map((value, i) => ({
    id: `hidden-${i}`,
    x: width / 2,
    y: height / (hiddenValues.length + 1) * (i + 1),
    value,
    layer: 'hidden',
    index: i,
  }));

  const outputNodes: Node[] = outputs.map((value, i) => ({
    id: `output-${i}`,
    x: width - padding,
    y: height / (outputs.length + 1) * (i + 1),
    value,
    layer: 'output',
    index: i,
  }));

  // Create connections
  const connections: Connection[] = [];
  
  // Input to hidden connections
  if (weights1 && weights1.length > 0 && weights1[0] && weights1[0].length > 0) {
    inputNodes.forEach((inputNode) => {
      hiddenNodes.forEach((hiddenNode) => {
        if (weights1[inputNode.index] && weights1[inputNode.index][hiddenNode.index] !== undefined) {
          connections.push({
            from: inputNode,
            to: hiddenNode,
            weight: weights1[inputNode.index][hiddenNode.index],
            gradient: gradients?.weights1[inputNode.index]?.[hiddenNode.index],
          });
        }
      });
    });
  }

  // Hidden to output connections
  if (weights2 && weights2.length > 0 && weights2[0] && weights2[0].length > 0) {
    hiddenNodes.forEach((hiddenNode) => {
      outputNodes.forEach((outputNode) => {
        if (weights2[hiddenNode.index] && weights2[hiddenNode.index][outputNode.index] !== undefined) {
          connections.push({
            from: hiddenNode,
            to: outputNode,
            weight: weights2[hiddenNode.index][outputNode.index],
            gradient: gradients?.weights2[hiddenNode.index]?.[outputNode.index],
          });
        }
      });
    });
  }

  const getNodeColor = (node: Node) => {
    const value = node.value !== undefined ? node.value : 0;
    const intensity = Math.abs(value);
    const normalized = Math.min(intensity, 1);
    
    if (value > 0) {
      return `rgba(34, 197, 94, ${0.3 + normalized * 0.7})`;
    } else {
      return `rgba(239, 68, 68, ${0.3 + normalized * 0.7})`;
    }
  };

  const getConnectionColor = (connection: Connection) => {
    if (showGradients && connection.gradient !== undefined) {
      const intensity = Math.abs(connection.gradient);
      const normalized = Math.min(intensity * 10, 1);
      
      if (connection.gradient > 0) {
        return `rgba(59, 130, 246, ${0.3 + normalized * 0.7})`;
      } else {
        return `rgba(168, 85, 247, ${0.3 + normalized * 0.7})`;
      }
    }
    
    const weight = connection.weight !== undefined ? connection.weight : 0;
    const intensity = Math.abs(weight);
    const normalized = Math.min(intensity, 1);
    
    if (weight > 0) {
      return `rgba(34, 197, 94, ${0.3 + normalized * 0.7})`;
    } else {
      return `rgba(239, 68, 68, ${0.3 + normalized * 0.7})`;
    }
  };

  const getConnectionWidth = (connection: Connection) => {
    if (showGradients && connection.gradient !== undefined) {
      return Math.max(1, Math.abs(connection.gradient) * 20);
    }
    const weight = connection.weight !== undefined ? connection.weight : 0;
    return Math.max(1, Math.abs(weight) * 3);
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <svg viewBox="0 0 800 400" width={width} height={height} className="w-full h-auto">
        {/* Connections */}
        {connections.map((connection, i) => (
          <motion.line
            key={`connection-${i}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke={getConnectionColor(connection)}
            strokeWidth={getConnectionWidth(connection)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
        
        {/* Weight labels */}
        {connections.map((connection, i) => {
          const midX = (connection.from.x + connection.to.x) / 2;
          const midY = (connection.from.y + connection.to.y) / 2;
          const value = showGradients && connection.gradient !== undefined 
            ? connection.gradient 
            : connection.weight;
          
          return (
            <motion.text
              key={`weight-label-${i}`}
              x={midX}
              y={midY - 5}
              fill="white"
              fontSize="10"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {value !== undefined ? value.toFixed(2) : '0.00'}
            </motion.text>
          );
        })}

        {/* Nodes */}
        {[...inputNodes, ...hiddenNodes, ...outputNodes].map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={25}
              fill={getNodeColor(node)}
              stroke="white"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: node.index * 0.1 }}
            />
            <motion.text
              x={node.x}
              y={node.y + 5}
              fill="white"
              fontSize="12"
              textAnchor="middle"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: node.index * 0.1 + 0.2 }}
            >
              {node.value !== undefined ? node.value.toFixed(2) : '0.00'}
            </motion.text>
          </g>
        ))}

        {/* Bias values */}
        {hiddenNodes.map((node, i) => (
          <motion.text
            key={`bias1-${i}`}
            x={node.x}
            y={node.y - 35}
            fill="yellow"
            fontSize="10"
            textAnchor="middle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            b: {biases1[i] !== undefined ? biases1[i].toFixed(2) : '0.00'}
          </motion.text>
        ))}
        
        {outputNodes.map((node, i) => (
          <motion.text
            key={`bias2-${i}`}
            x={node.x}
            y={node.y - 35}
            fill="yellow"
            fontSize="10"
            textAnchor="middle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            b: {biases2[i] !== undefined ? biases2[i].toFixed(2) : '0.00'}
          </motion.text>
        ))}

        {/* Layer labels */}
        <text x={padding} y={30} fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">
          Input Layer
        </text>
        <text x={width / 2} y={30} fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">
          Hidden Layer
        </text>
        <text x={width - padding} y={30} fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">
          Output Layer
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-white">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Positive values/weights</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Negative values/weights</span>
        </div>
        {showGradients && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Positive gradients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Negative gradients</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Biases</span>
        </div>
      </div>
    </div>
  );
}; 