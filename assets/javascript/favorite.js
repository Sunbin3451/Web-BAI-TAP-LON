const LIKED_STORAGE_KEY = 'ou_liked';

export function getLikedSongs() {
    try {
        const stored = localStorage.getItem(LIKED_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Lỗi đọc localStorage:', e);
        return [];
    }
}

export function isSongLiked(songId) {
    const songs = getLikedSongs();
    return songs.some(song => (song.id || song.sourceId || song._id || song.videoId) === songId);
}

export function toggleLikeSong(song) {
    if (!song) return false;
    let songs = getLikedSongs();
    const songId = song.id || song.sourceId || song._id || song.videoId;
    const index = songs.findIndex(s => (s.id || s.sourceId || s._id || song.videoId) === songId);

    if (index > -1) {
        songs.splice(index, 1);
        localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(songs));
        return false;
    } else {
        const normalizedSong = {
            id: songId,
            source: song.source || 'youtube',
            sourceId: song.sourceId || song.id,
            title: song.title || song.name || 'Unknown Title',
            artist: song.artist || song.singer || (Array.isArray(song.artists) ? song.artists.map(a => a.name || a).join(', ') : 'Unknown Artist'),
            thumbnail: song.thumbnail || song.coverUrl || song.image || './assets/images/default.jpg',
            duration: song.duration || 0
        };
        songs.unshift(normalizedSong);
        localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(songs));
        return true;
    }
}

export function renderFavoritePage() {
    const listContainer = document.getElementById('fav-songs-list');
    const emptyState = document.getElementById('fav-empty-state');
    const countEl = document.getElementById('fav-count');
    const playAllBtn = document.getElementById('btn-play-all-fav');

    if (!listContainer && !emptyState) return;

    const songs = getLikedSongs();

    if (countEl) {
        countEl.textContent = `${songs.length} bài hát`;
    }

    // Xử lý nút Phát tất cả
    if (playAllBtn) {
        if (songs.length === 0) {
            playAllBtn.classList.add('hidden');
        } else {
            playAllBtn.classList.remove('hidden');
            playAllBtn.onclick = () => {
                const currentLikedSongs = getLikedSongs();
                if (currentLikedSongs.length > 0) {
                    if (typeof window.setPlayQueue === 'function') {
                        window.setPlayQueue(currentLikedSongs, 0);
                    } else if (typeof window.playSong === 'function') {
                        window.playSong(currentLikedSongs[0]);
                    }
                }
            };
        }
    }

    // Xử lý trạng thái khi danh sách rỗng
    if (songs.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (listContainer) {
            listContainer.innerHTML = '';
            listContainer.classList.add('hidden');
        }
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (listContainer) listContainer.classList.remove('hidden');

    listContainer.innerHTML = songs.map((song, index) => {
        const duration = formatDuration(song.duration);
        const songId = song.id || song.sourceId || song._id;

        return `
            <div class="favorite__song-item" data-id="${songId}" data-index="${index}">
                <div class="favorite__song-left">
                    <div class="favorite__thumb-wrapper">
                        <img src="${song.thumbnail || './assets/images/default.jpg'}" alt="${song.title}" class="favorite__song-thumb" onerror="this.src='./assets/images/default.jpg'">
                        <button class="favorite__play-icon" title="Phát bài hát"><i class="fa-solid fa-play"></i></button>
                    </div>
                    <div class="favorite__song-info">
                        <span class="favorite__song-title">${song.title}</span>
                        <span class="favorite__song-artist">${song.artist}</span>
                    </div>
                </div>
                <div class="favorite__song-right">
                    <span class="favorite__song-duration">${duration}</span>
                    <button class="favorite-btn active fav-btn-remove" title="Bỏ yêu thích">
                        <i class="fa-solid fa-heart pointer-events-none"></i>
                    </button>
                    <button class="btn-song-more p-2 text-zinc-400 hover:text-white transition-colors" title="Tuỳ chọn">
                        <i class="fa-solid fa-ellipsis-vertical pointer-events-none"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const items = listContainer.querySelectorAll('.favorite__song-item');
    items.forEach(item => {
        const index = parseInt(item.getAttribute('data-index'), 10);
        const songData = songs[index];

        // Click vào hàng để phát nhạc
        item.addEventListener('click', (e) => {
            if (e.target.closest('.fav-btn-remove') || e.target.closest('.favorite-btn') || e.target.closest('.btn-song-more')) return;
            if (typeof window.playSong === 'function' && songData) {
                window.playSong(songData);
            }
        });

        // Click bỏ yêu thích (Xóa mượt khỏi UI)
        const removeBtn = item.querySelector('.fav-btn-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLikeSong(songData);

                item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateX(20px)';

                setTimeout(() => {
                    item.remove();

                    const remainingSongs = getLikedSongs();
                    if (countEl) countEl.textContent = `${remainingSongs.length} bài hát`;

                    if (remainingSongs.length === 0) {
                        if (emptyState) emptyState.classList.remove('hidden');
                        if (playAllBtn) playAllBtn.classList.add('hidden');
                    }
                }, 250);
            });
        }

        // Click nút 3 chấm mở Context Menu
        const moreBtn = item.querySelector('.btn-song-more');
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

// LẮNG NGHE CHUYỂN TRANG & RELOAD
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('fav-songs-list') || document.getElementById('fav-empty-state')) {
        renderFavoritePage();
    }
});

document.addEventListener('spa:pageLoaded', (e) => {
    if (e.detail?.page === 'favorite' || document.getElementById('fav-songs-list') || document.getElementById('fav-empty-state')) {
        renderFavoritePage();
    }
});

document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.sidebar-nav-item, .nav-item, [data-page="favorite"], a, button');
    if (navItem && navItem.textContent && navItem.textContent.includes('Yêu Thích')) {
        setTimeout(renderFavoritePage, 60);
    }
});