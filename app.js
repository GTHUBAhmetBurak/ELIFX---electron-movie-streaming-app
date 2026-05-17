// Elifx Ana Motor - elifproje & SınavLink.com
const API_KEY = 'cd5bf90bae733d9a3ecd1e672b83c91e'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

let currentMode = 'movie'; 
let currentPage = 1;
let totalPages = 100;
let selectedGenre = [];

let favorites = JSON.parse(localStorage.getItem('elifx_favs')) || [];
let watchHistory = JSON.parse(localStorage.getItem('elifx_history')) || [];

const main = document.getElementById('main');
const tagsEl = document.getElementById('tags');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const currentEl = document.getElementById('current-page');

const getApiUrl = () => `${BASE_URL}/discover/${currentMode}?sort_by=popularity.desc&api_key=${API_KEY}`;
const getSearchUrl = () => `${BASE_URL}/search/${currentMode}?api_key=${API_KEY}&query=`;
const getGenresUrl = () => `${BASE_URL}/genre/${currentMode}/list?api_key=${API_KEY}&language=tr-TR`;

window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.style.opacity = '0';
        setTimeout(() => { if(splash) splash.style.display = 'none'; }, 500);
    }, 2000);
});

async function fetchAndSetGenres() {
    try {
        const res = await fetch(getGenresUrl());
        const data = await res.json();
        tagsEl.innerHTML = '';
        selectedGenre = [];
        data.genres.forEach(genre => {
            const t = document.createElement('div');
            t.classList.add('tag');
            t.id = genre.id;
            t.innerText = genre.name;
            t.addEventListener('click', () => {
                if(selectedGenre.includes(genre.id)){
                    selectedGenre = selectedGenre.filter(id => id !== genre.id);
                } else {
                    selectedGenre.push(genre.id);
                }
                currentPage = 1;
                getMovies(getApiUrl() + '&with_genres=' + encodeURI(selectedGenre.join(',')));
                highlightSelection();
            });
            tagsEl.append(t);
        });
    } catch (e) { console.error(e); }
}

function highlightSelection() {
    document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('active'));
    selectedGenre.forEach(id => document.getElementById(id)?.classList.add('active'));
}

