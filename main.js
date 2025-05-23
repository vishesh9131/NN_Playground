// Wait for TensorFlow.js to load before initializing the application
async function initializeApp() {
    console.log('Starting application initialization...');
    
    // Check if TensorFlow.js is loaded
    if (typeof tf === 'undefined') {
        console.error('TensorFlow.js not loaded');
        alert('TensorFlow.js failed to load. Please check your internet connection and refresh the page.');
        return;
    }
    
    console.log('TensorFlow.js loaded successfully, version:', tf.version.tfjs);
    
    try {
        // Test TensorFlow.js with a simple operation
        const testTensor = tf.tensor([1, 2, 3]);
        const testResult = testTensor.sum().dataSync()[0];
        testTensor.dispose();
        console.log('TensorFlow.js test successful:', testResult);
        
        // Initialize components with error checking
        let dataGenerator, network, visualization;
        
        try {
            dataGenerator = new DataGenerator();
            console.log('DataGenerator initialized');
        } catch (error) {
            console.error('DataGenerator initialization failed:', error);
            alert('Failed to initialize data generator. Please refresh the page.');
            return;
        }
        
        try {
            network = new NeuralNetwork();
            console.log('NeuralNetwork initialized');
        } catch (error) {
            console.error('NeuralNetwork initialization failed:', error);
            alert('Failed to initialize neural network. Please refresh the page.');
            return;
        }
        
        try {
            visualization = new Visualization();
            console.log('Visualization initialized');
        } catch (error) {
            console.error('Visualization initialization failed:', error);
            alert('Failed to initialize visualization. Please refresh the page.');
            return;
        }
        
        // Get DOM elements with null checks
        const elements = {
            datasetSelect: document.getElementById('dataset-select'),
            layersCountSpan: document.getElementById('layers-count'),
            addLayerBtn: document.getElementById('add-layer'),
            removeLayerBtn: document.getElementById('remove-layer'),
            layersConfigDiv: document.getElementById('layers-config'),
            learningRateInput: document.getElementById('learning-rate'),
            learningRateValue: document.getElementById('learning-rate-value'),
            activationSelect: document.getElementById('activation-select'),
            resetButton: document.getElementById('reset-button'),
            playPauseButton: document.getElementById('play-pause-button'),
            iterationCountSpan: document.getElementById('iteration-count'),
            lossValueSpan: document.getElementById('loss-value'),
            dataCanvas: document.getElementById('data-canvas')
        };
        
        // Check if all required elements exist
        const missingElements = Object.entries(elements)
            .filter(([name, element]) => !element)
            .map(([name]) => name);
            
        if (missingElements.length > 0) {
            console.error('Missing DOM elements:', missingElements);
            alert(`Missing required elements: ${missingElements.join(', ')}. Please refresh the page.`);
            return;
        }
        
        console.log('All DOM elements found');
        
        // Animation frame ID
        let animationFrameId = null;
        
        // Update layer configuration UI
        function updateLayerConfig() {
            try {
                elements.layersConfigDiv.innerHTML = '';
                
                for (let i = 0; i < network.hiddenLayers.length; i++) {
                    const layerDiv = document.createElement('div');
                    layerDiv.className = 'layer-config';
                    
                    const label = document.createElement('label');
                    label.textContent = `Layer ${i + 1}:`;
                    
                    const input = document.createElement('input');
                    input.type = 'range';
                    input.min = '1';
                    input.max = '20';
                    input.value = network.hiddenLayers[i];
                    input.dataset.layerIndex = i;
                    
                    const span = document.createElement('span');
                    span.textContent = network.hiddenLayers[i];
                    
                    input.addEventListener('input', (e) => {
                        try {
                            const index = parseInt(e.target.dataset.layerIndex);
                            const value = parseInt(e.target.value);
                            span.textContent = value;
                            
                            // Update the network configuration
                            const newHiddenLayers = [...network.hiddenLayers];
                            newHiddenLayers[index] = value;
                            
                            network.updateConfiguration(
                                newHiddenLayers,
                                parseFloat(elements.learningRateInput.value),
                                elements.activationSelect.value
                            );
                            
                            // Update visualization
                            setTimeout(() => visualization.update(network, dataGenerator), 100);
                        } catch (error) {
                            console.error('Layer config update error:', error);
                        }
                    });
                    
                    layerDiv.appendChild(label);
                    layerDiv.appendChild(input);
                    layerDiv.appendChild(span);
                    
                    elements.layersConfigDiv.appendChild(layerDiv);
                }
                
                // Update layer count display
                elements.layersCountSpan.textContent = network.hiddenLayers.length;
            } catch (error) {
                console.error('Layer config update failed:', error);
            }
        }
        
        // Initialize layer configuration
        updateLayerConfig();
        
        // Update learning rate display
        elements.learningRateInput.addEventListener('input', (e) => {
            try {
                const value = parseFloat(e.target.value);
                elements.learningRateValue.textContent = value.toFixed(5);
                
                network.updateConfiguration(
                    network.hiddenLayers,
                    value,
                    elements.activationSelect.value
                );
            } catch (error) {
                console.error('Learning rate update error:', error);
            }
        });
        
        // Handle adding a layer
        elements.addLayerBtn.addEventListener('click', () => {
            try {
                if (network.hiddenLayers.length < 5) { // Limit to 5 hidden layers
                    const newHiddenLayers = [...network.hiddenLayers, 8]; // Add layer with 8 neurons
                    
                    network.updateConfiguration(
                        newHiddenLayers,
                        parseFloat(elements.learningRateInput.value),
                        elements.activationSelect.value
                    );
                    
                    updateLayerConfig();
                    setTimeout(() => visualization.update(network, dataGenerator), 100);
                }
            } catch (error) {
                console.error('Add layer error:', error);
            }
        });
        
        // Handle removing a layer
        elements.removeLayerBtn.addEventListener('click', () => {
            try {
                if (network.hiddenLayers.length > 1) { // At least 1 hidden layer
                    const newHiddenLayers = network.hiddenLayers.slice(0, -1);
                    
                    network.updateConfiguration(
                        newHiddenLayers,
                        parseFloat(elements.learningRateInput.value),
                        elements.activationSelect.value
                    );
                    
                    updateLayerConfig();
                    setTimeout(() => visualization.update(network, dataGenerator), 100);
                }
            } catch (error) {
                console.error('Remove layer error:', error);
            }
        });
        
        // Handle activation change
        elements.activationSelect.addEventListener('change', (e) => {
            try {
                network.updateConfiguration(
                    network.hiddenLayers,
                    parseFloat(elements.learningRateInput.value),
                    e.target.value
                );
                
                setTimeout(() => visualization.update(network, dataGenerator), 100);
            } catch (error) {
                console.error('Activation change error:', error);
            }
        });
        
        // Handle dataset change
        elements.datasetSelect.addEventListener('change', (e) => {
            try {
                dataGenerator.generateData(e.target.value);
                setTimeout(() => visualization.update(network, dataGenerator), 100);
            } catch (error) {
                console.error('Dataset change error:', error);
            }
        });
        
        // Handle reset button
        elements.resetButton.addEventListener('click', () => {
            try {
                network.reset();
                elements.iterationCountSpan.textContent = '0';
                elements.lossValueSpan.textContent = '-';
                setTimeout(() => visualization.update(network, dataGenerator), 100);
            } catch (error) {
                console.error('Reset error:', error);
            }
        });
        
        // Handle play/pause button
        elements.playPauseButton.addEventListener('click', () => {
            try {
                if (network.isTraining) {
                    // Pause training
                    network.setTrainingState(false);
                    elements.playPauseButton.textContent = 'Start';
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                } else {
                    // Start training
                    network.setTrainingState(true);
                    elements.playPauseButton.textContent = 'Pause';
                    
                    // Start animation loop
                    animationLoop();
                }
            } catch (error) {
                console.error('Play/pause error:', error);
                network.setTrainingState(false);
                elements.playPauseButton.textContent = 'Start';
            }
        });
        
        // Handle clicking on data canvas to add points
        if (elements.dataCanvas) {
            elements.dataCanvas.addEventListener('click', (e) => {
                try {
                    const rect = elements.dataCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Left click = positive class
                    dataGenerator.addPoint(x, y, 1);
                    setTimeout(() => visualization.update(network, dataGenerator), 50);
                } catch (error) {
                    console.error('Canvas click error:', error);
                }
            });
            
            // Prevent context menu on data canvas for right clicks
            elements.dataCanvas.addEventListener('contextmenu', (e) => {
                try {
                    e.preventDefault();
                    const rect = elements.dataCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    dataGenerator.addPoint(x, y, 0); // Add negative point
                    setTimeout(() => visualization.update(network, dataGenerator), 50);
                } catch (error) {
                    console.error('Canvas right-click error:', error);
                }
            });
        }
        
        // Training and visualization loop
        async function animationLoop() {
            if (network.isTraining) {
                try {
                    // Train for one step
                    const loss = await network.trainStep(dataGenerator.getData());
                    
                    // Update UI
                    elements.iterationCountSpan.textContent = network.getIterationCount();
                    if (loss !== null && !isNaN(loss)) {
                        elements.lossValueSpan.textContent = loss.toFixed(5);
                    }
                    
                    // Update visualization every few iterations to improve performance
                    if (network.getIterationCount() % 5 === 0) {
                        visualization.update(network, dataGenerator);
                    }
                    
                    // Continue loop
                    animationFrameId = requestAnimationFrame(animationLoop);
                } catch (error) {
                    console.error('Training loop error:', error);
                    network.setTrainingState(false);
                    elements.playPauseButton.textContent = 'Start';
                }
            }
        }
        
        // Generate initial data
        try {
            dataGenerator.generateData('circle');
            console.log('Initial data generated');
        } catch (error) {
            console.error('Initial data generation failed:', error);
        }
        
        // Initial visualization with delay to ensure everything is ready
        setTimeout(() => {
            try {
                visualization.update(network, dataGenerator);
                console.log('Initial visualization complete');
            } catch (error) {
                console.error('Initial visualization failed:', error);
            }
        }, 500);
        
        console.log('Neural Network Playground initialized successfully!');
        
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize the Neural Network Playground. Please check the console for details and refresh the page.');
    }
}

// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting for TensorFlow.js...');
    
    // Function to check if TensorFlow.js is loaded
    function checkTensorFlowLoaded() {
        if (typeof tf !== 'undefined') {
            console.log('TensorFlow.js detected, initializing app...');
            initializeApp();
        } else {
            console.log('TensorFlow.js not yet loaded, retrying...');
            setTimeout(checkTensorFlowLoaded, 100);
        }
    }
    
    // Start checking after a short delay
    setTimeout(checkTensorFlowLoaded, 1000);
}); 
}); 