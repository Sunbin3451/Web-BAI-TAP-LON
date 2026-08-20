const PLAYLISTS_STORAGE_KEY = 'ou_custom_playlists';
const LIKED_STORAGE_KEY = 'ou_liked';
let currentActionSong = null;
let currentViewingPlaylistId = null;

// Kiểm tra trạng thái thích bài hát trực tiếp từ LocalStorage
function checkIsSongLiked(songId) {
    try {
        const liked = JSON.parse(localStorage.getItem(LIKED_STORAGE_KEY)) || [];
        return liked.some(s => (s.id || s.sourceId) === songId);
    } catch {
        return false;
    }
}

// Đọc danh sách playlist
export function getCustomPlaylists() {
    try {
        const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Lỗi đọc playlists:', e);
        return [];
    }
}

// Lưu danh sách playlist
function saveCustomPlaylists(playlists) {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
}

// ================= 1. RENDER GRID VIEW (Danh sách Playlist) =================
export function renderGridView() {
    const gridView = document.getElementById('playlist-grid-view');
    const detailView = document.getElementById('playlist-detail-view');
    const cardsContainer = document.getElementById('playlist-cards-container');

    if (!cardsContainer) return;

    if (gridView) gridView.classList.remove('hidden');
    if (detailView) detailView.classList.add('hidden');
    currentViewingPlaylistId = null;

    const playlists = getCustomPlaylists();

    // Xóa các card playlist cũ, giữ lại nút tạo mới (#btn-open-create-modal)
    const oldCards = cardsContainer.querySelectorAll('.playlist__card-item');
    oldCards.forEach(c => c.remove());

    playlists.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'playlist__card-item';
        card.setAttribute('data-playlist-id', pl.id);

        const coverImg = pl.songs && pl.songs[0]?.thumbnail;
        const coverHtml = coverImg
            ? `<img src="${coverImg}" class="playlist__card-thumb" onerror="this.src='./assets/images/default.jpg'">`
            : `<div class="playlist__card-placeholder"><i class="fa-solid fa-list-ul"></i></div>`;

        card.innerHTML = `
            <div>
                ${coverHtml}
            </div>
            <div class="playlist__card-footer">
                <div class="playlist__card-info">
                    <h4 class="playlist__card-title">${pl.name}</h4>
                    <p class="playlist__card-count">${pl.songs ? pl.songs.length : 0} bài</p>
                </div>
                <button class="playlist__card-btn-delete" title="Xóa playlist này" data-id="${pl.id}">
                    <i class="fa-solid fa-trash-can pointer-events-none"></i>
                </button>
            </div>
        `;

        cardsContainer.appendChild(card);
    });
}

