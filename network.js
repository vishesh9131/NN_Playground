class NeuralNetwork {
    constructor() {
        this.model = null;
        this.hiddenLayers = [8]; // Default: one hidden layer with 8 neurons
        this.learningRate = 0.03;
        this.activation = 'relu';
        this.optimizer = null;
        this.isTraining = false;
        this.iterationCount = 0;
        this.lossHistory = [];
        
        this.initializeModel();
    }
    
    initializeModel() {
        if (this.model) {
            this.model.dispose(); // Clean up previous model to avoid memory leaks
        }
        
        // Create a sequential model
        this.model = tf.sequential();
        
        // Add the input layer and first hidden layer
        this.model.add(tf.layers.dense({
            units: this.hiddenLayers[0],
            inputShape: [2], // 2D input (x, y)
            activation: this.activation,
            kernelInitializer: 'varianceScaling'
        }));
        
        // Add additional hidden layers
        for (let i = 1; i < this.hiddenLayers.length; i++) {
            this.model.add(tf.layers.dense({
                units: this.hiddenLayers[i],
                activation: this.activation,
                kernelInitializer: 'varianceScaling'
            }));
        }
        
        // Add the output layer (binary classification)
        this.model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid',
            kernelInitializer: 'varianceScaling'
        }));
        
        // Create optimizer
        this.optimizer = tf.train.adam(this.learningRate);
        
        // Compile the model
        this.model.compile({
            optimizer: this.optimizer,
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
        
        this.iterationCount = 0;
        this.lossHistory = [];
    }
    
    // Update network configuration
    updateConfiguration(hiddenLayers, learningRate, activation) {
        let configChanged = false;
        
        if (hiddenLayers && JSON.stringify(hiddenLayers) !== JSON.stringify(this.hiddenLayers)) {
            this.hiddenLayers = hiddenLayers;
            configChanged = true;
        }
        
        if (learningRate && learningRate !== this.learningRate) {
            this.learningRate = learningRate;
            configChanged = true;
        }
        
        if (activation && activation !== this.activation) {
            this.activation = activation;
            configChanged = true;
        }
        
        if (configChanged) {
            this.initializeModel();
            return true;
        }
        
        return false;
    }
    
    // Train for one iteration
    async trainStep(data) {
        if (!this.model || !data || !data.xs || !data.ys || data.xs.length === 0) {
            return null;
        }
        
        const xs = tf.tensor2d(data.xs);
        const ys = tf.tensor2d(data.ys);
        
        try {
            // Train for one step
            const history = await this.model.trainOnBatch(xs, ys);
            
            this.iterationCount++;
            const lossValue = history instanceof tf.Tensor ? history.dataSync()[0] : history;
            this.lossHistory.push(lossValue);
            
            // Clean up tensors
            xs.dispose();
            ys.dispose();
            if (history instanceof tf.Tensor) {
                history.dispose();
            }
            
            // Return the loss value
            return lossValue;
        } catch (error) {
            console.error('Training error:', error);
            xs.dispose();
            ys.dispose();
            return null;
        }
    }
    
    // Predict on new data
    predict(x) {
        if (!this.model) return 0;
        
        return tf.tidy(() => {
            const input = tf.tensor2d([x]);
            const prediction = this.model.predict(input);
            return prediction.dataSync()[0];
        });
    }
    
    // Predict on a grid to visualize decision boundary
    predictOnGrid(width, height, resolution = 10) {
        if (!this.model) return [];
        
        return tf.tidy(() => {
            // Create a grid of points
            const inputs = [];
            
            for (let y = 0; y < height; y += resolution) {
                for (let x = 0; x < width; x += resolution) {
                    // Normalize coordinates to [-1, 1]
                    const normX = (2 * x / width) - 1;
                    const normY = (2 * y / height) - 1;
                    inputs.push([normX, normY]);
                }
            }
            
            if (inputs.length === 0) return [];
            
            // Predict on all points
            const inputTensor = tf.tensor2d(inputs);
            const outputTensor = this.model.predict(inputTensor);
            const outputs = outputTensor.dataSync();
            
            const predictions = [];
            for (let i = 0; i < outputs.length; i++) {
                const x = (i % Math.ceil(width / resolution)) * resolution;
                const y = Math.floor(i / Math.ceil(width / resolution)) * resolution;
                predictions.push({
                    x: x,
                    y: y,
                    value: outputs[i]
                });
            }
            
            return predictions;
        });
    }
    
    // Reset the model
    reset() {
        this.initializeModel();
    }
    
    // Toggle training state
    setTrainingState(isTraining) {
        this.isTraining = isTraining;
    }
    
    // Get current iteration count
    getIterationCount() {
        return this.iterationCount;
    }
    
    // Get current loss
    getCurrentLoss() {
        if (this.lossHistory.length === 0) {
            return null;
        }
        return this.lossHistory[this.lossHistory.length - 1];
    }
} 