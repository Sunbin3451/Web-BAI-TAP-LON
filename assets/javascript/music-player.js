import { getPlayableAudioUrl } from './api.js';
import { toggleLikeSong, isSongLiked } from './favorite.js';

const QUEUE_STORAGE_KEY = 'ou_play_queue';
const QUEUE_INDEX_KEY = 'ou_queue_current_index';

const audio = new Audio();
let playQueue = [];
let currentQueueIndex = -1;
let isRepeat = false; // Trạng thái lặp lại bài hát

// Hiển thị thông báo Toast
function showNotification(message) {
    const existing = document.getElementById('music-toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'music-toast-notification';
    toast.textContent = message;
    toast.className = 'fixed bottom-[95px] left-1/2 -translate-x-1/2 bg-red-600/95 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl z-[9999] backdrop-blur-sm pointer-events-none transition-all duration-300 ease-out opacity-100 translate-y-0';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('opacity-100', 'opacity-0');
        toast.classList.replace('translate-y-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

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

    // Nút Repeat / Lặp lại
    const repeatBtn = document.querySelector('.btn-repeat') || document.querySelector('.fa-rotate-right, .fa-repeat')?.closest('button');

    const queueBtn = document.querySelector('.player-right .fa-list-ul')?.closest('button') || document.querySelector('.player-right .control-btn');
    const queueDrawer = document.getElementById('queue-drawer');
    const closeQueueBtn = document.getElementById('btn-close-queue');

    // 1. Play / Pause
    if (playBtn) {
        playBtn.onclick = async () => {
            if (audio.src) {
                audio.paused ? audio.play().catch(() => { }) : audio.pause();
                return;
            }

            if (playQueue.length > 0 && currentQueueIndex !== -1 && playQueue[currentQueueIndex]) {
                await loadAndPlayAudio(playQueue[currentQueueIndex]);
            }
        };
    }

    audio.onplay = () => {
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
    };

    audio.onpause = () => {
        if (playIcon) playIcon.className = 'fa-solid fa-play';
    };

    // Bắt lỗi âm thanh khi server stream từ chối kết nối
    audio.onerror = () => {
        const err = audio.error;
        console.error('Lỗi phát âm thanh:', err ? err.code : 'unknown', err);

        let errorMsg = '⚠️ Máy chủ phát nhạc đang bảo trì hoặc link bài hát đã hết hạn.';
        if (err) {
            if (err.code === 2) errorMsg = '⚠️ Lỗi mạng: Không thể kết nối đến máy chủ stream.';
            if (err.code === 4) errorMsg = '⚠️ Nguồn nhạc không khả dụng hoặc bị từ chối truy cập (403/404).';
        }
        showNotification(errorMsg);
        if (playIcon) playIcon.className = 'fa-solid fa-play';
    };

    // 2. Cập nhật thời gian & thanh tiến độ
    let isSeeking = false;

    audio.ontimeupdate = () => {
        if (!audio.duration || isSeeking) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (currTimeEl) currTimeEl.textContent = formatTime(audio.currentTime);
    };

    audio.onloadedmetadata = () => {
        if (durTimeEl) durTimeEl.textContent = formatTime(audio.duration);
    };

    // 3. Tua nhạc
    if (progressBar) {
        let seekPos = 0;
        let wasPausedBeforeSeek = false;

        const updateSeekUI = (e) => {
            if (!audio.duration || isNaN(audio.duration)) return;
            const rect = progressBar.getBoundingClientRect();
            seekPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

            if (progressFill) progressFill.style.width = `${seekPos * 100}%`;
            if (currTimeEl) currTimeEl.textContent = formatTime(seekPos * audio.duration);
        };

        progressBar.addEventListener('mousedown', (e) => {
            if (!audio.duration || isNaN(audio.duration)) return;
            isSeeking = true;
            wasPausedBeforeSeek = audio.paused;
            updateSeekUI(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isSeeking) {
                e.preventDefault();
                updateSeekUI(e);
            }
        });

        window.addEventListener('mouseup', () => {
            if (!isSeeking) return;
            isSeeking = false;

            if (audio.duration && !isNaN(audio.duration)) {
                audio.currentTime = seekPos * audio.duration;

                if (!wasPausedBeforeSeek) {
                    audio.play().catch(() => { });
                }
            }
        });
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

    // 6. Xử lý khi bài hát kết thúc
    audio.onended = () => {
        if (isRepeat) {
            audio.currentTime = 0;
            audio.play().catch(err => console.error('Lỗi lặp lại bài hát:', err));
        } else {
            playNextSong();
        }
    };

    // 7. Bật / Tắt Repeat
    if (repeatBtn) {
        repeatBtn.onclick = (e) => {
            e.stopPropagation();
            isRepeat = !isRepeat;
            repeatBtn.classList.toggle('active', isRepeat);
            repeatBtn.title = isRepeat ? 'Tắt lặp lại' : 'Lặp lại';

            if (isRepeat) {
                repeatBtn.style.color = 'var(--text-primary)';
            } else {
                repeatBtn.style.color = '';
            }
        };
    }

    // 8. Bật / Tắt Queue Drawer
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

    // Đăng ký toàn cục
    window.playSong = playSong;
    window.addToQueue = addToQueue;
    window.setPlayQueue = setPlayQueue;

    // Khôi phục Queue
    restoreQueueFromStorage();
    if (playQueue.length > 0 && currentQueueIndex !== -1 && playQueue[currentQueueIndex]) {
        loadSongInfoOnly(playQueue[currentQueueIndex]);
        renderQueueUI();
    }
}

// Cập nhật thông tin giao diện phát nhạc
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

// Nạp stream URL trực tiếp cho Audio element
async function loadAndPlayAudio(song) {
    if (!song) return;
    loadSongInfoOnly(song);

    try {
        const streamUrl = await getPlayableAudioUrl(song);

        if (!streamUrl) {
            const songName = song.title || song.name || 'Bài hát này';
            showNotification(`⚠️ "${songName}" không tìm thấy nguồn phát hoặc bị hạn chế bản quyền.`);

            audio.pause();
            audio.src = '';

            const getSongId = (item) => item?.id || item?.sourceId || item?._id || item?.videoId || item?.title;
            const targetId = getSongId(song);
            playQueue = playQueue.filter(item => getSongId(item) !== targetId);

            saveQueueToStorage();

            if (playQueue.length > 0) {
                currentQueueIndex = Math.min(currentQueueIndex, playQueue.length - 1);
                renderQueueUI();
                await loadAndPlayAudio(playQueue[currentQueueIndex]);
            } else {
                currentQueueIndex = -1;
                renderQueueUI();

                const titleEl = document.querySelector('.song-title');
                const artistEl = document.querySelector('.song-subtitle');
                const thumbContainer = document.querySelector('.album-art-placeholder');
                if (titleEl) titleEl.textContent = 'Chưa chọn bài hát';
                if (artistEl) artistEl.textContent = '';
                if (thumbContainer) thumbContainer.innerHTML = '';
            }
            return;
        }

        audio.pause();
        audio.src = streamUrl;
        audio.load();

        await audio.play().catch(err => {
            if (err.name !== 'AbortError') {
                console.error('Lỗi khi phát audio:', err);
            }
        });
    } catch (err) {
        console.error('Lỗi khi nạp nhạc:', err);
    }
}

// Phát bài mới
export async function playSong(song) {
    if (!song) return;

    const getSongId = (item) => item?.id || item?.sourceId || item?._id || item?.videoId || item?.title;
    const targetId = getSongId(song);

    if (playQueue.length === 0) {
        playQueue = [{ ...song }];
        currentQueueIndex = 0;
    } else {
        playQueue = playQueue.filter(item => getSongId(item) !== targetId);
        playQueue.unshift({ ...song });
        currentQueueIndex = 0;
    }

    saveQueueToStorage();
    renderQueueUI();
    await loadAndPlayAudio(playQueue[0]);
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

// Đặt toàn bộ danh sách phát
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
                <div class="flex items-center gap-2">
                    <button class="favorite-btn${liked ? ' active' : ''}" title="${liked ? 'Bỏ yêu thích' : 'Yêu thích'}">
                        <i class="${liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                    </button>
                    <button class="queue-btn-remove" title="Xóa khỏi hàng đợi">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;

        // 1. Sự kiện nút tim yêu thích
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

        // 2. Sự kiện nút Xóa bài đang phát
        const removeCurrentBtn = currentContainer.querySelector('.queue-btn-remove');
        if (removeCurrentBtn) {
            removeCurrentBtn.onclick = (e) => {
                e.stopPropagation();
                playQueue.splice(currentQueueIndex, 1);
                saveQueueToStorage();

                if (playQueue.length > 0) {
                    currentQueueIndex = Math.min(currentQueueIndex, playQueue.length - 1);
                    renderQueueUI();
                    loadAndPlayAudio(playQueue[currentQueueIndex]);
                } else {
                    currentQueueIndex = -1;
                    audio.pause();
                    audio.src = '';
                    renderQueueUI();

                    const titleEl = document.querySelector('.song-title');
                    const artistEl = document.querySelector('.song-subtitle');
                    const thumbContainer = document.querySelector('.album-art-placeholder');
                    if (titleEl) titleEl.textContent = 'Chưa chọn bài hát';
                    if (artistEl) artistEl.textContent = '';
                    if (thumbContainer) thumbContainer.innerHTML = '';
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