import { getMusicByQuery } from './api.js';
import { toggleLikeSong, isSongLiked } from './favorite.js';

let cachedSearchQuery = localStorage.getItem('ou_last_search_query') || '';
let currentSearchAbortController = null;

// Khôi phục kết quả đã lưu từ sessionStorage
let cachedSearchResults = [];
try {
    const savedResults = sessionStorage.getItem('ou_cached_search_results');
    if (savedResults) {
        cachedSearchResults = JSON.parse(savedResults);
        window.currentSearchResults = cachedSearchResults;
    }
} catch (e) {
    cachedSearchResults = [];
}

// Hàm đảm bảo chuyển sang view Tìm Kiếm
async function ensureSearchPageLoaded() {
    if (document.getElementById('search-results-list')) return true;

    if (typeof window.loadPage === 'function') {
        window.loadPage('search');
    } else {
        const searchNavBtn = document.querySelector('[data-page="search"]')
            || Array.from(document.querySelectorAll('.sidebar-nav-item, .nav-item, a, button')).find(
                el => el.textContent && el.textContent.includes('Tìm Kiếm')
            );
        if (searchNavBtn) searchNavBtn.click();
    }

    for (let i = 0; i < 15; i++) {
        await new Promise(res => setTimeout(res, 50));
        if (document.getElementById('search-results-list')) return true;
    }
    return false;
}

// Hàm chính xử lý tìm kiếm & hiển thị kết quả
export async function triggerSearch(queryText) {
    let searchInput = document.querySelector('.search-input');
    const query = queryText !== undefined ? queryText : (searchInput ? searchInput.value.trim() : '');

    // Nếu đang ở trang khác, tự động chuyển về trang Tìm Kiếm trước
    await ensureSearchPageLoaded();

    // Đồng bộ lại giá trị trên thanh input sau khi chuyển trang
    searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value !== query) {
        searchInput.value = query;
    }

    const resultsList = document.getElementById('search-results-list');
    const initialState = document.getElementById('search-initial-state');
    const loadingState = document.getElementById('search-loading-state');
    const notfoundState = document.getElementById('search-notfound-state');

    // 1. Nếu ô tìm kiếm trống
    if (!query) {
        cachedSearchQuery = '';
        cachedSearchResults = [];
        window.currentSearchResults = [];
        localStorage.removeItem('ou_last_search_query');
        sessionStorage.removeItem('ou_cached_search_results');

        if (initialState) initialState.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (notfoundState) notfoundState.classList.add('hidden');
        if (resultsList) {
            resultsList.innerHTML = '';
            resultsList.classList.add('hidden');
        }
        return;
    }

    // 2. Nếu từ khóa trùng với cache và đã có dữ liệu -> RENDER NGAY
    if (query === cachedSearchQuery && cachedSearchResults.length > 0 && resultsList) {
        localStorage.setItem('ou_last_search_query', query);
        if (initialState) initialState.classList.add('hidden');
        if (notfoundState) notfoundState.classList.add('hidden');
        if (loadingState) loadingState.classList.add('hidden');

        resultsList.innerHTML = renderSongItems(cachedSearchResults);
        resultsList.classList.remove('hidden');
        attachSongItemEvents(resultsList, cachedSearchResults);
        return;
    }

    // 3. Tìm kiếm từ khóa mới
    if (currentSearchAbortController) {
        currentSearchAbortController.abort();
    }
    currentSearchAbortController = new AbortController();

    localStorage.setItem('ou_last_search_query', query);

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

        cachedSearchQuery = query;
        cachedSearchResults = songs;
        window.currentSearchResults = songs;
        try {
            sessionStorage.setItem('ou_cached_search_results', JSON.stringify(songs));
        } catch (e) { }

        const listEl = document.getElementById('search-results-list');
        if (songs && songs.length > 0) {
            if (listEl) {
                listEl.innerHTML = renderSongItems(songs);
                listEl.classList.remove('hidden');
                attachSongItemEvents(listEl, songs);
            }
        } else {
            if (notfoundState) notfoundState.classList.remove('hidden');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Lỗi tìm kiếm:', error);
            if (loadingState) loadingState.classList.add('hidden');
            if (notfoundState) notfoundState.classList.remove('hidden');
        }
    }
}

export function restoreSearchState() {
    const searchInput = document.querySelector('.search-input');
    const currentInputVal = searchInput ? searchInput.value.trim() : '';
    const savedQuery = localStorage.getItem('ou_last_search_query') || '';

    const queryToUse = currentInputVal || savedQuery;
    if (searchInput && queryToUse) {
        searchInput.value = queryToUse;
    }

    if (queryToUse || cachedSearchResults.length > 0) {
        triggerSearch(queryToUse || cachedSearchQuery);
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
                        <i class="fa-solid fa-ellipsis-vertical pointer-events-none"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function attachSongItemEvents(container, songs) {
    const songItems = container.querySelectorAll('.search__song-item');

    songItems.forEach((item, index) => {
        const songData = songs[index];

        item.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn') || e.target.closest('.search__more-btn')) {
                return;
            }
            if (typeof window.playSong === 'function' && songData) {
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

                favBtn.classList.remove('heart-pop');
                void favBtn.offsetWidth;
                favBtn.classList.add('heart-pop');

                setTimeout(() => {
                    favBtn.classList.remove('heart-pop');
                }, 350);
            });
        }

        const moreBtn = item.querySelector('.search__more-btn');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof window.openSongContextMenu === 'function') {
                    window.openSongContextMenu(moreBtn, songData);
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

// Global Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.classList.contains('search-input')) {
        e.preventDefault();
        triggerSearch(e.target.value.trim());
    }
});

document.addEventListener('click', (e) => {
    const searchIcon = e.target.closest('.search-icon, .fa-magnifying-glass, .search-btn');
    if (searchIcon) {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            triggerSearch(searchInput.value.trim());
        }
    }

    const navItem = e.target.closest('.sidebar-nav-item, .nav-item, a, button');
    if (navItem && navItem.textContent && navItem.textContent.includes('Tìm Kiếm')) {
        setTimeout(restoreSearchState, 50);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('search-results-list')) {
        restoreSearchState();
    }
});

document.addEventListener('spa:pageLoaded', (e) => {
    if (e.detail?.page === 'search') {
        restoreSearchState();
    }
});