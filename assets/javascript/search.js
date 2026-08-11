import { getMusicByQuery } from './api.js';

const searchInput = document.getElementById('songSearchInput');
const searchResults = document.getElementById('searchResults');

function normalize(str) {
    return (str || '').normalize('NFC').toLowerCase();
}

// ====== Playlist dùng chung, lưu qua localStorage ======
function getPlaylist() {
    try {
        return JSON.parse(localStorage.getItem('myPlaylist')) || [];
    } catch {
        return [];
    }
}

function savePlaylist(list) {
    localStorage.setItem('myPlaylist', JSON.stringify(list));
}

function addToPlaylist(song) {
    const list = getPlaylist();
    if (!list.some(s => s.title === song.title)) {
        list.push({ ...song, dateAdded: new Date().toLocaleDateString('vi-VN') });
        savePlaylist(list);
    }
}

function removeFromPlaylist(title) {
    savePlaylist(getPlaylist().filter(s => s.title !== title));
}

function isInPlaylist(title) {
    return getPlaylist().some(s => s.title === title);
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
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: formatDuration(track.duration),
        thumbnail: track.thumbnail
    }));
}

// ====== Render kết quả tìm kiếm ======
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
            <p class="playlist__result-album text-sm text-neutral-400 truncate hidden sm:block">${s.album}</p>
            <button
                class="playlist__result-add-btn search-add-btn ${isInPlaylist(s.title) ? "added" : ""} w-7 h-7 rounded-full border border-neutral-400 text-white flex items-center justify-center flex-shrink-0"
                data-title="${s.title}" data-artist="${s.artist}" data-album="${s.album}" data-duration="${s.duration}">
                <i class="fa-solid ${isInPlaylist(s.title) ? "fa-check" : "fa-plus"} text-xs"></i>
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

// Debounce: chờ người dùng ngừng gõ ~400ms mới gọi API, tránh gọi liên tục
let debounceTimer;
// Kiểm tra an toàn: Chỉ chạy khi các phần tử search thực sự tồn tại trên DOM
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const value = e.target.value;
        debounceTimer = setTimeout(() => renderResults(value), 400);
    });
}

if (searchResults) {
    searchResults.addEventListener('click', (e) => {
        const btn = e.target.closest('.playlist__result-add-btn');
        if (!btn) return;

        const title = btn.dataset.title;

        if (isInPlaylist(title)) {
            removeFromPlaylist(title);
        } else {
            addToPlaylist({
                title: btn.dataset.title,
                artist: btn.dataset.artist,
                album: btn.dataset.album,
                duration: btn.dataset.duration
            });
        }

        if (searchInput) renderResults(searchInput.value);
        renderPlaylist();
    });
}

// ====== Render bảng playlist đã lưu ======
function renderPlaylist() {
    const fullView = document.getElementById('playlistFullView');
    const trackList = document.getElementById('playlistTrackList');
    const countEl = document.getElementById('playlistCount');
    const durationEl = document.getElementById('playlistTotalDuration');
    if (!fullView || !trackList) return;

    const playlistSongs = getPlaylist();

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
                <button class="playlist__remove-btn remove-track-btn opacity-0 group-hover:opacity-100 mr-2 hover:text-white" data-title="${s.title}">
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
    removeFromPlaylist(btn.getAttribute('data-title'));
    renderPlaylist();
    renderResults(searchInput.value);
});

renderPlaylist();