export interface TrainingStep {
  forward: {
    inputs: number[];
    hiddenPre: number[];
    hiddenPost: number[];
    outputPre: number[];
    outputPost: number[];
    weights1: number[][];
    weights2: number[][];
    biases1: number[];
    biases2: number[];
  };
  backward: {
    loss: number;
    outputGradients: number[];
    hiddenGradients: number[];
    weights2Gradients: number[][];
    weights1Gradients: number[][];
    biases2Gradients: number[];
    biases1Gradients: number[];
  };
  after: {
    weights1: number[][];
    weights2: number[][];
    biases1: number[];
    biases2: number[];
  };
}

export type TaskType = 'classification' | 'regression';

export class NeuralNetwork {
  private weights1: number[][];
  private weights2: number[][];
  private biases1: number[];
  private biases2: number[];
  private learningRate: number;
  private taskType: TaskType;
  
  constructor(
    inputSize: number = 2, 
    hiddenSize: number = 4, 
    outputSize: number = 1, 
    learningRate: number = 0.1,
    taskType: TaskType = 'classification' // Default to classification
  ) {
    this.learningRate = learningRate;
    this.taskType = taskType;
    
    this.weights1 = this.randomMatrix(inputSize, hiddenSize);
    this.weights2 = this.randomMatrix(hiddenSize, outputSize);
    this.biases1 = this.randomArray(hiddenSize);
    this.biases2 = this.randomArray(outputSize);
  }
  
