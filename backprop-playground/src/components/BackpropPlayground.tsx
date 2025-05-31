'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Brain } from 'lucide-react';
import { NeuralNetwork, TrainingStep, TaskType } from '@/lib/neural-network';
import { NeuralNetworkVisualization } from './NeuralNetworkVisualization';
import { TrainingStepBreakdown } from './TrainingStepBreakdown';
import { LossChart } from './LossChart';
import { LossVsWeightChart } from './LossVsWeightChart';
import { DataScatterPlot } from './DataScatterPlot';

interface TrainingData {
  inputs: number[];
  targets: number[];
  label?: number;
}

const generateXORData = (): TrainingData[] => [
  { inputs: [0, 0], targets: [0], label: 0 },
  { inputs: [0, 1], targets: [1], label: 1 },
  { inputs: [1, 0], targets: [1], label: 1 },
  { inputs: [1, 1], targets: [0], label: 0 },
];

const generateCircleData = (): TrainingData[] => {
  const data: TrainingData[] = [];
  const numSamples = 50;
  for (let i = 0; i < numSamples; i++) {
    const r = Math.random() * 2.5;
    const angle = Math.random() * 2 * Math.PI;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const isInCircle = (x * x + y * y) < 2.0;
    data.push({
      inputs: [x, y],
      targets: [isInCircle ? 1 : 0],
      label: isInCircle ? 1 : 0,
    });
  }
  return data;
};

const generateLinearSeparableData = (): TrainingData[] => {
  const data: TrainingData[] = [];
  const numSamples = 50;
  for (let i = 0; i < numSamples; i++) {
    const x = Math.random() * 4 - 2;
    const y = Math.random() * 4 - 2;
    const isAboveLine = y > (0.5 * x + 0.2);
    data.push({
      inputs: [x, y],
      targets: [isAboveLine ? 1 : 0],
      label: isAboveLine ? 1 : 0,
    });
  }
  return data;
};

const generateMoonsData = (): TrainingData[] => {
  const data: TrainingData[] = [];
  const n_samples = 50;
  for (let i = 0; i < n_samples; i++) {
    const d = i / n_samples;
    data.push({
      inputs: [Math.cos(Math.PI * d) - 0.5, Math.sin(Math.PI * d) - 0.2],
      targets: [0],
      label: 0,
    });
    data.push({
      inputs: [0.5 - Math.cos(Math.PI * d), 0.2 - Math.sin(Math.PI * d) - 0.5],
      targets: [1],
      label: 1,
    });
  }
  return data;
};

const generateSpiralData = (): TrainingData[] => {
  const data: TrainingData[] = [];
  const n_samples_per_class = 25;
  for (let i = 0; i < n_samples_per_class; i++) {
    const r1 = i / n_samples_per_class * 5;
    const t1 = i / n_samples_per_class * Math.PI * 2.5 + Math.random() * 0.5;
    data.push({ inputs: [r1 * Math.sin(t1), r1 * Math.cos(t1)], targets: [0], label: 0 });

    const r2 = i / n_samples_per_class * 5;
    const t2 = i / n_samples_per_class * Math.PI * 2.5 + Math.PI + Math.random() * 0.5;
    data.push({ inputs: [r2 * Math.sin(t2), r2 * Math.cos(t2)], targets: [1], label: 1 });
  }
  return data;
};

const generateLinearRegressionData = (): TrainingData[] => {
  const data: TrainingData[] = [];
  const numSamples = 50;
  const slope = 1.8;
  const intercept = 0.5;
  for (let i = 0; i < numSamples; i++) {
    const x = Math.random() * 2 - 1;
    const noise = (Math.random() - 0.5) * 0.5;
    const y = slope * x + intercept + noise;
    data.push({ inputs: [x], targets: [y] });
  }
  return data;
};

export type DatasetName = 'xor' | 'circle' | 'linear_separable' | 'moons' | 'spiral' | 'linear_regression';

