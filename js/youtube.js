// Elementos do YouTube
const ytSearch = document.getElementById('ytSearch');
const ytSearchBtn = document.getElementById('ytSearchBtn');
const ytResults = document.getElementById('ytResults');
const ytPlayer = document.getElementById('ytPlayer');
const ytIframe = document.getElementById('ytIframe');

// YouTube IFrame API
let player;

// Função para inicializar o player do YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('ytIframe', {
        height: '360',
        width: '640',
        videoId: '',
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'fs': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('Player do YouTube pronto!');
}

function onPlayerStateChange(event) {
    // Você pode adicionar lógica aqui para quando o estado do player mudar
}

// Busca no YouTube usando proxy CORS
async function searchYouTube(query) {
    try {
        showLoading();
        const proxyUrl = 'https://corsproxy.io/';
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        
        const response = await fetch(proxyUrl + '?' + searchUrl);
        const html = await response.text();
        
        // Extrair dados dos vídeos usando regex
        const videoPattern = /"videoRenderer":{"videoId":"([^"]+)","thumbnail":{"thumbnails":\[.*?"url":"([^"]+)".*?"title":{"runs":\[{"text":"([^"]+)"}.*?"channelTitle":"([^"]+)"/g;
        
        const videos = [];
        let match;
        let count = 0;
        
        while ((match = videoPattern.exec(html)) !== null && count < 5) {
            videos.push({
                id: match[1],
                thumbnail: match[2],
                title: match[3],
                channel: match[4]
            });
            count++;
        }
        
        displayYouTubeResults(videos);
    } catch (error) {
        console.error('Erro na busca:', error);
        showNotification('Erro ao buscar vídeos 😢', true);
    } finally {
        hideLoading();
    }
}

// Exibir resultados da busca
function displayYouTubeResults(videos) {
    ytResults.innerHTML = videos.map(video => `
        <div class="yt-result" onclick="playYouTubeVideo('${video.id}')">
            <div class="thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="play-overlay">▶️</div>
            </div>
            <div class="info">
                <h3>${video.title}</h3>
                <p>${video.channel}</p>
            </div>
        </div>
    `).join('');
}

// Reproduzir vídeo
function playYouTubeVideo(videoId) {
    ytPlayer.classList.remove('hidden');
    if (player) {
        player.loadVideoById(videoId);
    } else {
        ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    // Pausar player de música local
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.pause();
    }
}

// Fechar player do YouTube
function closeYouTubePlayer() {
    ytPlayer.classList.add('hidden');
    if (player) {
        player.stopVideo();
    }
    ytIframe.src = '';
}

// Event Listeners
ytSearchBtn.addEventListener('click', () => searchYouTube(ytSearch.value));
ytSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchYouTube(ytSearch.value);
    }
});

// Utilitários
function showLoading() {
    ytSearchBtn.innerHTML = '⏳';
    ytSearchBtn.disabled = true;
}

function hideLoading() {
    ytSearchBtn.innerHTML = '🔍';
    ytSearchBtn.disabled = false;
}

// Carregar YouTube IFrame API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);