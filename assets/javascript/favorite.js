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
    return songs.some(song => (song.id || song.sourceId || song._id) === songId);
}

export function toggleLikeSong(song) {
    let songs = getLikedSongs();
    const songId = song.id || song.sourceId || song._id;
    const index = songs.findIndex(s => (s.id || s.sourceId || s._id) === songId);

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

    if (!listContainer) return;

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
                        // Nạp toàn bộ danh sách bài hát yêu thích vào Queue và phát từ bài 0
                        window.setPlayQueue(currentLikedSongs, 0);
                    } else if (typeof window.playSong === 'function') {
                        window.playSong(currentLikedSongs[0]);
                    }
                }
            };
        }
    }

    if (songs.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        listContainer.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    listContainer.innerHTML = songs.map((song, index) => {
        const duration = formatDuration(song.duration);
        const songId = song.id || song.sourceId;

        return `
            <div class="favorite__song-item" data-id="${songId}" data-index="${index}">
                <div class="favorite__song-left">
                    <div class="favorite__thumb-wrapper">
                        <img src="${song.thumbnail}" alt="${song.title}" class="favorite__song-thumb" onerror="this.src='./assets/images/default.jpg'">
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
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const items = listContainer.querySelectorAll('.favorite__song-item');
    items.forEach(item => {
        const index = parseInt(item.getAttribute('data-index'), 10);
        const songData = songs[index];

        item.addEventListener('click', (e) => {
            if (e.target.closest('.fav-btn-remove') || e.target.closest('.favorite-btn')) return;
            if (window.playSong && songData) {
                window.playSong(songData);
            }
        });

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
    });
}

function formatDuration(duration) {
    if (!duration || isNaN(duration)) return '--:--';
    let totalSeconds = duration > 10000 ? Math.floor(duration / 1000) : Math.floor(duration);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.sidebar-nav-item, .nav-item, a, button');
    if (navItem && navItem.textContent.includes('Yêu Thích')) {
        setTimeout(() => {
            renderFavoritePage();
        }, 150);
    }
});