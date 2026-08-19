import { getAudioStreamUrl } from './api.js';
import { toggleLikeSong, isSongLiked } from './favorite.js';

const QUEUE_STORAGE_KEY = 'ou_play_queue';
const QUEUE_INDEX_KEY = 'ou_queue_current_index';

const audio = new Audio();
let playQueue = [];
let currentQueueIndex = -1;

// Lưu trạng thái Queue vào localStorage
function saveQueueToStorage() {
    try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(playQueue));
        localStorage.setItem(QUEUE_INDEX_KEY, currentQueueIndex.toString());
    } catch (e) {
        console.warn('Không thể lưu queue vào localStorage:', e);
    }
}

// Khôi phục trạng thái Queue từ localStorage
function restoreQueueFromStorage() {
    try {
        const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
        const savedIndex = localStorage.getItem(QUEUE_INDEX_KEY);

        if (savedQueue) {
            playQueue = JSON.parse(savedQueue) || [];
        }
        if (savedIndex !== null && !isNaN(parseInt(savedIndex, 10))) {
            currentQueueIndex = parseInt(savedIndex, 10);
        }
    } catch (e) {
        console.warn('Không thể khôi phục queue từ localStorage:', e);
        playQueue = [];
        currentQueueIndex = -1;
    }
}

export function initPlayer() {
    const playBtn = document.querySelector('.play-btn');
    const playIcon = playBtn?.querySelector('i');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const currTimeEl = document.querySelector('.progress-container .time-text.text-right') || document.querySelector('.progress-container .text-right');
    const durTimeEl = document.querySelector('.progress-container .time-text.text-left') || document.querySelector('.progress-container .text-left');
    const volumeBar = document.querySelector('.volume-bar');
    const volumeFill = document.querySelector('.volume-fill');
    const prevBtn = document.querySelector('.btn-prev') || document.querySelector('.fa-backward-step')?.closest('button');
    const nextBtn = document.querySelector('.btn-next') || document.querySelector('.fa-forward-step')?.closest('button');

    const queueBtn = document.querySelector('.player-right .fa-list-ul')?.closest('button') || document.querySelector('.player-right .control-btn');
    const queueDrawer = document.getElementById('queue-drawer');
    const closeQueueBtn = document.getElementById('btn-close-queue');

    // 1. Play / Pause
    if (playBtn) {
        playBtn.onclick = () => {
            if (!audio.src) return;
            audio.paused ? audio.play() : audio.pause();
        };
    }

    audio.onplay = () => {
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
    };

    audio.onpause = () => {
        if (playIcon) playIcon.className = 'fa-solid fa-play';
    };

    // 2. Cập nhật thời gian & thanh tiến độ
    audio.ontimeupdate = () => {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (currTimeEl) currTimeEl.textContent = formatTime(audio.currentTime);
    };

    audio.onloadedmetadata = () => {
        if (durTimeEl) durTimeEl.textContent = formatTime(audio.duration);
    };

    // 3. Tua nhạc
    if (progressBar) {
        progressBar.onclick = (e) => {
            if (!audio.duration) return;
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pos * audio.duration;
        };
    }

    // 4. Âm lượng
    if (volumeBar) {
        let isDraggingVolume = false;

        const updateVolume = (e) => {
            const rect = volumeBar.getBoundingClientRect();
            let pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.volume = pos;
            if (volumeFill) volumeFill.style.width = `${pos * 100}%`;

            const volumeBtn = document.querySelector('.player-right .fa-volume-high, .player-right .fa-volume-low, .player-right .fa-volume-xmark');
            if (volumeBtn) {
                if (pos === 0) volumeBtn.className = 'fa-solid fa-volume-xmark';
                else if (pos < 0.5) volumeBtn.className = 'fa-solid fa-volume-low';
                else volumeBtn.className = 'fa-solid fa-volume-high';
            }
        };

        volumeBar.addEventListener('mousedown', (e) => {
            isDraggingVolume = true;
            updateVolume(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDraggingVolume) {
                e.preventDefault();
                updateVolume(e);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingVolume) isDraggingVolume = false;
        });
    }

    // 5. Nút Next / Prev bài hát
    if (nextBtn) nextBtn.onclick = () => playNextSong();
    if (prevBtn) prevBtn.onclick = () => playPrevSong();
    audio.onended = () => playNextSong();

    // 6. Bật / Tắt Danh Sách Phát (Queue Drawer)
    if (queueBtn && queueDrawer) {
        queueBtn.onclick = (e) => {
            e.stopPropagation();
            queueDrawer.classList.toggle('hidden');
            renderQueueUI();
        };
    }

    if (closeQueueBtn && queueDrawer) {
        closeQueueBtn.onclick = (e) => {
            e.stopPropagation();
            queueDrawer.classList.add('hidden');
        };
    }

    if (queueDrawer) {
        queueDrawer.onclick = (e) => {
            e.stopPropagation();
        };
    }

    // Đăng ký các hàm ra global
    window.playSong = playSong;
    window.addToQueue = addToQueue;
    window.setPlayQueue = setPlayQueue;

    // Khôi phục lại Queue từ localStorage khi nạp trang
    restoreQueueFromStorage();
    if (playQueue.length > 0 && currentQueueIndex !== -1 && playQueue[currentQueueIndex]) {
        loadSongInfoOnly(playQueue[currentQueueIndex]);
        renderQueueUI();
    }
}

