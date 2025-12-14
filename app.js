// Simple Audio Visualizer - Easy to understand version

// Get DOM elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const sensitivitySlider = document.getElementById('sensitivity');
const barsSlider = document.getElementById('bars');
const sensitivityValue = document.getElementById('sensitivityValue');
const barsValue = document.getElementById('barsValue');
const canvas = document.getElementById('audioCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 400;

// Audio variables
let audioContext;
let analyser;
let microphone;
let dataArray;
let isActive = false;
let animationId;

// Visualizer settings
let settings = {
    sensitivity: 50,
    barCount: 60
};

// Update UI when sliders change
sensitivitySlider.addEventListener('input', function() {
    settings.sensitivity = parseInt(this.value);
    sensitivityValue.textContent = settings.sensitivity;
});

barsSlider.addEventListener('input', function() {
    settings.barCount = parseInt(this.value);
    barsValue.textContent = settings.barCount;
});

// Start microphone and visualization
startBtn.addEventListener('click', async function() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true 
        });
        
        // Set up audio context
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        
        // Set analyser properties
        analyser.fftSize = 2048;
        
        // Connect microphone to analyser
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        // Create array to hold frequency data
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        // Update UI
        isActive = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusDiv.textContent = "🟢 Microphone: On - Speak or play music!";
        statusDiv.style.color = "#4cc9f0";
        
        // Start animation loop
        animate();
        
    } catch (error) {
        console.error("Error accessing microphone:", error);
        statusDiv.textContent = "❌ Error accessing microphone";
        statusDiv.style.color = "#f72585";
    }
});

// Stop microphone and visualization
stopBtn.addEventListener('click', function() {
    // Stop microphone tracks
    if (microphone && microphone.mediaStream) {
        microphone.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    // Close audio context
    if (audioContext) {
        audioContext.close();
    }
    
    // Update UI
    isActive = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusDiv.textContent = "🔴 Microphone: Off";
    statusDiv.style.color = "white";
    
    // Stop animation
    cancelAnimationFrame(animationId);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Main animation loop
function animate() {
    if (!isActive) return;
    
    // Get frequency data from microphone
    analyser.getByteFrequencyData(dataArray);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw circular visualizer
    drawVisualizer();
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}

// Draw the circular visualizer
function drawVisualizer() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#16213e";
    ctx.fill();
    
    // Draw bars around the circle
    const angleStep = (Math.PI * 2) / settings.barCount;
    
    for (let i = 0; i < settings.barCount; i++) {
        // Get frequency data for this bar
        const dataIndex = Math.floor((i / settings.barCount) * dataArray.length);
        let height = dataArray[dataIndex] / 255;
        
        // Apply sensitivity
        height = height * (settings.sensitivity / 50);
        
        // Limit height
        height = Math.min(height, 1);
        
        // Calculate bar position
        const angle = i * angleStep;
        const barLength = 10 + height * (radius * 0.7);
        
        // Calculate bar start and end points
        const x1 = centerX + (radius * 0.2) * Math.cos(angle);
        const y1 = centerY + (radius * 0.2) * Math.sin(angle);
        const x2 = centerX + barLength * Math.cos(angle);
        const y2 = centerY + barLength * Math.sin(angle);
        
        // Set bar color based on height
        const hue = 200 + height * 100; // Blue to purple
        ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        
        // Draw the bar
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#4361ee";
    ctx.fill();
}

// Draw static visualizer when page loads (for demo)
function drawStaticVisualizer() {
    // Create fake frequency data for demo
    const demoData = new Uint8Array(1024);
    for (let i = 0; i < demoData.length; i++) {
        // Create a wave pattern for demo
        demoData[i] = Math.sin(i * 0.05) * 100 + 100;
    }
    
    // Temporarily replace dataArray for demo
    const originalDataArray = dataArray;
    dataArray = demoData;
    
    // Draw one frame
    drawVisualizer();
    
    // Restore
    dataArray = originalDataArray;
}

// Initialize the page
window.addEventListener('load', function() {
    // Draw initial static visualizer
    drawStaticVisualizer();
    
    // Show a welcome message
    console.log("Simple Audio Visualizer loaded!");
    console.log("Click 'Start Microphone' to begin.");
});