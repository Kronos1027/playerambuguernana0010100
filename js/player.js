// Elementos do DOM
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.querySelector('.play-pause');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const shuffleBtn = document.querySelector('.shuffle');
const repeatBtn = document.querySelector('.repeat');
const volumeSlider = document.querySelector('.volume-slider');
const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.querySelector('.current-time');
const totalTimeEl = document.querySelector('.total-time');
const fileInput = document.getElementById('fileInput');
const playlist = document.getElementById('playlist');
const albumArt = document.querySelector('.album-art img');
const songTitle = document.querySelector('.song-title');
const artistName = document.querySelector('.artist-name');

// Estado do Player
let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'none'; // none, one, all
let songs = [];
let shuffledPlaylist = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePlayer);
fileInput.addEventListener('change', handleFileUpload);
playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', playPrevious);
nextBtn.addEventListener('click', playNext);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
volumeSlider.addEventListener('input', updateVolume);
progressBar.addEventListener('click', seekTo);
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', handleSongEnd);

// Inicialização
async function initializePlayer() {
    try {
        await loadSavedSongs();
        setupKeyboardControls();
        initializeVisualizer();
    } catch (error) {
        console.error('Erro ao inicializar player:', error);
        showNotification('Erro ao carregar músicas 😢', true);
    }
}

// Carregar músicas salvas
async function loadSavedSongs() {
    try {
        songs = await getAllSongs();
        updatePlaylist();
    } catch (error) {
        console.error('Erro ao carregar músicas:', error);
        throw error;
    }
}

// Upload de arquivos
async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const uploadBtn = document.querySelector('.upload-btn');
    
    try {
        uploadBtn.innerHTML = '<span class="emoji">⏳</span> Carregando...';
        
        for (const file of files) {
            if (!file.type.startsWith('audio/')) {
                continue;
            }
            
            const song = await saveSong(file);
            songs.push(song);
        }
        
        updatePlaylist();
        showNotification('Músicas adicionadas com sucesso! 🎵');
    } catch (error) {
        console.error('Erro no upload:', error);
        showNotification('Erro ao adicionar músicas 😢', true);
    } finally {
        uploadBtn.innerHTML = '<span class="emoji">🍓</span> Adicionar Músicas';
        fileInput.value = '';
    }
}

// Controles do Player
function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = '⏸️';
        isPlaying = true;
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶️';
        isPlaying = false;
    }
}

async function playSong(index) {
    try {
        const song = isShuffled ? shuffledPlaylist[index] : songs[index];
        audioPlayer.src = song.data;
        currentSongIndex = index;
        
        updateNowPlaying(song);
        await audioPlayer.play();
        
        isPlaying = true;
        playPauseBtn.textContent = '⏸️';
        highlightCurrentSong();
        
    } catch (error) {
        console.error('Erro ao tocar música:', error);
        showNotification('Erro ao tocar música 😢', true);
    }
}

function playNext() {
    let nextIndex;
    
    if (repeatMode === 'one') {
        nextIndex = currentSongIndex;
    } else if (isShuffled) {
        nextIndex = (currentSongIndex + 1) % shuffledPlaylist.length;
    } else {
        nextIndex = (currentSongIndex + 1) % songs.length;
    }
    
    playSong(nextIndex);
}

function playPrevious() {
    let prevIndex;
    
    if (repeatMode === 'one') {
        prevIndex = currentSongIndex;
    } else if (isShuffled) {
        prevIndex = currentSongIndex === 0 ? shuffledPlaylist.length - 1 : currentSongIndex - 1;
    } else {
        prevIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    }
    
    playSong(prevIndex);
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active');
    
    if (isShuffled) {
        shuffledPlaylist = [...songs].sort(() => Math.random() - 0.5);
    }
    
    updatePlaylist();
}

function toggleRepeat() {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    repeatMode = modes[(currentIndex + 1) % modes.length];
    
    updateRepeatButton();
}

// Atualização da UI
function updatePlaylist() {
    playlist.innerHTML = (isShuffled ? shuffledPlaylist : songs)
        .map((song, index) => `
            <div class="song-item ${index === currentSongIndex ? 'playing' : ''}" 
                 onclick="playSong(${index})">
                <span class="song-icon">🎵</span>
                <span class="song-name">${song.name}</span>
            </div>
        `).join('');
}

function updateNowPlaying(song) {
    songTitle.textContent = song.name.replace(/\.[^/.]+$/, '');
    artistName.textContent = 'Música Local';
    // Tentar buscar capa do álbum via Last.fm API aqui
}

function updateProgress() {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        
        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(duration);
    }
}

function seekTo(e) {
    const timelineWidth = progressBar.clientWidth;
    const clickPosition = e.offsetX;
    const jumpToTime = (clickPosition / timelineWidth) * audioPlayer.duration;
    audioPlayer.currentTime = jumpToTime;
}

function updateVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
}

// Utilitários
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    
    document.getElementById('notifications').appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Controles de Teclado
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            togglePlayPause();
        }
        if (e.code === 'ArrowLeft' && e.altKey) playPrevious();
        if (e.code === 'ArrowRight' && e.altKey) playNext();
    });
}

// Handler para fim da música
function handleSongEnd() {
    if (repeatMode === 'one') {
        audioPlayer.play();
    } else if (repeatMode === 'all' || currentSongIndex < songs.length - 1) {
        playNext();
    } else {
        isPlaying = false;
        playPauseBtn.textContent = '▶️';
    }
}