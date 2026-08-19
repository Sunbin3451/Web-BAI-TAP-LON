import { getMusicByQuery } from './api.js';
import { toggleLikeSong, isSongLiked } from './favorite.js';

// Bộ nhớ đệm lưu trữ kết quả và từ khóa tìm kiếm gần nhất
let cachedSearchQuery = '';
let cachedSearchResults = [];

// Hàm chính xử lý tìm kiếm & hiển thị kết quả
export async function triggerSearch(queryText) {
    const searchInput = document.querySelector('.search-input');
    const query = queryText !== undefined ? queryText : (searchInput ? searchInput.value.trim() : '');

    const searchNavBtn = Array.from(document.querySelectorAll('.sidebar-nav-item, .nav-item, a, button')).find(
        el => el.textContent && el.textContent.includes('Tìm Kiếm')
    );

    let resultsList = document.getElementById('search-results-list');
    if (!resultsList && searchNavBtn) {
        searchNavBtn.click();
        await new Promise(resolve => setTimeout(resolve, 150));
    }

    const initialState = document.getElementById('search-initial-state');
    const loadingState = document.getElementById('search-loading-state');
    const notfoundState = document.getElementById('search-notfound-state');
    resultsList = document.getElementById('search-results-list');

    // Nếu ô tìm kiếm trống -> xóa cache, xóa localStorage và về trạng thái ban đầu
    if (!query) {
        cachedSearchQuery = '';
        cachedSearchResults = [];
        localStorage.removeItem('ou_last_search_query');

        if (initialState) initialState.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (notfoundState) notfoundState.classList.add('hidden');
        if (resultsList) {
            resultsList.innerHTML = '';
            resultsList.classList.add('hidden');
        }
        return;
    }

    // Lưu lại từ khóa tìm kiếm vào localStorage
    localStorage.setItem('ou_last_search_query', query);

    // Nếu từ khóa giống hệt lần tìm trước và đã có cache -> khôi phục ngay lập tức
    if (query === cachedSearchQuery && cachedSearchResults.length > 0) {
        if (initialState) initialState.classList.add('hidden');
        if (notfoundState) notfoundState.classList.add('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (resultsList) {
            resultsList.innerHTML = renderSongItems(cachedSearchResults);
            resultsList.classList.remove('hidden');
            attachSongItemEvents(resultsList, cachedSearchResults);
        }
        return;
    }

    // Nếu là từ khóa mới -> Bật Skeleton Loading và gọi API
    if (initialState) initialState.classList.add('hidden');
    if (notfoundState) notfoundState.classList.add('hidden');
    if (resultsList) resultsList.classList.add('hidden');
    if (loadingState) loadingState.classList.remove('hidden');

    try {
        const responseData = await getMusicByQuery(query);

        if (loadingState) loadingState.classList.add('hidden');

        let songs = [];
        if (Array.isArray(responseData)) {
            songs = responseData;
        } else if (responseData && typeof responseData === 'object') {
            songs = responseData.tracks?.items
                || responseData.tracks
                || responseData.items
                || responseData.data
                || responseData.results
                || [];
        }

        // Lưu vào bộ nhớ đệm
        cachedSearchQuery = query;
        cachedSearchResults = songs;

        if (songs && songs.length > 0) {
            if (resultsList) {
                resultsList.innerHTML = renderSongItems(songs);
                resultsList.classList.remove('hidden');
                attachSongItemEvents(resultsList, songs);
            }
        } else {
            if (notfoundState) notfoundState.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Lỗi trong quá trình tìm kiếm:', error);
        if (loadingState) loadingState.classList.add('hidden');
        if (notfoundState) notfoundState.classList.remove('hidden');
    }
}

// Khôi phục kết quả tìm kiếm khi quay lại tab Tìm Kiếm
export function restoreSearchState() {
    const searchInput = document.querySelector('.search-input');
    const currentInputValue = searchInput ? searchInput.value.trim() : '';

    // Nếu trên thanh search đang có chữ hoặc có dữ liệu đã cache
    if (currentInputValue || cachedSearchResults.length > 0) {
        triggerSearch(currentInputValue || cachedSearchQuery);
    }
}

function renderSongItems(songs) {
    return songs.map((song, index) => {
        const title = song.title || song.name || 'Unknown Title';
        const artist = song.artist || song.singer || (Array.isArray(song.artists) ? song.artists.map(a => a.name || a).join(', ') : 'Unknown Artist');
        const cover = song.thumbnail || song.coverUrl || song.image || './assets/images/default.jpg';
        const duration = formatDuration(song.duration);
        const songId = song.id || song._id || song.sourceId || index;

        const liked = isSongLiked(songId);
        const activeClass = liked ? ' active' : '';
        const heartIconClass = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

        return `
            <div class="search__song-item" data-id="${songId}" data-index="${index}">
                <div class="search__song-left">
                    <div class="search__thumb-wrapper">
                        <img src="${cover}" alt="${title}" class="search__song-thumb" onerror="this.src='./assets/images/default.jpg'">
                        <button class="search__play-btn" title="Phát bài hát">
                            <i class="fa-solid fa-play"></i>
                        </button>
                    </div>
                    <div class="search__song-info">
                        <span class="search__song-title">${title}</span>
                        <span class="search__song-artist">${artist}</span>
                    </div>
                </div>
                <div class="search__song-right">
                    <span class="search__song-duration">${duration}</span>
                    <button class="favorite-btn${activeClass}" title="${liked ? 'Bỏ yêu thích' : 'Yêu thích'}">
                        <i class="${heartIconClass}"></i>
                    </button>
                    <button class="search__action-btn search__more-btn" title="Tùy chọn">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function attachSongItemEvents(container, songs) {
    const songItems = container.querySelectorAll('.search__song-item');

    songItems.forEach(item => {
        const index = item.getAttribute('data-index');
        const songData = songs[index];

        item.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn') || e.target.closest('.search__more-btn')) {
                return;
            }
            if (window.playSong && songData) {
                window.playSong(songData);
            }
        });

        const favBtn = item.querySelector('.favorite-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isLikedNow = toggleLikeSong(songData);

                favBtn.classList.toggle('active', isLikedNow);
                favBtn.title = isLikedNow ? 'Bỏ yêu thích' : 'Yêu thích';

                const heartIcon = favBtn.querySelector('i');
                if (heartIcon) {
                    heartIcon.className = isLikedNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                }
            });
        }
    });
}

function formatDuration(duration) {
    if (!duration || isNaN(duration)) return '--:--';
    let totalSeconds = duration > 10000 ? Math.floor(duration / 1000) : Math.floor(duration);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ========================================================
// GLOBAL EVENT LISTENERS
// ========================================================

// 1. Phím Enter trên ô input
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.classList.contains('search-input')) {
        e.preventDefault();
        triggerSearch(e.target.value.trim());
    }
});

// 2. Click icon kính lúp
document.addEventListener('click', (e) => {
    const searchIcon = e.target.closest('.search-icon, .fa-magnifying-glass, .search-btn');
    if (searchIcon) {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            triggerSearch(searchInput.value.trim());
        }
    }
});

// 3. Tự động phục hồi kết quả khi người dùng bấm quay lại tab "Tìm Kiếm" trên Sidebar
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.sidebar-nav-item, .nav-item, a, button');
    if (navItem && navItem.textContent.includes('Tìm Kiếm')) {
        setTimeout(() => {
            restoreSearchState();
        }, 150);
    }
});

// 4. Tự động khôi phục chữ trên thanh Search và kết quả khi reload
document.addEventListener('spa:pageLoaded', (e) => {
    if (e.detail.page === 'search') {
        const searchInput = document.querySelector('.search-input');
        const savedQuery = localStorage.getItem('ou_last_search_query');

        if (searchInput && savedQuery) {
            searchInput.value = savedQuery;
            triggerSearch(savedQuery);
        }
    }
});