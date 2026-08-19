// Hàm chính xử lý tìm kiếm & điều hướng sang trang kết quả
async function triggerSearch(queryText) {
    const searchInput = document.querySelector('.search-input');
    const query = queryText !== undefined ? queryText : (searchInput ? searchInput.value.trim() : '');

    // 1. Tự động chuyển sang tab Tìm Kiếm nếu người dùng đang ở trang khác
    let resultsList = document.getElementById('search-results-list');
    if (!resultsList) {
        const searchNavBtn = Array.from(document.querySelectorAll('.sidebar-nav-item, .nav-item, a, button')).find(
            el => el.textContent && el.textContent.includes('Tìm Kiếm')
        );

        if (searchNavBtn) {
            searchNavBtn.click();
            // Đợi DOM chèn search-content.html vào placeholder
            await new Promise(resolve => setTimeout(resolve, 150));
        }
    }

    const initialState = document.getElementById('search-initial-state');
    const loadingState = document.getElementById('search-loading-state');
    const notfoundState = document.getElementById('search-notfound-state');
    resultsList = document.getElementById('search-results-list');

    // Trường hợp ô tìm kiếm trống -> reset về trạng thái ban đầu
    if (!query) {
        if (initialState) initialState.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (notfoundState) notfoundState.classList.add('hidden');
        if (resultsList) {
            resultsList.innerHTML = '';
            resultsList.classList.add('hidden');
        }
        return;
    }

    // Hiển thị Skeleton Loading khi đang gọi API
    if (initialState) initialState.classList.add('hidden');
    if (notfoundState) notfoundState.classList.add('hidden');
    if (resultsList) resultsList.classList.add('hidden');
    if (loadingState) loadingState.classList.remove('hidden');

    try {
        // Tái sử dụng trực tiếp hàm từ api.js
        let data = null;
        if (typeof window.getMusicByQuery === 'function') {
            data = await window.getMusicByQuery(query);
        } else {
            console.error('Không tìm thấy hàm getMusicByQuery trên window. Kiểm tra lại thứ tự nạp api.js!');
        }

        if (loadingState) loadingState.classList.add('hidden');

        const songs = Array.isArray(data) ? data : (data?.items || data?.tracks || []);

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

// Hàm render HTML danh sách kết quả bài hát
function renderSongItems(songs) {
    return songs.map((song, index) => {
        const title = song.title || song.name || 'Unknown Title';
        const artist = song.artist || song.singer || (Array.isArray(song.artists) ? song.artists.map(a => a.name || a).join(', ') : 'Unknown Artist');
        const cover = song.thumbnail || song.coverUrl || song.image || './assets/images/default.jpg';
        const duration = formatDuration(song.duration);
        const songId = song.id || song._id || song.sourceId || index;

        // Đọc trạng thái yêu thích từ favorite.js
        const liked = typeof window.isSongLiked === 'function' ? window.isSongLiked(songId) : false;
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

// Hàm gắn sự kiện click phát nhạc & thả tim
function attachSongItemEvents(container, songs) {
    const songItems = container.querySelectorAll('.search__song-item');

    songItems.forEach(item => {
        const index = item.getAttribute('data-index');
        const songData = songs[index];

        // Click phát bài hát
        item.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn') || e.target.closest('.search__more-btn')) {
                return;
            }
            if (typeof window.playSong === 'function' && songData) {
                window.playSong(songData);
            }
        });

        // Click nút yêu thích
        const favBtn = item.querySelector('.favorite-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                let isLikedNow = false;
                if (typeof window.toggleLikeSong === 'function') {
                    isLikedNow = window.toggleLikeSong(songData);
                } else {
                    isLikedNow = favBtn.classList.toggle('active');
                }

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

// Đưa hàm lên window
window.triggerSearch = triggerSearch;

// GLOBAL EVENT LISTENERS
// 1. Phím Enter trên ô tìm kiếm
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.classList.contains('search-input')) {
        e.preventDefault();
        triggerSearch(e.target.value.trim());
    }
});

// 2. Click vào icon kính lúp
document.addEventListener('click', (e) => {
    const isSearchIcon = e.target.closest('.search-icon, .fa-magnifying-glass, .search-btn');
    if (isSearchIcon) {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            triggerSearch(searchInput.value.trim());
        }
    }
});