// Hàm chỉ nạp thông tin giao diện (tên, ca sĩ, cover) khi reload
function loadSongInfoOnly(song) {
    if (!song) return;

    const titleEl = document.querySelector('.song-title');
    const artistEl = document.querySelector('.song-subtitle');
    const thumbContainer = document.querySelector('.album-art-placeholder');

    if (titleEl) titleEl.textContent = song.title || song.name || 'Unknown Title';
    if (artistEl) artistEl.textContent = song.artist || song.singer || (Array.isArray(song.artists) ? song.artists.map(a => a.name || a).join(', ') : 'Unknown Artist');

    const cover = song.thumbnail || song.coverUrl || song.image || './assets/images/default.jpg';
    if (thumbContainer) {
        thumbContainer.innerHTML = `<img src="${cover}" alt="cover" style="width:100%;height:100%;object-fit:cover;border-radius:0.375rem;" onerror="this.src='./assets/images/default.jpg'">`;
    }
}

// Xử lý phát bài mới: Đưa bài mới vào ĐANG PHÁT, đẩy bài cũ xuống TIẾP THEO
export async function playSong(song) {
    if (!song) return;

    const songId = song.id || song.sourceId || song._id || song.videoId;

    if (playQueue.length === 0 || currentQueueIndex === -1) {
        playQueue = [{ ...song }];
        currentQueueIndex = 0;
    } else {
        playQueue = playQueue.filter(item => (item.id || item.sourceId || item._id || item.videoId) !== songId);
        playQueue.splice(currentQueueIndex, 0, { ...song });
    }

    saveQueueToStorage();
    renderQueueUI();
    await loadAndPlayAudio(playQueue[currentQueueIndex]);
}

// Thêm bài hát vào danh sách chờ
export function addToQueue(song) {
    if (!song) return;

    playQueue.push({ ...song });

    if (currentQueueIndex === -1) {
        currentQueueIndex = 0;
        loadAndPlayAudio(playQueue[0]);
    }

    saveQueueToStorage();
    renderQueueUI();
}

// Đặt toàn bộ danh sách (Dành cho Playlist/Album)
export function setPlayQueue(songList, startIndex = 0) {
    if (!Array.isArray(songList) || songList.length === 0) return;

    playQueue = songList.map(song => ({ ...song }));
    currentQueueIndex = Math.max(0, Math.min(startIndex, playQueue.length - 1));

    saveQueueToStorage();
    if (playQueue[currentQueueIndex]) {
        loadAndPlayAudio(playQueue[currentQueueIndex]);
    }
    renderQueueUI();
}

async function loadAndPlayAudio(song) {
    const titleEl = document.querySelector('.song-title');
    const artistEl = document.querySelector('.song-subtitle');
    const thumbContainer = document.querySelector('.album-art-placeholder');

    let rawId = song.id || song.sourceId || song._id || song.videoId || '';
    let videoId = rawId.includes(':') ? rawId.split(':').pop() : rawId;

    if (titleEl) titleEl.textContent = song.title || song.name || 'Unknown Title';
    if (artistEl) artistEl.textContent = song.artist || song.singer || (Array.isArray(song.artists) ? song.artists.map(a => a.name || a).join(', ') : 'Unknown Artist');

    const cover = song.thumbnail || song.coverUrl || song.image || './assets/images/default.jpg';
    if (thumbContainer) {
        thumbContainer.innerHTML = `<img src="${cover}" alt="cover" style="width:100%;height:100%;object-fit:cover;border-radius:0.375rem;" onerror="this.src='./assets/images/default.jpg'">`;
    }

    try {
        let streamUrl = null;
        try {
            const data = await getAudioStreamUrl(videoId);
            streamUrl = data?.url || data?.streamUrl || data?.audioUrl || (typeof data === 'string' ? data : null);
        } catch (apiErr) {
            console.warn('Không lấy được stream trực tiếp, chuyển qua proxy:', apiErr);
        }

        if (!streamUrl) {
            streamUrl = `https://myt-lh.konnn04.dev/api/v1/stream/${videoId}`;
        }

        audio.src = streamUrl;
        await audio.play();
    } catch (err) {
        console.error('Lỗi nạp audio:', err);
    }
}