  private randomMatrix(rows: number, cols: number): number[][] {
    return Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => (Math.random() - 0.5) * 0.5) // Smaller initial weights
    );
  }
  
  private randomArray(size: number): number[] {
    return Array(size).fill(0).map(() => (Math.random() - 0.5) * 0.5); // Smaller initial biases
  }
  
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
  
  private sigmoidDerivative(x: number): number {
    const s = this.sigmoid(x);
    return s * (1 - s);
  }
  
  // Computes vector^T * matrix
  // vector_b (M elements), matrix_a (M rows, N columns)
  // result (N elements): result_j = sum_i (vector_b_i * matrix_a_ij)
  private matrixMultiply(matrix_a: number[][], vector_b: number[]): number[] {
    const numRowsMatrix = matrix_a.length;
    if (numRowsMatrix === 0) return [];
    const numColsMatrix = matrix_a[0].length;

    if (vector_b.length !== numRowsMatrix) {
      console.error("Matrix multiply dimension mismatch:",
        `vector_b length (${vector_b.length}) !== numRowsMatrix (${numRowsMatrix})`);
      // Return a zero vector of expected output dimension to avoid further crashes
      return Array(numColsMatrix).fill(0);
    }

    const result = Array(numColsMatrix).fill(0);
    for (let j = 0; j < numColsMatrix; j++) { // For each column in matrix_a (output element)
      for (let i = 0; i < numRowsMatrix; i++) { // For each row in matrix_a (corresponds to element in vector_b)
        if (matrix_a[i]?.[j] === undefined || vector_b[i] === undefined) {
          // console.warn(`Undefined element in matrixMultiply: matrix_a[${i}][${j}] or vector_b[${i}]`);
          continue;
        }
        result[j] += vector_b[i] * matrix_a[i][j];
      }
    }
    return result;
  }
  
  private vectorAdd(a: number[], b: number[]): number[] {
    return a.map((val, i) => (val !== undefined && b[i] !== undefined) ? val + b[i] : 0);
  }
  
  predict(inputs: number[]): number[] {
    const hiddenPre = this.vectorAdd(this.matrixMultiply(this.weights1, inputs), this.biases1);
    const hiddenPost = hiddenPre.map(x => this.sigmoid(x));
    
    const outputPre = this.vectorAdd(this.matrixMultiply(this.weights2, hiddenPost), this.biases2);
    
    if (this.taskType === 'classification') {
      return outputPre.map(x => this.sigmoid(x));
    }
    return outputPre; // Linear activation for regression
  }
  
  trainStep(inputs: number[], target: number[]): TrainingStep {
    const initialWeights1 = this.weights1.map(row => [...row]);
    const initialWeights2 = this.weights2.map(row => [...row]);
    const initialBiases1 = [...this.biases1];
    const initialBiases2 = [...this.biases2];
    
    // Forward pass
    const hiddenPre = this.vectorAdd(this.matrixMultiply(this.weights1, inputs), this.biases1);
    const hiddenPost = hiddenPre.map(x => this.sigmoid(x));
    
    const outputPre = this.vectorAdd(this.matrixMultiply(this.weights2, hiddenPost), this.biases2);
    let outputPost: number[];
    
    if (this.taskType === 'classification') {
      outputPost = outputPre.map(x => this.sigmoid(x));
    } else { // Regression
      outputPost = [...outputPre]; // Linear activation
    }
    
    // Calculate loss
    let loss: number;
    let outputGradients: number[]; // dL/d(output_pre)
    const epsilon = 1e-12; 

    if (this.taskType === 'classification') {
      loss = outputPost.reduce((sum, output, i) => {
        const t = target[i];
        const y = Math.max(epsilon, Math.min(1 - epsilon, output));
        return sum - (t * Math.log(y) + (1 - t) * Math.log(1 - y));
      }, 0) / outputPost.length;
      // dL/d(output_pre) = outputPost - target (for sigmoid + BCE)
      outputGradients = outputPost.map((output, i) => output - target[i]);
    } else { // Regression
      loss = outputPost.reduce((sum, output, i) => 
        sum + 0.5 * Math.pow(target[i] - output, 2), 0
      ) / outputPost.length;
      // dL/d(output_pre) = outputPost - target (for linear output + MSE, as d(output_pre)/d(output_pre) = 1)
      outputGradients = outputPost.map((output, i) => output - target[i]);
    }
    
    // Hidden layer gradients
    const hiddenErrorValues = Array(this.biases1.length).fill(0).map((_, hIdx) => {
      let errorSum = 0;
      for (let oIdx = 0; oIdx < this.biases2.length; oIdx++) {
        if (this.weights2 && this.weights2[hIdx] && this.weights2[hIdx][oIdx] !== undefined && outputGradients[oIdx] !== undefined) {
          errorSum += outputGradients[oIdx] * this.weights2[hIdx][oIdx];
        }
      }
      return errorSum;
    });

    const hiddenGradients = hiddenErrorValues.map((error, i) => {
      if (hiddenPre[i] === undefined) return 0; 
      return error * this.sigmoidDerivative(hiddenPre[i]);
    });
    
    // Calculate weight and bias gradients (dL/dw)
    const weights2Gradients = hiddenPost.map(hidden_val =>
      outputGradients.map(grad => hidden_val * grad)
    );
    
    const weights1Gradients = inputs.map(input_val =>
      hiddenGradients.map(grad => input_val * grad)
    );
    
    const biases2Gradients = [...outputGradients];
    const biases1Gradients = [...hiddenGradients];
    
    // Update weights and biases: w_new = w_old - learning_rate * dL/dw
    for (let i = 0; i < this.weights2.length; i++) {
      for (let j = 0; j < this.weights2[i].length; j++) {
        if (this.weights2[i]?.[j] !== undefined && weights2Gradients[i]?.[j] !== undefined) {
            this.weights2[i][j] -= this.learningRate * weights2Gradients[i][j];
        }
      }
    }
    
    for (let i = 0; i < this.weights1.length; i++) {
      for (let j = 0; j < this.weights1[i].length; j++) {
        if (this.weights1[i]?.[j] !== undefined && weights1Gradients[i]?.[j] !== undefined) {
            this.weights1[i][j] -= this.learningRate * weights1Gradients[i][j];
        }
      }
    }
    
    for (let i = 0; i < this.biases2.length; i++) {
      if (this.biases2[i] !== undefined && biases2Gradients[i] !== undefined) {
        this.biases2[i] -= this.learningRate * biases2Gradients[i];
      }
    }
    
    for (let i = 0; i < this.biases1.length; i++) {
      if (this.biases1[i] !== undefined && biases1Gradients[i] !== undefined) {
        this.biases1[i] -= this.learningRate * biases1Gradients[i];
      }
    }
    
    return {
      forward: {
        inputs,
        hiddenPre,
        hiddenPost,
        outputPre,
        outputPost,
        weights1: initialWeights1,
        weights2: initialWeights2,
        biases1: initialBiases1,
        biases2: initialBiases2,
      },
      backward: {
        loss,
        outputGradients,
        hiddenGradients,
        weights2Gradients,
        weights1Gradients,
        biases2Gradients,
        biases1Gradients,
      },
      after: {
        weights1: this.weights1.map(row => [...row]),
        weights2: this.weights2.map(row => [...row]),
        biases1: [...this.biases1],
        biases2: [...this.biases2],
      }
    };
  }
  
  getWeights() {
    return {
      weights1: this.weights1.map(row => [...row]),
      weights2: this.weights2.map(row => [...row]),
      biases1: [...this.biases1],
      biases2: [...this.biases2],
    };
  }
  
  setWeights(weights: {
    weights1: number[][];
    weights2: number[][];
    biases1: number[];
    biases2: number[];
  }) {
    this.weights1 = weights.weights1.map(row => [...row]);
    this.weights2 = weights.weights2.map(row => [...row]);
    this.biases1 = [...weights.biases1];
    this.biases2 = [...weights.biases2];
  }
  
  setLearningRate(rate: number) {
    this.learningRate = rate;
  }

  getTaskType(): TaskType {
    return this.taskType;
  }
} 