export const BackpropPlayground: React.FC = () => {
  const [network, setNetwork] = useState<NeuralNetwork | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [currentStep, setCurrentStep] = useState<TrainingStep | null>(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [lossData, setLossData] = useState<{ step: number; loss: number }[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData[]>(generateXORData());
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [showGradients, setShowGradients] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [learningRate, setLearningRate] = useState(0.05);
  const [hiddenSize, setHiddenSize] = useState(6);
  const [datasetName, setDatasetName] = useState<DatasetName>('xor');
  const [currentTaskType, setCurrentTaskType] = useState<TaskType>('classification');
  const [lossWeightTrajectoryData, setLossWeightTrajectoryData] = useState<{
    step: number;
    loss: number;
    weightValue: number;
    weightGradient: number;
  }[]>([]);

  const initializeNetwork = useCallback(() => {
    let inputSize = 2;
    let outputSize = 1;
    if (datasetName === 'linear_regression') {
      inputSize = 1;
      outputSize = 1;
    }
    const newNetwork = new NeuralNetwork(inputSize, hiddenSize, outputSize, learningRate, currentTaskType);
    setNetwork(newNetwork);
    setCurrentStep(null);
    setStepNumber(0);
    setLossData([]);
    setCurrentDataIndex(0);
    setLossWeightTrajectoryData([]);
  }, [hiddenSize, learningRate, datasetName, currentTaskType]);

  useEffect(() => {
    initializeNetwork();
  }, [initializeNetwork]);

  const changeDataset = (newDatasetName: DatasetName) => {
    setDatasetName(newDatasetName);
    let newData;
    let newTaskType: TaskType = 'classification';
    let newHiddenSize = 6;
    let newLearningRate = 0.05;

    switch (newDatasetName) {
      case 'xor':
        newData = generateXORData();
        break;
      case 'circle':
        newData = generateCircleData();
        break;
      case 'linear_separable':
        newData = generateLinearSeparableData();
        break;
      case 'moons':
        newData = generateMoonsData();
        newHiddenSize = 8;
        break;
      case 'spiral':
        newData = generateSpiralData();
        newHiddenSize = 10;
        newLearningRate = 0.1;
        break;
      case 'linear_regression':
        newData = generateLinearRegressionData();
        newTaskType = 'regression';
        newHiddenSize = 2;
        newLearningRate = 0.01;
        break;
      default:
        newData = generateXORData();
    }
    setTrainingData(newData);
    setCurrentTaskType(newTaskType);
    setHiddenSize(newHiddenSize);
    setLearningRate(newLearningRate);
    setCurrentDataIndex(0);
    setCurrentStep(null);
    setStepNumber(0);
    setLossData([]);
  };

  const performTrainingStep = useCallback(() => {
    if (!network || !trainingData.length) return;

    const data = trainingData[currentDataIndex];
    const step = network.trainStep(data.inputs, data.targets);
    
    setCurrentStep(step);
    setStepNumber(prev => prev + 1);
    setLossData(prev => {
      const newLossData = [...prev, { step: stepNumber + 1, loss: step.backward.loss }];
      if (newLossData.length > 200) return newLossData.slice(newLossData.length - 200);
      return newLossData;
    });
    
    if (currentTaskType === 'classification' &&
        step.forward.weights1 && 
        step.forward.weights1[0] && 
        step.forward.weights1[0][0] !== undefined &&
        step.backward.weights1Gradients &&
        step.backward.weights1Gradients[0] &&
        step.backward.weights1Gradients[0][0] !== undefined
      ) {
      setLossWeightTrajectoryData(prev => {
        const newTrajData = [
          ...prev,
          {
            step: stepNumber + 1,
            loss: step.backward.loss,
            weightValue: step.forward.weights1[0][0],
            weightGradient: step.backward.weights1Gradients[0][0]
          }
        ];
        if (newTrajData.length > 100) return newTrajData.slice(newTrajData.length - 100);
        return newTrajData;
      });
    } else if (currentTaskType === 'regression' &&
        step.forward.weights1 && 
        step.forward.weights1[0] && 
        step.forward.weights1[0][0] !== undefined &&
        step.backward.weights1Gradients &&
        step.backward.weights1Gradients[0] &&
        step.backward.weights1Gradients[0][0] !== undefined
    ) {
        setLossWeightTrajectoryData(prev => {
            const newTrajData = [
              ...prev,
              {
                step: stepNumber + 1,
                loss: step.backward.loss,
                weightValue: step.forward.weights1[0][0],
                weightGradient: step.backward.weights1Gradients[0][0]
              }
            ];
            if (newTrajData.length > 100) return newTrajData.slice(newTrajData.length - 100);
            return newTrajData;
          });
    }

    setCurrentDataIndex(prev => (prev + 1) % trainingData.length);
  }, [network, trainingData, currentDataIndex, stepNumber, currentTaskType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTraining) {
      interval = setInterval(performTrainingStep, speed);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTraining, performTrainingStep, speed]);

  const getCurrentNetworkState = () => {
    const inputSize = datasetName === 'linear_regression' ? 1 : 2;
    if (!network || !trainingData.length) {
      const defaultWeights1 = Array(inputSize).fill(0).map(() => Array(hiddenSize).fill(0));
      const defaultBiases1 = Array(hiddenSize).fill(0);
      const defaultWeights2 = Array(hiddenSize).fill(0).map(() => Array(1).fill(0));
      const defaultBiases2 = Array(1).fill(0);
      
      return {
        inputs: Array(inputSize).fill(0),
        hiddenValues: Array(hiddenSize).fill(0),
        outputs: [0],
        weights: { weights1: defaultWeights1, weights2: defaultWeights2, biases1: defaultBiases1, biases2: defaultBiases2 },
        taskType: currentTaskType
      };
    }

    const currentInputData = trainingData[currentDataIndex]?.inputs || Array(inputSize).fill(0);
    const prediction = network.predict(currentInputData);
    const weights = network.getWeights();

    const hiddenPre = Array(hiddenSize).fill(0).map((_, hIdx) => {
      let sum = 0;
      for (let iIdx = 0; iIdx < inputSize; iIdx++) {
        if (weights.weights1 && weights.weights1[iIdx] && weights.weights1[iIdx][hIdx] !== undefined && currentInputData[iIdx] !== undefined) {
          sum += currentInputData[iIdx] * weights.weights1[iIdx][hIdx];
        }
      }
      if (weights.biases1 && weights.biases1[hIdx] !== undefined) sum += weights.biases1[hIdx];
      return sum;
    });
    const hiddenValues = hiddenPre.map(pre => 1 / (1 + Math.exp(-pre)));

    return {
      inputs: currentInputData,
      hiddenValues,
      outputs: prediction,
      weights,
      taskType: network.getTaskType()
    };
  };

  const networkState = getCurrentNetworkState();

  return (
    <div className="h-screen max-h-screen flex flex-col bg-gray-950 text-gray-200 p-3 sm:p-4 gap-3 overflow-hidden">
      <div className="text-center flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2 sm:gap-3">
          <Brain className="text-blue-400" size={30} />
          Backpropagation Playground
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Interactive neural network learning visualization
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-2.5 sm:p-3 shadow-md flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 items-center">
          <div className="flex items-center gap-1.5 sm:gap-2 col-span-2 sm:col-span-1 md:col-span-1">
            <button
              onClick={() => setIsTraining(!isTraining)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md font-medium transition-colors text-xs sm:text-sm ${isTraining ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {isTraining ? <Pause size={14} /> : <Play size={14} />}
              {isTraining ? 'Pause' : 'Start'}
            </button>
            <button onClick={performTrainingStep} disabled={isTraining} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-md font-medium transition-colors text-xs sm:text-sm">Step</button>
            <button onClick={initializeNetwork} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition-colors text-xs sm:text-sm"><RotateCcw size={14} />Reset</button>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 text-2xs sm:text-xs mb-0.5">Dataset:</label>
            <select
              value={datasetName}
              onChange={(e) => changeDataset(e.target.value as DatasetName)}
              className="bg-gray-800 text-gray-200 text-xs sm:text-sm rounded-md px-2 py-1 border border-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full"
            >
              <option value="xor">XOR</option>
              <option value="circle">Circle</option>
              <option value="linear_separable">Linear Separable</option>
              <option value="moons">Moons</option>
              <option value="spiral">Spiral</option>
              <option value="linear_regression">Linear Regression</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 text-2xs sm:text-xs mb-0.5">Learn Rate: {learningRate.toFixed(3)}</label>
            <input type="range" min="0.001" max="0.5" step="0.001" value={learningRate} onChange={(e) => { const lr = parseFloat(e.target.value); setLearningRate(lr); network?.setLearningRate(lr); }} className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider-thumb-blue" />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-300 text-2xs sm:text-xs mb-0.5">Hidden Size: {hiddenSize}</label>
            <input type="range" min="1" max="12" step="1" value={hiddenSize} onChange={(e) => setHiddenSize(parseInt(e.target.value))} disabled={isTraining} className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider-thumb-blue" />
          </div>
           <div className="flex flex-col">
                 <label className="text-gray-300 text-2xs sm:text-xs mb-0.5">Speed (ms): {speed}</label>
                 <input type="range" min="50" max="2000" step="50" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider-thumb-blue" />
            </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
        <div className="md:col-span-1 flex flex-col gap-3 overflow-hidden min-w-[300px]">
          <div className="bg-gray-900 rounded-lg shadow-md flex-shrink-0 p-2">
            <NeuralNetworkVisualization
              inputs={networkState.inputs}
              hiddenValues={networkState.hiddenValues}
              outputs={networkState.outputs}
              weights1={networkState.weights.weights1}
              weights2={networkState.weights.weights2}
              biases1={networkState.weights.biases1}
              biases2={networkState.weights.biases2}
              gradients={showGradients && currentStep ? {
                weights1: currentStep.backward.weights1Gradients,
                weights2: currentStep.backward.weights2Gradients,
                hidden: currentStep.backward.hiddenGradients,
                output: currentStep.backward.outputGradients,
              } : undefined}
              showGradients={showGradients}
              taskType={networkState.taskType}
            />
          </div>
          <div className="bg-gray-900 rounded-lg shadow-md flex-grow p-2 overflow-hidden min-h-[150px] sm:min-h-[200px]">
            <DataScatterPlot 
                data={trainingData} 
                network={network} 
                taskType={currentTaskType} 
            />
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-3 overflow-hidden min-w-[250px]">
          <div className="bg-gray-900 rounded-lg shadow-md flex-shrink-0 p-2 min-h-[150px] sm:min-h-[200px]">
            <LossChart data={lossData} />
          </div>
          <div className="bg-gray-900 rounded-lg shadow-md flex-grow p-2 overflow-hidden min-h-[150px] sm:min-h-[200px]">
            <LossVsWeightChart 
              data={lossWeightTrajectoryData} 
              weightName={currentTaskType === 'regression' ? "W[0][0] (slope)" : "W[0][0]"} 
              network={network || undefined}
              currentInput={trainingData[currentDataIndex]?.inputs}
              currentTarget={trainingData[currentDataIndex]?.targets}
              taskType={currentTaskType}
            />
          </div>
        </div>

        <div className="md:col-span-1 bg-gray-850 rounded-lg shadow-md overflow-hidden flex flex-col min-w-[320px]">
          <TrainingStepBreakdown 
            step={currentStep} 
            stepNumber={stepNumber} 
            taskType={currentTaskType} 
            learningRate={learningRate}
          />
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-1.5 sm:p-2 mt-2 text-2xs sm:text-xs text-gray-300 flex flex-wrap justify-around items-center shadow-inner flex-shrink-0">
            <span>Step: <span className="text-white font-medium">{stepNumber}</span></span>
            <span className="hidden sm:inline">Input: <span className="text-white font-medium">[{networkState.inputs?.map(i=>i.toFixed(1)).join(', ') || 'N/A'}]</span></span>
            <span className="hidden sm:inline">Target: <span className="text-white font-medium">[{trainingData[currentDataIndex]?.targets.map(t=>t.toFixed(1)).join(', ') || 'N/A'}]</span></span>
            <span>Prediction: <span className="text-white font-medium">[{networkState.outputs?.map(o => o.toFixed(2)).join(', ') || 'N/A'}]</span></span>
            {currentStep && <span className="text-yellow-400">Loss: <span className="text-white font-medium">{currentStep.backward.loss.toFixed(4)}</span></span>}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0 ml-auto">
              <label className="text-gray-300 text-2xs sm:text-xs">Gradients:</label>
              <input type="checkbox" checked={showGradients} onChange={(e) => setShowGradients(e.target.checked)} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"/>
            </div>
        </div>
    </div>
  );
}; 