// 🎬 KALDIĞIN YERDEN DEVAM ET ŞERİDİ RENDER FONKSİYONU
function renderContinueWatching() {
    const section = document.getElementById('continue-watching-section');
    const list = document.getElementById('continue-watching-list');
    list.innerHTML = '';

    if (watchHistory.length === 0 || (currentMode !== 'movie' && currentMode !== 'tv')) {
        section.style.display = 'none';
        return;
    }

    // O anki moda göre (Film/Dizi) geçmişi filtrele ve son 10 tanesini al
    const filteredHistory = watchHistory.filter(h => h.type === currentMode).slice(0, 10);

    if (filteredHistory.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    filteredHistory.forEach(item => {
        const el = document.createElement('div');
        el.style.cssText = "width: 200px; flex-shrink: 0; cursor: pointer; border-radius: 5px; overflow: hidden; position: relative; transition: 0.3s; border: 2px solid transparent;";
        el.onmouseover = () => el.style.border = "2px solid #E50914";
        el.onmouseout = () => el.style.border = "2px solid transparent";
        
        el.innerHTML = `
            <img src="${IMG_URL + item.poster_path}" alt="${item.title}" style="width: 100%; height: 300px; object-fit: cover; display: block;">
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.8); padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: white; font-size: 0.9rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">${item.title}</span>
                <i class="fas fa-play-circle" style="color: #E50914; font-size: 1.2rem;"></i>
            </div>
            <!-- Netflix Tarzı İlerleme Çubuğu İllüzyonu -->
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: #333;">
                <div style="width: ${Math.floor(Math.random() * 60) + 20}%; height: 100%; background: #E50914;"></div>
            </div>
        `;
        
        el.addEventListener('click', () => openModal(item.id, item.type, item.title, item.poster_path));
        list.appendChild(el);
    });
}

// İlk Yükleme
getMovies(getApiUrl());
fetchAndSetGenres();
renderContinueWatching();

async function getMovies(url) {
    try {
        const res = await fetch(url + `&page=${currentPage}`);
        const data = await res.json();
        if(data.results.length) {
            showMovies(data.results);
            updateHeroBanner(data.results[Math.floor(Math.random() * 5)]);
            totalPages = data.total_pages;
            currentEl.innerText = `Sayfa ${currentPage}`;
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;
        } else {
            main.innerHTML = `<h1 style="color:white; margin-top:50px;">SınavLink.com: Sonuç Bulunamadı</h1>`;
        }
    } catch (e) { console.error(e); }
}

function showMovies(movies) {
    main.innerHTML = '';
    movies.forEach(item => {
        const displayTitle = item.title || item.name; 
        if (!item.poster_path) return;

        const isFav = favorites.find(f => f.id === item.id);
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        
        movieEl.innerHTML = `
            <img src="${IMG_URL + item.poster_path}" alt="${displayTitle}" onclick="openModal(${item.id}, '${currentMode}', '${displayTitle.replace(/'/g, "\\'")}', '${item.poster_path}')">
            <div class="movie-info">
                <h3>${displayTitle}</h3>
                <button class="fav-btn-small ${isFav ? 'favorited' : ''}" onclick="toggleFav(${item.id}, '${displayTitle.replace(/'/g, "\\'")}', '${item.poster_path}', this); event.stopPropagation();">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        main.appendChild(movieEl);
    });
}

function updateHeroBanner(item) {
    if(!item || !item.backdrop_path) return;
    const hero = document.getElementById('hero-banner');
    if(!hero) return;
    hero.style.background = `url(${BACKDROP_URL + item.backdrop_path})`;
    document.getElementById('hero-title').innerText = item.title || item.name;
    document.getElementById('hero-desc').innerText = item.overview ? item.overview.substring(0, 150) + "..." : "Efsanevi bir deneyim.";
    
    const playBtn = hero.querySelector('.play-btn');
    if(playBtn) {
        const newPlayBtn = playBtn.cloneNode(true);
        playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
        newPlayBtn.addEventListener('click', () => openModal(item.id, currentMode, item.title || item.name, item.poster_path));
    }
}

// ARAMA SİSTEMİ
const searchInput = document.getElementById('search');
const searchResultsContainer = document.getElementById('search-results');

searchInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value;
    if (searchTerm && searchTerm.length >= 2) {
        const res = await fetch(getSearchUrl() + searchTerm);
        const data = await res.json();
        showSearchSuggestions(data.results);
    } else {
        searchResultsContainer.style.display = 'none';
    }
});

function showSearchSuggestions(results) {
    searchResultsContainer.innerHTML = '';
    if(results.length === 0) { searchResultsContainer.style.display = 'none'; return; }
    
    searchResultsContainer.style.display = 'block';
    const filteredResults = results.filter(item => item.poster_path).slice(0, 8);
    
    filteredResults.forEach(item => {
        const displayTitle = item.title || item.name;
        const el = document.createElement('div');
        el.classList.add('search-result-item');
        el.innerHTML = `
            <img src="${IMG_URL + item.poster_path}" alt="${displayTitle}">
            <span>${displayTitle}</span>
        `;
        el.addEventListener('click', () => {
            searchResultsContainer.style.display = 'none';
            searchInput.value = '';
            openModal(item.id, currentMode, displayTitle, item.poster_path);
        });
        searchResultsContainer.appendChild(el);
    });
}

window.addEventListener('click', (e) => {
    if(!e.target.closest('#form')) searchResultsContainer.style.display = 'none';
});

document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    searchResultsContainer.style.display = 'none';
    const searchTerm = searchInput.value;
    if (searchTerm) { currentPage = 1; getMovies(getSearchUrl() + searchTerm); }
});

// MODAL VE OYNATICI
const modal = document.getElementById('trailerModal');
const modalBody = document.getElementById('modal-body');

async function openModal(id, type, title, poster) {
    addToHistory(id, title, poster, type);
    renderContinueWatching(); // Tıklandığı an şeridi güncelle
    
    modal.style.display = 'block';
    modalBody.innerHTML = `<h2 style="color:white; text-align:center; padding:50px;">Elifx Sunucularına Bağlanılıyor...</h2>`;

    try {
        const castRes = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
        const castData = await castRes.json();
        const castHTML = castData.cast.slice(0, 6).map(c => `
            <div class="cast-item">
                <img src="${c.profile_path ? IMG_URL + c.profile_path : 'https://via.placeholder.com/80'}" alt="${c.name}">
                <p style="font-size:0.8rem; margin-top:5px;">${c.name}</p>
            </div>
        `).join('');

        let tvControlsHTML = '';
        if(type === 'tv') {
            const tvDetailsRes = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=tr-TR`);
            const tvDetails = await tvDetailsRes.json();
            const validSeasons = tvDetails.seasons.filter(s => s.season_number > 0);
            
            let seasonOptions = '';
            if (validSeasons.length > 0) {
                validSeasons.forEach(s => {
                    seasonOptions += `<option value="${s.season_number}" data-episodes="${s.episode_count}">${s.season_number}. Sezon</option>`;
                });
            } else {
                seasonOptions = `<option value="1" data-episodes="1">1. Sezon</option>`;
            }

            tvControlsHTML = `
                <div style="margin-top:20px; padding:15px 20px; background: #111; border-radius:8px; border: 1px solid #333;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                        <span style="color:#fff; font-size:1.5rem; font-weight:bold;">Bölümler</span>
                        <div style="position:relative; width: 150px;">
                            <select id="season-input" style="width:100%; appearance:none; background:#242424; color:white; border:1px solid #444; padding:8px 15px; border-radius:4px; font-weight:bold; cursor:pointer; outline:none;">
                                ${seasonOptions}
                            </select>
                            <i class="fas fa-chevron-down" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:#aaa; pointer-events:none;"></i>
                        </div>
                    </div>
                    <div id="episodes-list" class="episodes-container">
                        <div style="color:white; text-align:center;">Bölümler yükleniyor...</div>
                    </div>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <iframe class="video-frame" id="elifx-player" src="" allowfullscreen="true" frameborder="0"></iframe>
            
            <div class="modal-controls" style="display:flex; align-items:center; justify-content:space-between; background:#111; padding:15px; border-radius:8px; margin-top:15px; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; gap:10px; align-items:center;">
                    <span style="color:#888; font-size:0.9rem; font-weight:bold;">Sunucu:</span>
                    <select id="server-select" style="background:#222; color:white; border:1px solid #444; padding:8px 12px; border-radius:4px; outline:none; cursor:pointer;">
                        <option value="vidsrc">Sunucu 1 (Önerilen)</option>
                        <option value="multiembed">Sunucu 2 (Alternatif)</option>
                        <option value="2embed">Sunucu 3 (Yedek)</option>
                    </select>
                </div>
                <div style="color:#aaa; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-closed-captioning"></i> TR Altyazı/Kalite için oynatıcı içinden 'CC' ikonunu seçiniz.
                </div>
                <button id="fullscreen-btn" style="background:#E50914; color:white; border:none; padding:10px 20px; border-radius:4px; font-weight:bold; cursor:pointer;">
                    <i class="fas fa-expand"></i> Tam Ekran İzle
                </button>
            </div>

            ${tvControlsHTML}
            
            <h3 style="margin-top:20px; border-bottom:1px solid #333; padding-bottom:10px;">Oyuncular</h3>
            <div class="cast-list">${castHTML}</div>
        `;

        let currentSeason = 1;
        let currentEpisode = 1;

        const renderEpisodes = async (seasonNum) => {
            const epContainer = document.getElementById('episodes-list');
            if(!epContainer) return;
            epContainer.innerHTML = '<div style="color:white; text-align:center;">Bölümler Yükleniyor...</div>';
            
            try {
                const res = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${API_KEY}&language=tr-TR`);
                const seasonData = await res.json();
                
                epContainer.innerHTML = '';
                
                if(seasonData.episodes && seasonData.episodes.length > 0) {
                    seasonData.episodes.forEach(ep => {
                        const epCard = document.createElement('div');
                        epCard.classList.add('episode-card');
                        const imgPath = ep.still_path ? IMG_URL + ep.still_path : (poster ? IMG_URL + poster : 'https://via.placeholder.com/160x90?text=Resim+Yok');
                        
                        epCard.innerHTML = `
                            <div class="episode-img-wrapper">
                                <img src="${imgPath}" class="episode-img" alt="${ep.name}">
                                <span class="episode-number">${ep.episode_number}</span>
                            </div>
                            <div class="episode-details">
                                <div class="episode-title">${ep.episode_number}. ${ep.name}</div>
                                <div class="episode-desc">${ep.overview || 'Bu bölüm için özet bulunmuyor.'}</div>
                            </div>
                        `;
                        
                        epCard.addEventListener('click', () => {
                            document.querySelectorAll('.episode-card').forEach(c => c.classList.remove('active-ep'));
                            epCard.classList.add('active-ep');
                            currentSeason = seasonNum;
                            currentEpisode = ep.episode_number;
                            updateIframeSrc();
                            document.getElementById('elifx-player').scrollIntoView({ behavior: 'smooth', block: 'center' });
                        });
                        
                        epContainer.appendChild(epCard);
                    });
                } else {
                    epContainer.innerHTML = '<div style="color:#aaa; text-align:center;">Bu sezona ait bölüm bulunamadı.</div>';
                }
            } catch(e) { epContainer.innerHTML = '<div style="color:red; text-align:center;">Hata oluştu.</div>'; }
        };

        const updateIframeSrc = () => {
            const server = document.getElementById('server-select').value;
            const player = document.getElementById('elifx-player');
            let url = '';

            if (type === 'movie') {
                if (server === 'vidsrc') url = `https://vidsrc.to/embed/movie/${id}`;
                else if (server === 'multiembed') url = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
                else if (server === '2embed') url = `https://www.2embed.cc/embed/${id}`;
            } else {
                if (server === 'vidsrc') url = `https://vidsrc.to/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
                else if (server === 'multiembed') url = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${currentSeason}&e=${currentEpisode}`;
                else if (server === '2embed') url = `https://www.2embed.cc/embedtv/${id}?s=${currentSeason}&e=${currentEpisode}`;
            }
            player.src = url;

            player.onload = () => {
                setTimeout(() => {
                    try { player.contentWindow.postMessage('clearAds', '*'); } 
                    catch (e) { console.log("Elifx: Temizlik kısıtlandı."); }
                }, 1000);
            };
        };

        if(type === 'tv') {
            const initialSeason = document.getElementById('season-input').value || 1;
            currentSeason = initialSeason;
            currentEpisode = 1;
            await renderEpisodes(initialSeason);
            const firstCard = document.querySelector('.episode-card');
            if(firstCard) firstCard.classList.add('active-ep');
        }
        
        updateIframeSrc();
        document.getElementById('server-select').addEventListener('change', updateIframeSrc);
        
        if(type === 'tv') {
            document.getElementById('season-input').addEventListener('change', async (e) => {
                currentSeason = e.target.value;
                currentEpisode = 1; 
                await renderEpisodes(currentSeason);
                const firstCard = document.querySelector('.episode-card');
                if(firstCard) firstCard.classList.add('active-ep');
                updateIframeSrc();
            });
        }

        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            const player = document.getElementById('elifx-player');
            if (player.requestFullscreen) { player.requestFullscreen(); } 
            else if (player.webkitRequestFullscreen) { player.webkitRequestFullscreen(); }
        });

    } catch(err) {
        modalBody.innerHTML = `<h2 style="color:white; text-align:center;">Sunucu şu an meşgul kral.</h2>`;
    }
}