function playNextSong() {
    if (currentQueueIndex + 1 < playQueue.length) {
        currentQueueIndex++;
        saveQueueToStorage();
        loadAndPlayAudio(playQueue[currentQueueIndex]);
        renderQueueUI();
    }
}

function playPrevSong() {
    if (currentQueueIndex > 0) {
        currentQueueIndex--;
        saveQueueToStorage();
        loadAndPlayAudio(playQueue[currentQueueIndex]);
        renderQueueUI();
    }
}

// Render dữ liệu ra Queue Drawer
export function renderQueueUI() {
    const currentContainer = document.getElementById('queue-current-song');
    const nextListContainer = document.getElementById('queue-next-list');
    if (!currentContainer || !nextListContainer) return;

    const currentSong = playQueue[currentQueueIndex];

    if (currentSong) {
        const currentCover = currentSong.thumbnail || currentSong.coverUrl || currentSong.image || './assets/images/default.jpg';
        const currentArtist = currentSong.artist || currentSong.singer || (Array.isArray(currentSong.artists) ? currentSong.artists.map(a => a.name || a).join(', ') : 'Unknown Artist');
        const songId = currentSong.id || currentSong.sourceId || currentSong._id || currentSong.videoId;
        const liked = typeof isSongLiked === 'function' ? isSongLiked(songId) : false;

        currentContainer.innerHTML = `
            <div class="queue-item">
                <div class="queue-item-left">
                    <img src="${currentCover}" class="queue-thumb" onerror="this.src='./assets/images/default.jpg'">
                    <div class="queue-info">
                        <span class="queue-song-title" style="color: var(--accent-solid, #a855f7);">${currentSong.title || currentSong.name}</span>
                        <span class="queue-song-artist">${currentArtist}</span>
                    </div>
                </div>
                <button class="favorite-btn${liked ? ' active' : ''}" title="${liked ? 'Bỏ yêu thích' : 'Yêu thích'}">
                    <i class="${liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                </button>
            </div>
        `;

        const favBtn = currentContainer.querySelector('.favorite-btn');
        if (favBtn) {
            favBtn.onclick = (e) => {
                e.stopPropagation();
                if (typeof toggleLikeSong === 'function') {
                    const isLikedNow = toggleLikeSong(currentSong);
                    favBtn.classList.toggle('active', isLikedNow);
                    favBtn.title = isLikedNow ? 'Bỏ yêu thích' : 'Yêu thích';

                    const heartIcon = favBtn.querySelector('i');
                    if (heartIcon) {
                        heartIcon.className = isLikedNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                    }
                }
            };
        }
    } else {
        currentContainer.innerHTML = '<span class="queue-empty-text">Chưa phát bài nào</span>';
    }

    // Render danh sách tiếp theo
    const nextSongs = playQueue.slice(currentQueueIndex + 1);
    if (nextSongs.length === 0) {
        nextListContainer.innerHTML = '<span class="queue-empty-text">Danh sách chờ trống</span>';
        return;
    }

    nextListContainer.innerHTML = nextSongs.map((song, idx) => {
        const actualIndex = currentQueueIndex + 1 + idx;
        const cover = song.thumbnail || song.coverUrl || song.image || './assets/images/default.jpg';
        const artist = song.artist || song.singer || (Array.isArray(song.artists) ? song.artists.map(a => a.name || a).join(', ') : 'Unknown Artist');

        return `
            <div class="queue-item" data-queue-idx="${actualIndex}">
                <div class="queue-item-left">
                    <img src="${cover}" class="queue-thumb" onerror="this.src='./assets/images/default.jpg'">
                    <div class="queue-info">
                        <span class="queue-song-title">${song.title || song.name}</span>
                        <span class="queue-song-artist">${artist}</span>
                    </div>
                </div>
                <button class="queue-btn-remove" title="Xóa khỏi hàng đợi"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
    }).join('');

    // Bắt sự kiện chọn hoặc xóa bài trong hàng đợi
    nextListContainer.querySelectorAll('.queue-item').forEach(el => {
        el.onclick = (e) => {
            if (e.target.closest('.queue-btn-remove')) return;
            const targetIdx = parseInt(el.getAttribute('data-queue-idx'), 10);
            currentQueueIndex = targetIdx;
            saveQueueToStorage();
            loadAndPlayAudio(playQueue[currentQueueIndex]);
            renderQueueUI();
        };

        const removeBtn = el.querySelector('.queue-btn-remove');
        if (removeBtn) {
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                const targetIdx = parseInt(el.getAttribute('data-queue-idx'), 10);
                playQueue.splice(targetIdx, 1);
                saveQueueToStorage();
                renderQueueUI();
            };
        }
    });
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}