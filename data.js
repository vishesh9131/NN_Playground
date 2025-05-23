class DataGenerator {
    constructor() {
        this.dataCanvas = document.getElementById('data-canvas');
        this.ctx = this.dataCanvas.getContext('2d');
        this.width = this.dataCanvas.width;
        this.height = this.dataCanvas.height;
        this.data = { xs: [], ys: [] };
        this.dataPoints = [];
        this.currentDataset = 'circle';
        this.colors = {
            positive: '#3498db',
            negative: '#e74c3c',
            background: '#f8f9fa'
        };
        
        this.generateData(this.currentDataset);
    }
    
    generateData(type) {
        this.currentDataset = type;
        this.dataPoints = [];
        
        switch(type) {
            case 'circle':
                this.generateCircleData();
                break;
            case 'xor':
                this.generateXORData();
                break;
            case 'spiral':
                this.generateSpiralData();
                break;
            case 'gaussian':
                this.generateGaussianData();
                break;
            default:
                this.generateCircleData();
        }
        
        this.data = this.prepareData();
        this.drawData();
        
        return this.data;
    }
    
    prepareData() {
        const xs = [];
        const ys = [];
        
        for (const point of this.dataPoints) {
            // Normalize coordinates to range [-1, 1]
            const x = (2 * point.x / this.width) - 1;
            const y = (2 * point.y / this.height) - 1;
            
            xs.push([x, y]);
            ys.push([point.label]);
        }
        
        return {
            xs: xs,
            ys: ys
        };
    }
    
    drawData() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        for (const point of this.dataPoints) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = point.label === 1 ? this.colors.positive : this.colors.negative;
            this.ctx.fill();
        }
    }
    
    generateCircleData(numPoints = 100) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.3;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * Math.min(this.width, this.height) / 2;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            // Points inside the circle are positive (1), outside are negative (0)
            const label = distance < radius ? 1 : 0;
            
            this.dataPoints.push({ x, y, label });
        }
    }
    
    generateXORData(numPoints = 100) {
        for (let i = 0; i < numPoints; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            
            // Calculate normalized coordinates for XOR
            const normX = x / this.width;
            const normY = y / this.height;
            
            // XOR pattern: top-left and bottom-right are one class, top-right and bottom-left are another
            const label = (normX < 0.5 && normY < 0.5) || (normX >= 0.5 && normY >= 0.5) ? 1 : 0;
            
            this.dataPoints.push({ x, y, label });
        }
    }
    
    generateSpiralData(numPoints = 100) {
        const numSpirals = 2;
        const pointsPerSpiral = numPoints / numSpirals;
        
        for (let i = 0; i < numSpirals; i++) {
            const label = i;
            
            for (let j = 0; j < pointsPerSpiral; j++) {
                const t = j / pointsPerSpiral * 4 * Math.PI; // spread spiral over 720 degrees
                const r = t / (4 * Math.PI) * Math.min(this.width, this.height) / 2;
                
                // Add spiral offset based on class
                const angle = t + i * Math.PI;
                
                const x = this.width / 2 + r * Math.cos(angle);
                const y = this.height / 2 + r * Math.sin(angle);
                
                // Add slight noise to make it more interesting
                const noise = 3;
                const nx = x + (Math.random() * 2 - 1) * noise;
                const ny = y + (Math.random() * 2 - 1) * noise;
                
                this.dataPoints.push({ x: nx, y: ny, label });
            }
        }
    }
    
    generateGaussianData(numPoints = 100) {
        const numClusters = 2;
        const pointsPerCluster = numPoints / numClusters;
        
        // Center for the first cluster (label 1)
        const center1X = this.width * 0.3;
        const center1Y = this.height * 0.3;
        
        // Center for the second cluster (label 0)
        const center2X = this.width * 0.7;
        const center2Y = this.height * 0.7;
        
        // Standard deviation (spread)
        const stdDev = Math.min(this.width, this.height) / 10;
        
        // Generate first cluster
        for (let i = 0; i < pointsPerCluster; i++) {
            // Box-Muller transform to generate Gaussian random variables
            const u1 = Math.random();
            const u2 = Math.random();
            
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
            
            const x = center1X + z1 * stdDev;
            const y = center1Y + z2 * stdDev;
            
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.dataPoints.push({ x, y, label: 1 });
            }
        }
        
        // Generate second cluster
        for (let i = 0; i < pointsPerCluster; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
            
            const x = center2X + z1 * stdDev;
            const y = center2Y + z2 * stdDev;
            
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.dataPoints.push({ x, y, label: 0 });
            }
        }
    }
    
    // For external access to the current data
    getData() {
        return this.data;
    }
    
    // Add custom data point
    addPoint(x, y, label) {
        this.dataPoints.push({ x, y, label });
        this.data = this.prepareData();
        this.drawData();
        return this.data;
    }
} 