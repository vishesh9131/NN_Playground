# Neural Network Playground

An interactive visualization tool for exploring neural networks, similar to TensorFlow's Neural Network Playground. This project allows you to experiment with different neural network architectures, activation functions, and datasets to understand how neural networks learn.

## Features

- Visualize the neural network architecture
- Adjust the number of hidden layers and neurons in each layer
- Change activation functions and learning rate
- Choose from several predefined datasets (Circle, XOR, Spiral, Gaussian)
- Create custom datasets by clicking on the canvas
- Watch the network train in real-time
- Visualize the decision boundary as the network learns

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser

No build process or installation required! The application runs entirely in the browser using TensorFlow.js.

## How to Use

### Datasets

- **Circle**: Points inside a circle are positive (blue), outside are negative (red)
- **XOR**: XOR pattern where opposite quadrants have the same class
- **Spiral**: Two intertwined spiral patterns
- **Gaussian**: Two Gaussian distributions

You can also create custom datasets by:
- Left-click on the data canvas to add positive (blue) points
- Right-click on the data canvas to add negative (red) points

### Neural Network Configuration

- Add or remove hidden layers (up to 5)
- Adjust the number of neurons in each layer (1-20)
- Select activation functions (ReLU, Tanh, Sigmoid, Linear)
- Adjust the learning rate (0.00001-0.5)

### Training

- Click "Start" to begin training
- Click "Pause" to pause training
- Click "Reset" to reset the network weights

Watch the iteration count and loss value to track the training progress.

## Implementation Details

- Built with plain JavaScript and TensorFlow.js
- Uses HTML5 Canvas for visualizations
- Implements a basic neural network with customizable parameters
- Provides real-time visualization of the decision boundary

## License

This project is open source and available under the [MIT License](LICENSE). 