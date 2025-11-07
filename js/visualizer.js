// Elementos do Canvas
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let audioContext;
let analyser;
let dataArray;
let source;
let animationFrame;
const audioPlayer = document.getElementById('audioPlayer');

// Inicialização do visualizador
function initializeVisualizer() {
    // Configurar tamanho do canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Criar contexto de áudio
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    // Configurar analyser
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    // Conectar fonte de áudio
    source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Iniciar animação
    animate();
}

// Redimensionar canvas
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// Função de animação
function animate() {
    animationFrame = requestAnimationFrame(animate);
    
    // Obter dados de frequência
    analyser.getByteFrequencyData(dataArray);
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar visualização
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;
        
        // Gradiente baseado na altura
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#ff85a2');
        gradient.addColorStop(1, '#ff5c8a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}

// Parar animação
function stopVisualization() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
}

// Event Listeners
audioPlayer.addEventListener('play', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
});

// Exportar funções
window.initializeVisualizer = initializeVisualizer;
window.stopVisualization = stopVisualization;