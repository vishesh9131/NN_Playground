# Backpropagation Playground

An interactive visualization tool built with Next.js that demonstrates how neural networks learn through backpropagation. This educational playground shows real-time weight updates, gradient computation, and step-by-step breakdown of the training process.

## Features

### 🧠 Neural Network Visualization
- **Interactive Network Diagram**: Visual representation of a neural network with input, hidden, and output layers
- **Real-time Updates**: Watch weights, biases, and activations change during training
- **Color-coded Values**: Positive values (green) and negative values (red) for easy interpretation
- **Gradient Visualization**: Toggle to see gradient flow during backpropagation

### 📊 Training Insights
- **Step-by-step Breakdown**: Detailed mathematical explanation of each training step
- **Forward Pass Visualization**: See how inputs propagate through the network
- **Backward Pass Details**: Understand how gradients are computed and propagated
- **Weight Update Process**: Watch how weights and biases are adjusted

### 📈 Real-time Monitoring
- **Loss Chart**: Track training progress over time
- **Live Metrics**: See current loss, predictions, and targets
- **Training Statistics**: Monitor improvement percentage and training steps

### 🎮 Interactive Controls
- **Play/Pause Training**: Control the training process
- **Single Step Mode**: Execute one training step at a time for detailed analysis
- **Speed Control**: Adjust training speed from 100ms to 2000ms per step
- **Learning Rate**: Dynamically adjust the learning rate (0.01 to 1.0)
- **Network Architecture**: Modify hidden layer size (2-8 neurons)

### 📚 Multiple Datasets
- **XOR Problem**: Classic non-linearly separable problem
- **Circle Classification**: Points inside/outside a circle
- **Linear Separation**: Simple linear classification problem

## How It Works

### Neural Network Architecture
- **Input Layer**: 2 neurons (for 2D problems)
- **Hidden Layer**: Configurable size (2-8 neurons) with sigmoid activation
- **Output Layer**: 1 neuron with sigmoid activation

### Training Process
1. **Forward Pass**: Input propagates through the network
   - Linear transformation: `z = Wx + b`
   - Activation function: `a = sigmoid(z)`

2. **Loss Calculation**: Mean squared error between prediction and target
   - `Loss = 0.5 * (target - output)²`

3. **Backward Pass**: Gradients computed via chain rule
   - Output gradients: `∂L/∂o = (target - output) * sigmoid'(z)`
   - Hidden gradients: `∂L/∂h = (∂L/∂o * W) * sigmoid'(z)`

4. **Weight Updates**: Gradient descent optimization
   - `W_new = W_old + learning_rate * gradient`

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backprop-playground
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Basic Training
1. **Select a Dataset**: Choose from XOR, Circle, or Linear problems
2. **Configure Parameters**: Adjust learning rate, hidden layer size, and training speed
3. **Start Training**: Click "Start Training" to begin automatic training
4. **Monitor Progress**: Watch the loss chart and network visualization

### Detailed Analysis
1. **Single Step Mode**: Use "Single Step" button for step-by-step analysis
2. **Toggle Gradients**: Enable "Show Gradients" to see gradient magnitudes
3. **Expand Sections**: Click on Forward Pass, Backward Pass, and Weight Updates sections for detailed breakdowns
4. **Mathematical Details**: Review the equations and intermediate calculations

### Experimentation
- **Learning Rate Effects**: Try different learning rates to see convergence behavior
- **Architecture Impact**: Modify hidden layer size and observe learning capacity
- **Dataset Complexity**: Compare how the network learns different problems

## Technical Implementation

### Core Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Recharts**: Interactive charts
- **Lucide React**: Modern icons

### Key Components
- `NeuralNetwork`: Core ML implementation with detailed step tracking
- `NeuralNetworkVisualization`: Interactive SVG-based network diagram
- `TrainingStepBreakdown`: Mathematical step-by-step explanation
- `LossChart`: Real-time training progress visualization
- `BackpropPlayground`: Main orchestrating component

## Educational Value

This playground is designed to help understand:

1. **Neural Network Fundamentals**
   - Forward propagation
   - Activation functions
   - Network architecture

2. **Backpropagation Algorithm**
   - Gradient computation
   - Chain rule application
   - Error propagation

3. **Training Dynamics**
   - Loss minimization
   - Learning rate effects
   - Convergence behavior

4. **Hyperparameter Impact**
   - Network capacity
   - Learning speed
   - Training stability

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by classic neural network educational tools
- Built with modern web technologies for interactive learning
- Designed for both beginners and advanced practitioners