// ================= 2. RENDER DETAIL VIEW (Chi tiết 1 Playlist) =================
export function showDetailView(playlistId) {
    const gridView = document.getElementById('playlist-grid-view');
    const detailView = document.getElementById('playlist-detail-view');
    const playlists = getCustomPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;

    currentViewingPlaylistId = playlistId;

    if (gridView) gridView.classList.add('hidden');
    if (detailView) detailView.classList.remove('hidden');

    const titleEl = document.getElementById('detail-playlist-name');
    const countEl = document.getElementById('detail-playlist-count');
    const coverContainer = document.getElementById('detail-playlist-cover');
    const listContainer = document.getElementById('detail-songs-list');
    const emptyState = document.getElementById('detail-empty-songs');
    const playAllBtn = document.getElementById('btn-play-all-playlist');

    if (titleEl) titleEl.textContent = pl.name;
    if (countEl) countEl.textContent = `${pl.songs ? pl.songs.length : 0} bài hát`;

    if (coverContainer) {
        if (pl.songs && pl.songs[0]?.thumbnail) {
            coverContainer.innerHTML = `<img src="${pl.songs[0].thumbnail}" class="w-full h-full object-cover">`;
        } else {
            coverContainer.innerHTML = `<i class="fa-solid fa-list-ul"></i>`;
        }
    }

    if (listContainer) {
        if (!pl.songs || pl.songs.length === 0) {
            listContainer.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        listContainer.innerHTML = pl.songs.map((song, idx) => {
            const songId = song.id || song.sourceId;
            const liked = checkIsSongLiked(songId);
            const artist = song.artist || (Array.isArray(song.artists) ? song.artists.join(', ') : 'Unknown Artist');

            return `
                <div class="playlist__track-row" data-index="${idx}">
                    <div class="playlist__track-left">
                        <div class="playlist__track-thumb-wrapper">
                            <img src="${song.thumbnail || './assets/images/default.jpg'}" class="playlist__track-thumb" onerror="this.src='./assets/images/default.jpg'">
                            <div class="playlist__track-play-btn">
                                <i class="fa-solid fa-play"></i>
                            </div>
                        </div>
                        <div class="playlist__track-info">
                            <h5 class="playlist__track-title">${song.title || song.name}</h5>
                            <p class="playlist__track-artist">${artist}</p>
                        </div>
                    </div>
                    <div class="playlist__track-right">
                        <span class="playlist__track-duration">${song.duration ? Math.floor(song.duration / 60) + ':' + (song.duration % 60 < 10 ? '0' : '') + Math.floor(song.duration % 60) : '--:--'}</span>
                        <button class="playlist__track-fav-btn ${liked ? 'is-active' : ''}" title="Yêu thích">
                            <i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                        <button class="playlist__track-remove-btn text-zinc-500 hover:text-red-400 p-1" title="Xóa khỏi playlist" data-song-index="${idx}">
                            <i class="fa-solid fa-xmark pointer-events-none"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Phát bài hát khi click vào hàng
        listContainer.querySelectorAll('.playlist__track-row').forEach(row => {
            row.onclick = (e) => {
                if (e.target.closest('.playlist__track-fav-btn') || e.target.closest('.playlist__track-remove-btn')) return;
                const idx = parseInt(row.getAttribute('data-index'), 10);
                if (typeof window.playSong === 'function' && pl.songs[idx]) {
                    window.playSong(pl.songs[idx]);
                }
            };
        });

        // Xóa 1 bài hát ra khỏi playlist
        listContainer.querySelectorAll('.playlist__track-remove-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const songIdx = parseInt(btn.getAttribute('data-song-index'), 10);
                pl.songs.splice(songIdx, 1);
                saveCustomPlaylists(playlists);
                showDetailView(playlistId);
            };
        });
    }

    if (playAllBtn) {
        playAllBtn.onclick = () => {
            if (pl.songs && pl.songs.length > 0 && typeof window.setPlayQueue === 'function') {
                window.setPlayQueue(pl.songs, 0);
            }
        };
    }
}

// ================= 3. CONTEXT MENU & THÊM BÀI HÁT =================
export function openSongContextMenu(targetOrEvent, song) {
    currentActionSong = song;

    const menu = document.getElementById('song-context-menu');
    if (!menu) return;

    const btn = targetOrEvent?.nodeType
        ? targetOrEvent
        : (targetOrEvent?.target?.closest('button, .fa-ellipsis-vertical, .fa-ellipsis') || targetOrEvent?.currentTarget);

    if (!btn || typeof btn.getBoundingClientRect !== 'function') return;

    const rect = btn.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left - 140;

    if (left < 10) left = 10;
    if (top + 160 > window.innerHeight) top = rect.top - 150;

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.classList.remove('hidden');
}
window.openSongContextMenu = openSongContextMenu;

export function openAddToPlaylistModal(song) {
    if (!song) return;
    currentActionSong = song;

    const modal = document.getElementById('add-to-playlist-modal');
    const listContainer = document.getElementById('modal-playlist-list');
    const playlists = getCustomPlaylists();

    if (!modal || !listContainer) return;

    if (playlists.length === 0) {
        listContainer.innerHTML = `<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:12px 0;">Chưa có playlist nào.</p>`;
    } else {
        listContainer.innerHTML = playlists.map(pl => `
            <div class="playlist__modal-item" data-pl-id="${pl.id}">
                <i class="fa-solid fa-list-ul"></i>
                <span class="truncate">${pl.name}</span>
            </div>
        `).join('');

        listContainer.querySelectorAll('.playlist__modal-item').forEach(item => {
            item.onclick = () => {
                const plId = item.getAttribute('data-pl-id');
                const success = addSongToPlaylist(plId, currentActionSong);
                if (success) {
                    modal.classList.add('hidden');
                    currentActionSong = null;
                    if (currentViewingPlaylistId === plId) {
                        showDetailView(plId);
                    } else {
                        renderGridView();
                    }
                }
            };
        });
    }

    modal.classList.remove('hidden');
}
window.openAddToPlaylistModal = openAddToPlaylistModal;

export function addSongToPlaylist(playlistId, song) {
    if (!song) return false;
    const playlists = getCustomPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return false;

    if (!pl.songs) pl.songs = [];
    const songId = song.id || song.sourceId;
    const exists = pl.songs.some(s => (s.id || s.sourceId) === songId);

    if (exists) {
        alert(`Bài hát đã có trong playlist "${pl.name}"!`);
        return false;
    }

    pl.songs.push({
        id: songId,
        sourceId: song.sourceId || song.id,
        title: song.title || song.name || 'Unknown Title',
        artist: song.artist || song.singer || (Array.isArray(song.artists) ? song.artists.join(', ') : 'Unknown Artist'),
        thumbnail: song.thumbnail || song.coverUrl || song.image || './assets/images/default.jpg',
        duration: song.duration || 0
    });

    saveCustomPlaylists(playlists);
    
    return true;
}
window.addSongToPlaylist = addSongToPlaylist;

export function initPlaylistPage() {
    renderGridView();
}

// Tải đúng file ./content/playlist-content.html
async function ensureCreateModalExists() {
    let modalCreate = document.getElementById('create-playlist-modal');
    if (modalCreate) return modalCreate;

    try {
        const response = await fetch('./content/playlist-content.html');
        if (response.ok) {
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const extractedModal = doc.getElementById('create-playlist-modal');

            if (extractedModal) {
                document.body.appendChild(extractedModal);
                return extractedModal;
            }
        }
    } catch (err) {
        console.error('Lỗi khi nạp modal từ playlist-content.html:', err);
    }
    return null;
}

// ================= 4. SỰ KIỆN TOÀN CỤC (Event Delegation) =================
document.addEventListener('click', async (e) => {
    const modalAdd = document.getElementById('add-to-playlist-modal');
    const menu = document.getElementById('song-context-menu');

    // 1. Mở modal tạo playlist từ trang Playlist (+ Card)
    if (e.target.closest('#btn-open-create-modal')) {
        currentActionSong = null;
        const modalCreate = await ensureCreateModalExists();
        if (modalCreate) {
            modalCreate.classList.remove('hidden');
            const inputName = document.getElementById('input-playlist-name');
            if (inputName) {
                inputName.value = '';
                inputName.focus();
            }
        }
        return;
    }

    // 2. Bấm nút "+ Tạo playlist mới" bên trong modal Add to Playlist
    if (e.target.closest('#btn-modal-create-pl') || (modalAdd && !modalAdd.classList.contains('hidden') && e.target.closest('button') && e.target.textContent.includes('Tạo playlist mới'))) {
        if (modalAdd) modalAdd.classList.add('hidden');

        const modalCreate = await ensureCreateModalExists();
        if (modalCreate) {
            modalCreate.classList.remove('hidden');
            const inputName = document.getElementById('input-playlist-name');
            if (inputName) {
                inputName.value = '';
                inputName.focus();
            }
        }
        return;
    }

    // 3. Hủy modal tạo
    if (e.target.closest('#btn-cancel-create') || e.target.closest('.playlist__modal-btn-cancel')) {
        const modalCreate = document.getElementById('create-playlist-modal');
        if (modalCreate) modalCreate.classList.add('hidden');
        currentActionSong = null;
        return;
    }

    // 4. Xác nhận tạo playlist mới & Tự động thêm bài hát nếu có
    if (e.target.closest('#btn-confirm-create') || e.target.closest('.playlist__modal-btn-confirm')) {
        const inputName = document.getElementById('input-playlist-name');
        const name = (inputName ? inputName.value.trim() : '') || 'Playlist của tôi';
        const playlists = getCustomPlaylists();

        const newPlaylist = {
            id: 'pl_' + Date.now(),
            name: name,
            createdAt: new Date().toISOString(),
            songs: []
        };

        if (currentActionSong) {
            const songId = currentActionSong.id || currentActionSong.sourceId;
            newPlaylist.songs.push({
                id: songId,
                sourceId: currentActionSong.sourceId || currentActionSong.id,
                title: currentActionSong.title || currentActionSong.name || 'Unknown Title',
                artist: currentActionSong.artist || currentActionSong.singer || (Array.isArray(currentActionSong.artists) ? currentActionSong.artists.join(', ') : 'Unknown Artist'),
                thumbnail: currentActionSong.thumbnail || currentActionSong.coverUrl || currentActionSong.image || './assets/images/default.jpg',
                duration: currentActionSong.duration || 0
            });
            alert(`Đã tạo và thêm vào playlist "${name}"!`);
            currentActionSong = null;
        }

        playlists.unshift(newPlaylist);
        saveCustomPlaylists(playlists);

        const modalCreate = document.getElementById('create-playlist-modal');
        if (modalCreate) modalCreate.classList.add('hidden');
        renderGridView();
        return;
    }

    // 5. Xóa playlist trên Card
    const deleteBtn = e.target.closest('.playlist__card-btn-delete');
    if (deleteBtn) {
        e.stopPropagation();
        const plId = deleteBtn.getAttribute('data-id');
        const playlists = getCustomPlaylists();
        const pl = playlists.find(p => p.id === plId);

        if (confirm(`Bạn có chắc muốn xóa playlist "${pl ? pl.name : ''}" không?`)) {
            const updated = playlists.filter(p => p.id !== plId);
            saveCustomPlaylists(updated);
            renderGridView();
        }
        return;
    }

    // 6. Mở chi tiết playlist khi click vào card
    const cardItem = e.target.closest('.playlist__card-item');
    if (cardItem && !e.target.closest('.playlist__card-btn-delete')) {
        const plId = cardItem.getAttribute('data-playlist-id');
        if (plId) showDetailView(plId);
        return;
    }

    // 7. Nút Quay lại Grid View
    if (e.target.closest('#btn-back-to-playlists')) {
        renderGridView();
        return;
    }

    // 8. Click các mục trong Context Menu
    const ctxItem = e.target.closest('.song-ctx-item');
    if (ctxItem && currentActionSong) {
        const action = ctxItem.getAttribute('data-action');

        if (action === 'play-now' && typeof window.playSong === 'function') {
            window.playSong(currentActionSong);
        } else if (action === 'add-queue' && typeof window.addToQueue === 'function') {
            window.addToQueue(currentActionSong);
        } else if (action === 'add-playlist') {
            openAddToPlaylistModal(currentActionSong);
        }

        if (menu) menu.classList.add('hidden');
        return;
    }

    // 9. Đóng Context Menu khi click ra ngoài
    if (menu && !menu.classList.contains('hidden') && !e.target.closest('#song-context-menu')) {
        menu.classList.add('hidden');
    }

    // 10. Đóng Modal khi click ngoài vùng modal
    if (e.target === modalAdd) {
        modalAdd.classList.add('hidden');
        currentActionSong = null;
    }

    const modalCreate = document.getElementById('create-playlist-modal');
    if (e.target === modalCreate) {
        modalCreate.classList.add('hidden');
        currentActionSong = null;
    }

    // 11. Nhấp chuyển trang Playlist trên Sidebar
    const navItem = e.target.closest('[data-page="playlist"], a, button');
    if (navItem && navItem.textContent.includes('Playlist')) {
        setTimeout(initPlaylistPage, 50);
    }
});

// Nhấn Enter tạo nhanh playlist
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const modal = document.getElementById('create-playlist-modal');
        const inputName = document.getElementById('input-playlist-name');
        if (modal && !modal.classList.contains('hidden') && document.activeElement === inputName) {
            const confirmBtn = document.getElementById('btn-confirm-create') || modal.querySelector('.playlist__modal-btn-confirm');
            if (confirmBtn) confirmBtn.click();
        }
    }
});

// Bắt sự kiện chuyển trang SPA cho Playlist
document.addEventListener('DOMContentLoaded', initPlaylistPage);
document.addEventListener('spa:pageLoaded', (e) => {
    if (e.detail?.page === 'playlist' || document.getElementById('playlist-cards-container')) {
        initPlaylistPage();
    }
});
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('[data-page="playlist"], a, button');
    if (navItem && navItem.textContent && navItem.textContent.includes('Playlist')) {
        setTimeout(initPlaylistPage, 60);
    }
});