document.querySelector('.close-btn').addEventListener('click', () => { modal.style.display = 'none'; modalBody.innerHTML = ''; });

// Diğer Menü İşlemleri
prevBtn.addEventListener('click', () => {
    if(currentPage > 1) { currentPage--; getMovies(getApiUrl()); window.scrollTo({top: 500, behavior: 'smooth'}); }
});
nextBtn.addEventListener('click', () => {
    if(currentPage < totalPages) { currentPage++; getMovies(getApiUrl()); window.scrollTo({top: 500, behavior: 'smooth'}); }
});

const navButtons = document.querySelectorAll('nav button');

function resetUIForTab(activeBtnId) {
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeBtnId).classList.add('active');
    
    const showMainUI = (activeBtnId === 'home-btn' || activeBtnId === 'tv-btn');
    tagsEl.style.display = showMainUI ? 'flex' : 'none';
    document.querySelector('.pagination').style.display = showMainUI ? 'flex' : 'none';
    document.getElementById('hero-banner').style.display = showMainUI ? 'flex' : 'none';
    
    // Kaldığın yerden devam et şeridi sadece ana sayfa ve dizilerde görünsün
    if (showMainUI) {
        renderContinueWatching();
    } else {
        document.getElementById('continue-watching-section').style.display = 'none';
    }
}

