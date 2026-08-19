import { getMusicByQuery } from './api.js';

function initPlaylistPage() {
    const searchInput = document.getElementById('songSearchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return; // không phải trang playlist thì bỏ qua

    function normalize(str) {
        return (str || '').normalize('NFC').toLowerCase();
    }

    // ====== Playlist dùng chung, lưu qua localStorage ======
    function getCurrentUsername() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            return user && user.username ? user.username : 'guest';
        } catch {
            return 'guest';
        }
    }

    function getPlaylistKey() {
        return `myPlaylist_${getCurrentUsername()}`;
    }

    function isLoggedIn() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            return !!(user && user.username);
        } catch {
            return false;
        }
    }

    function getPlaylist() {
        try {
            return JSON.parse(localStorage.getItem(getPlaylistKey())) || [];
        } catch {
            return [];
        }
    }

    function savePlaylist(list) {
        localStorage.setItem(getPlaylistKey(), JSON.stringify(list));
    }

    function addToPlaylist(song) {
        const list = getPlaylist();
        if (!list.some(s => s.id === song.id)) {
            list.push({ ...song, dateAdded: new Date().toLocaleDateString('vi-VN') });
            savePlaylist(list);
        }
    }

    function removeFromPlaylist(id) {
        savePlaylist(getPlaylist().filter(s => s.id !== id));
    }

    function isInPlaylist(id) {
        return getPlaylist().some(s => s.id === id);
    }

    // ====== Gọi API tìm kiếm bài hát ======
    function formatDuration(totalSeconds) {
        if (!totalSeconds && totalSeconds !== 0) return '';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    async function searchSongs(query) {
        const data = await getMusicByQuery(query);
        if (!data || !Array.isArray(data)) return [];

        return data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: formatDuration(track.duration),
            thumbnail: track.thumbnail
        }));
    }

    function renderResultRow(s) {
        return `
            <div class="playlist__result-row grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 px-2 py-2 rounded cursor-pointer">
                <div class="playlist__result-thumb w-10 h-10 bg-neutral-700 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    ${s.thumbnail
                ? `<img src="${s.thumbnail}" class="w-full h-full object-cover" alt="${s.title}">`
                : `<i class="fa-solid fa-music text-neutral-400 text-sm"></i>`}
                </div>
                <div class="playlist__result-info min-w-0">
                    <p class="playlist__result-title text-sm text-white truncate">${s.title}</p>
                    <p class="playlist__result-artist text-xs text-neutral-400 truncate">${s.artist}</p>
                </div>
                <p class="playlist__result-album text-sm text-neutral-400 truncate hidden md:block">${s.album}</p>
                <button
                    class="playlist__result-add-btn search-add-btn ${isInPlaylist(s.id) ? "added" : ""} w-7 h-7 rounded-full border border-neutral-400 text-white flex items-center justify-center flex-shrink-0"
                    data-id="${s.id}" data-title="${s.title}" data-artist="${s.artist}" data-album="${s.album}" data-duration="${s.duration}" data-thumbnail="${s.thumbnail || ''}">
                    <i class="fa-solid ${isInPlaylist(s.id) ? "fa-check" : "fa-plus"} text-xs"></i>
                </button>
            </div>
        `;
    }

    async function renderResults(query) {
        const q = query.trim();

        if (!q) {
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            return;
        }

        searchResults.innerHTML = `<p class="text-neutral-400 text-sm px-2 py-3">Đang tìm kiếm...</p>`;
        searchResults.classList.remove('hidden');

        const matches = await searchSongs(q);

        if (matches.length === 0) {
            searchResults.innerHTML = `<p class="text-neutral-400 text-sm px-2 py-3">Không tìm thấy bài hát nào cho "${query}"</p>`;
            return;
        }

        searchResults.innerHTML = matches.map(renderResultRow).join('');
    }

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const value = e.target.value;
        debounceTimer = setTimeout(() => renderResults(value), 400);
    });

    searchResults.addEventListener('click', (e) => {
        const btn = e.target.closest('.playlist__result-add-btn');
        if (!btn) return;

        if (!isLoggedIn()) {
            alert('Bạn cần đăng nhập để thêm bài hát vào danh sách phát.');
            window.location.href = 'login.html';
            return;
        }

        const id = btn.dataset.id;

        if (isInPlaylist(id)) {
            removeFromPlaylist(id);
        } else {
            addToPlaylist({
                id: btn.dataset.id,
                title: btn.dataset.title,
                artist: btn.dataset.artist,
                album: btn.dataset.album,
                duration: btn.dataset.duration,
                thumbnail: btn.dataset.thumbnail
            });
        }

        renderResults(searchInput.value);
        renderPlaylist();
    });

    // ====== Render bảng playlist đã lưu ======
    function renderPlaylist() {
        const fullView = document.getElementById('playlistFullView');
        const trackList = document.getElementById('playlistTrackList');
        const countEl = document.getElementById('playlistCount');
        const durationEl = document.getElementById('playlistTotalDuration');
        const coverEl = document.getElementById('playlistCover');
        if (!fullView || !trackList) return;

        const playlistSongs = getPlaylist();

        if (coverEl) {
            const customCover = localStorage.getItem('playlistCustomCover');
            if (customCover) {
                coverEl.innerHTML = `<img src="${customCover}" class="w-full h-full object-cover">`;
            } else if (playlistSongs.length > 0 && playlistSongs[0].thumbnail) {
                coverEl.innerHTML = `<img src="${playlistSongs[0].thumbnail}" class="w-full h-full object-cover rounded" alt="${playlistSongs[0].title}">`;
            } else {
                coverEl.innerHTML = `<i class="fa-solid fa-music text-5xl text-neutral-400"></i>`;
            }
        }

        if (playlistSongs.length === 0) {
            fullView.classList.add('hidden');
            trackList.innerHTML = '';
            return;
        }

        let totalSeconds = 0;
        playlistSongs.forEach(s => {
            const [m, sec] = (s.duration || '0:00').split(':').map(Number);
            totalSeconds += (m || 0) * 60 + (sec || 0);
        });
        const totalMin = Math.floor(totalSeconds / 60);
        const totalSec = totalSeconds % 60;

        countEl.textContent = `${playlistSongs.length} bài hát`;
        durationEl.textContent = totalMin > 0 ? `, khoảng ${totalMin} phút ${totalSec} giây` : `, ${totalSec} giây`;

        trackList.innerHTML = playlistSongs.map((s, index) => `
            <tr class="playlist__table-row hover:bg-white/10 group">
                <td class="py-3 pl-2 text-neutral-400">${index + 1}</td>
                <td class="py-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                            ${s.thumbnail
                ? `<img src="${s.thumbnail}" class="w-full h-full object-cover" alt="${s.title}">`
                : `<i class="fa-solid fa-music text-neutral-400 text-sm"></i>`}
                        </div>
                        <p class="text-sm text-white truncate">${s.title}</p>
                    </div>
                </td>
                <td class="py-3 text-neutral-400 text-sm hidden md:table-cell">${s.artist}</td>
                <td class="py-3 text-neutral-400 text-sm hidden lg:table-cell">${s.album || ''}</td>
                <td class="py-3 text-neutral-400 text-sm hidden lg:table-cell">${s.dateAdded || ''}</td>
                <td class="py-3 pr-4 text-right text-neutral-400 text-sm">
                    <button class="playlist__remove-btn remove-track-btn opacity-0 group-hover:opacity-100 mr-2 hover:text-white" data-id="${s.id}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>${s.duration || ''}
                </td>
            </tr>
        `).join('');

        fullView.classList.remove('hidden');
    }

    document.getElementById('playlistTrackList')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.playlist__remove-btn');
        if (!btn) return;
        removeFromPlaylist(btn.getAttribute('data-id'));
        renderPlaylist();
        renderResults(searchInput.value);
    });

    // Chọn ảnh bìa tùy chỉnh
    const coverElInit = document.getElementById('playlistCover');
    const coverUploadInput = document.getElementById('coverUploadInput');

    coverElInit?.addEventListener('click', () => coverUploadInput?.click());

    coverUploadInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            localStorage.setItem('playlistCustomCover', event.target.result);
            renderPlaylist();
        };
        reader.readAsDataURL(file);
    });

    renderPlaylist();
}

// Lắng nghe tín hiệu từ router: chỉ chạy initPlaylistPage() khi đúng trang "playlist" được load
document.addEventListener('spa:pageLoaded', (e) => {
    if (e.detail && e.detail.page === 'playlist') {
        initPlaylistPage();
    }
});