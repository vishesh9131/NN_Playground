class Visualization {
    constructor() {
        this.networkCanvas = document.getElementById('network-vis');
        this.outputCanvas = document.getElementById('output-canvas');
        
        if (!this.networkCanvas || !this.outputCanvas) {
            console.error('Canvas elements not found');
            return;
        }
        
        this.networkCtx = this.networkCanvas.getContext('2d');
        this.outputCtx = this.outputCanvas.getContext('2d');
        
        // Set canvas dimensions
        this.resizeCanvases();
        
        // Colors for visualization
        this.colors = {
            background: '#ffffff',
            neuron: '#3498db',
            activeNeuron: '#2ecc71',
            connection: '#95a5a6',
            strongConnection: '#2980b9',
            weakConnection: '#e74c3c',
            inputLayer: '#3498db',
            hiddenLayer: '#9b59b6',
            outputLayer: '#e74c3c',
            decisionBoundary: [
                { value: 0, color: 'rgba(231, 76, 60, 0.2)' }, // Red for class 0
                { value: 1, color: 'rgba(52, 152, 219, 0.2)' }  // Blue for class 1
            ]
        };
        
        // Add window resize listener
        window.addEventListener('resize', () => this.resizeCanvases());
    }
    
    resizeCanvases() {
        // Network visualization canvas
        const parent = this.networkCanvas.parentElement;
        if (parent) {
            const width = parent.clientWidth || 400;
            const height = parent.clientHeight || 400;
            this.networkCanvas.width = Math.max(width - 30, 300); // Account for padding
            this.networkCanvas.height = Math.max(height - 30, 300);
        } else {
            this.networkCanvas.width = 400;
            this.networkCanvas.height = 400;
        }
        
        // Output visualization (no need to resize, fixed size)
    }
    
    // Draw the neural network architecture
    drawNetwork(network) {
        if (!network || !network.model || !this.networkCtx) return;
        
        const width = this.networkCanvas.width;
        const height = this.networkCanvas.height;
        
        // Clear canvas
        this.networkCtx.fillStyle = this.colors.background;
        this.networkCtx.fillRect(0, 0, width, height);
        
        // Get layers from the model
        const layers = network.model.layers;
        
        // Input layer (always 2 neurons for x,y)
        const inputNeurons = 2;
        
        // Hidden layers (from model configuration)
        const hiddenLayers = network.hiddenLayers;
        
        // Output layer (always 1 neuron for binary classification)
        const outputNeurons = 1;
        
        // Determine the number of layers total
        const totalLayers = 2 + hiddenLayers.length; // input + hidden + output
        
        // Set up spacing
        const verticalPadding = 40;
        const horizontalSpacing = width / (totalLayers + 1);
        
        // Neuron properties
        const maxNeuronRadius = 15;
        const minNeuronRadius = 8;
        
        // Keep track of neuron positions for drawing connections
        const neuronPositions = [];
        
        // Draw input layer
        const inputLayerX = horizontalSpacing;
        const inputLayerSpacing = (height - 2 * verticalPadding) / (inputNeurons + 1);
        
        neuronPositions.push([]);
        for (let i = 0; i < inputNeurons; i++) {
            const y = verticalPadding + (i + 1) * inputLayerSpacing;
            this.drawNeuron(inputLayerX, y, minNeuronRadius, this.colors.inputLayer);
            neuronPositions[0].push({ x: inputLayerX, y });
        }
        
        // Draw hidden layers
        for (let l = 0; l < hiddenLayers.length; l++) {
            const layerNeurons = hiddenLayers[l];
            const layerX = horizontalSpacing * (l + 2);
            const layerSpacing = (height - 2 * verticalPadding) / Math.max(layerNeurons + 1, 3);
            
            neuronPositions.push([]);
            for (let i = 0; i < layerNeurons; i++) {
                const y = verticalPadding + (i + 1) * layerSpacing;
                this.drawNeuron(layerX, y, minNeuronRadius, this.colors.hiddenLayer);
                neuronPositions[l + 1].push({ x: layerX, y });
            }
        }
        
        // Draw output layer
        const outputLayerX = horizontalSpacing * totalLayers;
        const outputLayerSpacing = (height - 2 * verticalPadding) / (outputNeurons + 1);
        
        neuronPositions.push([]);
        for (let i = 0; i < outputNeurons; i++) {
            const y = verticalPadding + (i + 1) * outputLayerSpacing;
            this.drawNeuron(outputLayerX, y, minNeuronRadius, this.colors.outputLayer);
            neuronPositions[neuronPositions.length - 1].push({ x: outputLayerX, y });
        }
        
        // Draw connections between layers
        for (let l = 0; l < neuronPositions.length - 1; l++) {
            const fromLayer = neuronPositions[l];
            const toLayer = neuronPositions[l + 1];
            
            for (let i = 0; i < fromLayer.length; i++) {
                for (let j = 0; j < toLayer.length; j++) {
                    // In a real implementation, we would use the actual weights
                    // For visualization purposes, we'll use random weights
                    const weight = Math.random() * 2 - 1; // Random weight between -1 and 1
                    
                    this.drawConnection(
                        fromLayer[i].x, fromLayer[i].y,
                        toLayer[j].x, toLayer[j].y,
                        weight
                    );
                }
            }
        }
        
        // Draw layer labels
        this.networkCtx.font = '12px Arial';
        this.networkCtx.fillStyle = '#2c3e50';
        this.networkCtx.textAlign = 'center';
        
        // Input layer label
        this.networkCtx.fillText('Input', inputLayerX, height - 10);
        
        // Hidden layer labels
        for (let l = 0; l < hiddenLayers.length; l++) {
            this.networkCtx.fillText(`Hidden ${l+1}`, horizontalSpacing * (l + 2), height - 10);
        }
        
        // Output layer label
        this.networkCtx.fillText('Output', outputLayerX, height - 10);
    }
    
    // Draw a neuron
    drawNeuron(x, y, radius, color) {
        this.networkCtx.beginPath();
        this.networkCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.networkCtx.fillStyle = color;
        this.networkCtx.fill();
        
        // Draw outline
        this.networkCtx.strokeStyle = '#2c3e50';
        this.networkCtx.lineWidth = 1;
        this.networkCtx.stroke();
    }
    
    // Draw connection between neurons
    drawConnection(fromX, fromY, toX, toY, weight) {
        // Normalize weight to [0, 1] for opacity
        const normalizedWeight = (weight + 1) / 2;
        
        // Determine color based on weight
        let color;
        if (weight > 0.3) {
            // Strong positive weight
            color = this.colors.strongConnection;
        } else if (weight < -0.3) {
            // Strong negative weight
            color = this.colors.weakConnection;
        } else {
            // Weak weight
            color = this.colors.connection;
        }
        
        // Draw the connection
        this.networkCtx.beginPath();
        this.networkCtx.moveTo(fromX, fromY);
        this.networkCtx.lineTo(toX, toY);
        this.networkCtx.strokeStyle = color;
        this.networkCtx.lineWidth = Math.max(0.5, Math.abs(weight) * 2);
        this.networkCtx.globalAlpha = 0.3 + 0.4 * Math.abs(normalizedWeight);
        this.networkCtx.stroke();
        this.networkCtx.globalAlpha = 1.0;
    }
    
    // Draw the decision boundary
    drawDecisionBoundary(predictions) {
        if (!predictions || predictions.length === 0 || !this.outputCtx) return;
        
        const width = this.outputCanvas.width;
        const height = this.outputCanvas.height;
        
        // Clear canvas first
        this.outputCtx.fillStyle = '#ffffff';
        this.outputCtx.fillRect(0, 0, width, height);
        
        // Create an ImageData object to set pixels directly
        const imageData = this.outputCtx.createImageData(width, height);
        const data = imageData.data;
        
        // Initialize to white
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            data[i + 3] = 255; // A
        }
        
        // Set pixels based on predictions
        for (let i = 0; i < predictions.length; i++) {
            const pred = predictions[i];
            const x = Math.floor(pred.x);
            const y = Math.floor(pred.y);
            
            // Skip if outside canvas
            if (x < 0 || y < 0 || x >= width || y >= height) continue;
            
            // Fill a small area around each prediction point
            for (let dx = 0; dx < 10 && x + dx < width; dx++) {
                for (let dy = 0; dy < 10 && y + dy < height; dy++) {
                    const idx = ((y + dy) * width + (x + dx)) * 4;
                    
                    if (idx >= 0 && idx < data.length - 3) {
                        // Interpolate between the colors based on the prediction value
                        if (pred.value < 0.5) {
                            // More red (class 0)
                            const intensity = (0.5 - pred.value) * 2;
                            data[idx] = 255;
                            data[idx + 1] = Math.floor(255 - intensity * 100);
                            data[idx + 2] = Math.floor(255 - intensity * 100);
                            data[idx + 3] = Math.floor(100 + intensity * 50);
                        } else {
                            // More blue (class 1)
                            const intensity = (pred.value - 0.5) * 2;
                            data[idx] = Math.floor(255 - intensity * 100);
                            data[idx + 1] = Math.floor(255 - intensity * 100);
                            data[idx + 2] = 255;
                            data[idx + 3] = Math.floor(100 + intensity * 50);
                        }
                    }
                }
            }
        }
        
        // Draw the image data to the canvas
        this.outputCtx.putImageData(imageData, 0, 0);
    }
    
    // Draw data points on the output canvas
    drawDataPoints(dataPoints) {
        if (!dataPoints || dataPoints.length === 0 || !this.outputCtx) return;
        
        const width = this.outputCanvas.width;
        const height = this.outputCanvas.height;
        
        // Scale factor to fit dataPoints to canvas
        const scaleX = width / 200;  // Data canvas is 200px
        const scaleY = height / 200; // Data canvas is 200px
        
        for (const point of dataPoints) {
            this.outputCtx.beginPath();
            this.outputCtx.arc(point.x * scaleX, point.y * scaleY, 4, 0, Math.PI * 2);
            this.outputCtx.fillStyle = point.label === 1 ? '#3498db' : '#e74c3c';
            this.outputCtx.fill();
            this.outputCtx.strokeStyle = '#ffffff';
            this.outputCtx.lineWidth = 2;
            this.outputCtx.stroke();
        }
    }
    
    // Update the visualization with current network and data
    update(network, dataGenerator) {
        try {
            // Draw the network
            this.drawNetwork(network);
            
            // Draw the decision boundary
            if (network && network.model) {
                const predictions = network.predictOnGrid(
                    this.outputCanvas.width,
                    this.outputCanvas.height,
                    20
                );
                this.drawDecisionBoundary(predictions);
            }
            
            // Draw the data points on the output canvas
            if (dataGenerator) {
                this.drawDataPoints(dataGenerator.dataPoints);
            }
        } catch (error) {
            console.error('Visualization error:', error);
        }
    }
} 