document.getElementById('home-btn').addEventListener('click', () => {
    currentMode = 'movie'; currentPage = 1; resetUIForTab('home-btn'); fetchAndSetGenres(); getMovies(getApiUrl());
});
document.getElementById('tv-btn').addEventListener('click', () => {
    currentMode = 'tv'; currentPage = 1; resetUIForTab('tv-btn'); fetchAndSetGenres(); getMovies(getApiUrl());
});

function toggleFav(id, title, poster, btn) {
    const existsIndex = favorites.findIndex(f => f.id === id);
    if(existsIndex >= 0) { favorites.splice(existsIndex, 1); btn.classList.remove('favorited'); } 
    else { favorites.push({ id, title, poster_path: poster }); btn.classList.add('favorited'); }
    localStorage.setItem('elifx_favs', JSON.stringify(favorites));
}
function addToHistory(id, title, poster, type) {
    watchHistory = watchHistory.filter(h => h.id !== id);
    watchHistory.unshift({ id, title, poster_path: poster, type });
    if(watchHistory.length > 50) watchHistory.pop(); 
    localStorage.setItem('elifx_history', JSON.stringify(watchHistory));
}

document.getElementById('fav-btn').addEventListener('click', () => {
    resetUIForTab('fav-btn');
    if(favorites.length === 0) { main.innerHTML = `<h1 style="color:white; margin-top:50px;">Henüz favori içeriğin yok.</h1>`; return; }
    showListDirectly(favorites);
});
document.getElementById('history-btn').addEventListener('click', () => {
    resetUIForTab('history-btn');
    if(watchHistory.length === 0) { main.innerHTML = `<h1 style="color:white; margin-top:50px;">İzleme geçmişin boş kral.</h1>`; return; }
    showListDirectly(watchHistory);
});

function showListDirectly(listData) {
    main.innerHTML = '';
    listData.forEach(item => {
        const { id, title, poster_path, type } = item;
        const itemType = type || 'movie'; 
        const isFav = favorites.find(f => f.id === id);
        
        const el = document.createElement('div');
        el.classList.add('movie');
        el.innerHTML = `
            <img src="${IMG_URL + poster_path}" alt="${title}" onclick="openModal(${id}, '${itemType}', '${title.replace(/'/g, "\\'")}', '${poster_path}')">
            <div class="movie-info">
                <h3>${title}</h3>
                <button class="fav-btn-small ${isFav ? 'favorited' : ''}" onclick="toggleFav(${id}, '${title.replace(/'/g, "\\'")}', '${poster_path}', this); event.stopPropagation();">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        main.appendChild(el);
    });
}

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if(window.scrollY > 50) header.style.background = '#141414';
    else header.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)';
});