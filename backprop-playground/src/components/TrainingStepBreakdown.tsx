'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TrainingStep, TaskType } from '@/lib/neural-network';

interface TrainingStepBreakdownProps {
  step: TrainingStep | null;
  stepNumber: number;
  taskType: TaskType;
  learningRate: number;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  isOpen,
  onToggle,
}) => (
  <div className="border border-gray-700 rounded-lg mb-2 bg-gray-850 shadow-sm">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2.5 bg-gray-800 hover:bg-gray-750 transition-colors rounded-t-lg"
    >
      <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
      {isOpen ? <ChevronDown size={18} className="text-gray-400"/> : <ChevronRight size={18} className="text-gray-400"/>}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="p-2.5 bg-gray-850/50 border-t border-gray-700">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const MatrixDisplay: React.FC<{ 
  data: number[][] | number[]; 
  label: string; 
  highlight?: boolean;
}> = ({ data, label, highlight = false }) => {
  const isMatrix = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);

  const displayData = isMatrix ? (data as number[][]) : [[...(data as number[])]];

  return (
    <div className={`p-2 rounded-md ${highlight ? 'bg-blue-900/20 border border-blue-600' : 'bg-gray-700/30'} my-1`}>
      <div className="text-2xs font-medium text-gray-300 mb-1">{label}</div>
      <div className="font-mono text-2xs text-gray-100 inline-block border border-gray-600 p-1 rounded-sm bg-gray-800/30">
        {displayData.map((row, i) => (
          <div key={i} className="flex">
            {row.map((val, j) => (
              <span 
                key={j} 
                className={`block text-center min-w-[30px] px-0.5 py-0.5 ${val > 0 ? 'text-green-400' : (val < 0 ? 'text-red-400' : 'text-gray-400')}`}
              >
                {val.toFixed(2)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrainingStepBreakdown: React.FC<TrainingStepBreakdownProps> = ({
  step,
  stepNumber,
  taskType,
  learningRate,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    forward: true,
    backward: true,
    update: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!step) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-white h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No training step. Start training.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg text-gray-200 h-full flex flex-col text-xs">
      <h2 className="text-sm font-semibold mb-2 sticky top-0 bg-gray-800 p-2.5 z-10 border-b border-gray-700 shadow-sm">
        Step {stepNumber} Breakdown
        <span className="ml-2 font-normal text-yellow-400">Loss: {step.backward.loss.toFixed(4)}</span>
      </h2>
      <div className="flex-grow overflow-y-auto p-2.5 no-scrollbar space-y-2">
        <CollapsibleSection
          title="1. Forward Pass"
          isOpen={openSections.forward}
          onToggle={() => toggleSection('forward')}
        >
          <div className="space-y-2">
            <div className="text-2xs text-gray-400 mb-1">Propagates inputs through the network.</div>
            <MatrixDisplay data={step.forward.inputs} label={`Input (${step.forward.inputs.length}x1)`} />
            <MatrixDisplay data={step.forward.weights1} label={`W₁ (${step.forward.weights1.length}x${step.forward.weights1[0]?.length || 0})`} />
            <MatrixDisplay data={step.forward.biases1} label={`b₁ (${step.forward.biases1.length}x1)`} />
            
            <div className="bg-gray-700/40 p-2 rounded">
              <div className="text-2xs font-medium text-gray-300">Hidden Pre-Act (z₁): <span className="font-mono text-gray-400"> (inputs × W₁) + b₁</span></div>
              <MatrixDisplay data={step.forward.hiddenPre} label={`z₁ (${step.forward.hiddenPre.length}x1)`} highlight />
            </div>
            <div className="bg-gray-700/40 p-2 rounded">
              <div className="text-2xs font-medium text-gray-300">Hidden Post-Act (a₁): <span className="font-mono text-gray-400"> sigmoid(z₁)</span></div>
              <MatrixDisplay data={step.forward.hiddenPost} label={`a₁ (${step.forward.hiddenPost.length}x1)`} highlight />
            </div>
            
            <MatrixDisplay data={step.forward.weights2} label={`W₂ (${step.forward.weights2.length}x${step.forward.weights2[0]?.length || 0})`} />
            <MatrixDisplay data={step.forward.biases2} label={`b₂ (${step.forward.biases2.length}x1)`} />
            <div className="bg-gray-700/40 p-2 rounded">
              <div className="text-2xs font-medium text-gray-300">Output Pre-Act (z₂): <span className="font-mono text-gray-400"> (a₁ × W₂) + b₂</span></div>
              <MatrixDisplay data={step.forward.outputPre} label={`z₂ (${step.forward.outputPre.length}x1)`} highlight />
            </div>
            <div className="bg-gray-700/40 p-2 rounded">
              <div className="text-2xs font-medium text-gray-300">Final Output (ŷ): <span className="font-mono text-gray-400"> {taskType === 'classification' ? 'sigmoid(z₂)' : 'z₂ (linear)'}</span></div>
              <MatrixDisplay data={step.forward.outputPost} label={`ŷ (${step.forward.outputPost.length}x1)`} highlight />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="2. Backward Pass (Backpropagation)"
          isOpen={openSections.backward}
          onToggle={() => toggleSection('backward')}
        >
          <div className="space-y-2">
            <div className="text-2xs text-gray-400 mb-1">Computes gradients (how to adjust weights/biases).</div>
            <div className="bg-red-700/20 border border-red-600 p-2 rounded">
              <div className="text-2xs font-medium text-gray-300">Loss ({taskType === 'classification' ? 'BCE' : 'MSE'}): 
                <span className="font-mono text-gray-400"> {taskType === 'classification' ? '- (t·log(ŷ) + (1-t)·log(1-ŷ))' : '0.5 Σ(t - ŷ)²'}</span>
              </div>
              <div className="text-sm font-bold text-red-300">Value: {step.backward.loss.toFixed(5)}</div>
            </div>

            <div className="bg-gray-700/40 p-2 rounded">
              <div className="text-2xs font-medium text-gray-300">Output Layer δ₂ (dL/dz₂): 
                  <span className="font-mono text-gray-400"> {taskType === 'classification' ? 'ŷ - t' : 'ŷ - t'}</span></div>
              <MatrixDisplay data={step.backward.outputGradients} label={`δ₂ (${step.backward.outputGradients.length}x1)`} highlight />
            </div>

            <MatrixDisplay data={step.forward.weights2} label={`W₂ (${step.forward.weights2.length}x${step.forward.weights2[0]?.length || 0})`} />
            <div className="bg-gray-700/40 p-2 rounded">
              <div className="text-2xs font-medium text-gray-300">Hidden Layer δ₁ (dL/dz₁): 
                  <span className="font-mono text-gray-400"> (δ₂ × W₂ᵀ) ⊙ sigmoid&apos;(z₁)</span></div>
              <MatrixDisplay data={step.backward.hiddenGradients} label={`δ₁ (${step.backward.hiddenGradients.length}x1)`} highlight />
            </div>
            
            <div className="text-2xs font-medium text-gray-300 mt-1">Weight & Bias Gradients (dL/dW, dL/db):</div>
            <MatrixDisplay data={step.backward.weights2Gradients} label={`dL/dW₂`} highlight />
            <MatrixDisplay data={step.backward.biases2Gradients} label={`dL/db₂`} highlight />
            <MatrixDisplay data={step.backward.weights1Gradients} label={`dL/dW₁`} highlight />
            <MatrixDisplay data={step.backward.biases1Gradients} label={`dL/db₁`} highlight />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="3. Weight & Bias Updates"
          isOpen={openSections.update}
          onToggle={() => toggleSection('update')}
        >
          <div className="space-y-2">
            <div className="text-2xs text-gray-400 mb-1">Update: W_new = W_old - α × dL/dW (α = {learningRate.toFixed(4)})</div>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div><MatrixDisplay data={step.forward.weights1} label={`W₁ Old`} /></div>
              <div><MatrixDisplay data={step.after.weights1} label={`W₁ New`} highlight /></div>
              <div><MatrixDisplay data={step.forward.biases1} label={`b₁ Old`} /></div>
              <div><MatrixDisplay data={step.after.biases1} label={`b₁ New`} highlight /></div>
              <div><MatrixDisplay data={step.forward.weights2} label={`W₂ Old`} /></div>
              <div><MatrixDisplay data={step.after.weights2} label={`W₂ New`} highlight /></div>
              <div><MatrixDisplay data={step.forward.biases2} label={`b₂ Old`} /></div>
              <div><MatrixDisplay data={step.after.biases2} label={`b₂ New`} highlight /></div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}; 