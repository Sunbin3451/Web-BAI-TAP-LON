import { getMusicByQuery } from './api.js';

const songCache = {};
let currentAbortController = null;

// 1. SKELETON LOADING
function showSkeletonLoading(container) {
    let skeletons = '';
    for (let i = 0; i < 10; i++) {
        skeletons += `
            <div class="bg-[var(--bg-surface)] p-2.5 sm:p-4 rounded-lg animate-pulse">
                <div class="w-full aspect-square bg-gray-700/40 rounded-md mb-2 sm:mb-4"></div>
                <div class="h-3 sm:h-4 bg-gray-700/50 rounded w-3/4 mb-1.5 sm:mb-2"></div>
                <div class="h-2.5 sm:h-3 bg-gray-700/30 rounded w-1/2"></div>
            </div>
        `;
    }
    container.innerHTML = skeletons;
}

// HÀM RENDER BÀI HÁT & GẮN SỰ KIỆN PHÁT NHẠC
function renderSongsToUI(songs) {
    const container = document.getElementById('song-list-container');
    if (!container) return;

    let htmlContent = '';
    songs.forEach((song, index) => {
        const imageUrl = song.thumbnail || song.image || song.cover || song.coverUrl || 'https://placehold.co/300x300/1e1e2e/ffffff?text=Music';
        const artistName = song.artist || (Array.isArray(song.artists) ? song.artists.map(a => a.name || a).join(', ') : 'Unknown Artist');
        const songId = song.id || song.sourceId || song._id || song.videoId;

        htmlContent += `
            <div class="theloai-song-card bg-[var(--bg-surface)] p-4 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer group" data-index="${index}" data-id="${songId}">
                <div class="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
                    <img src="${imageUrl}" alt="${song.title || song.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='./assets/images/default.jpg'">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="w-12 h-12 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg pointer-events-none">
                            <i class="fa-solid fa-play ml-1"></i>
                        </button>
                    </div>
                </div>
                <h4 class="font-bold text-[var(--text-primary)] truncate mb-1">${song.title || song.name}</h4>
                <p class="text-sm text-[var(--text-secondary)] truncate">${artistName}</p>
            </div>
        `;
    });

    container.innerHTML = htmlContent;

    // Gắn sự kiện click để phát bài hát
    container.querySelectorAll('.theloai-song-card').forEach(card => {
        card.onclick = () => {
            const index = parseInt(card.getAttribute('data-index'), 10);
            const selectedSong = songs[index];
            if (!selectedSong) return;

            // Phát bài hát đã chọn
            if (typeof window.playSong === 'function') {
                window.playSong(selectedSong);
            }
        };
    });
}

// 3. HÀM TẢI VÀ RENDER NHẠC
async function renderSongs(theLoaiDuocChon) {
    const container = document.getElementById('song-list-container');
    if (!container) return;

    if (songCache[theLoaiDuocChon]) {
        renderSongsToUI(songCache[theLoaiDuocChon]);
        return;
    }

    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    showSkeletonLoading(container);

    try {
        const songs = await getMusicByQuery(theLoaiDuocChon);

        if (!songs || songs.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center text-gray-500 mt-10">Không tìm thấy bài hát nào...</p>`;
            return;
        }

        songCache[theLoaiDuocChon] = songs;
        renderSongsToUI(songs);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Lỗi lấy danh sách nhạc:', err);
        }
    }
}

// 4. PREFETCH
function prefetchGenre(genreName) {
    if (!songCache[genreName]) {
        getMusicByQuery(genreName).then(data => {
            if (data) songCache[genreName] = data;
        });
    }
}

// 5. KHỞI TẠO TRANG
function initTheLoaiPage() {
    const container = document.getElementById('song-list-container');
    if (!container) return;

    const activeBtn = document.querySelector('.btn-the-loai.active span');
    const defaultGenre = activeBtn ? activeBtn.innerText.trim() : 'K-Pop';

    renderSongs(defaultGenre);
}

document.addEventListener('DOMContentLoaded', initTheLoaiPage);

// 6. SỰ KIỆN CLICK CHUYỂN THỂ LOẠI
document.addEventListener('click', function (e) {
    const genreBtn = e.target.closest('.btn-the-loai');
    if (genreBtn) {
        const allGenreBtns = document.querySelectorAll('.btn-the-loai');
        allGenreBtns.forEach(btn => btn.classList.remove('active'));
        genreBtn.classList.add('active');

        const span = genreBtn.querySelector('span');
        if (span) {
            renderSongs(span.innerText.trim());
        }
        return;
    }

    const isCategoryNav = e.target.closest('[data-page="categories"]') ||
        e.target.closest('[data-page="the-loai"]') ||
        e.target.closest('[data-page="theLoai"]');

    if (isCategoryNav) {
        setTimeout(initTheLoaiPage, 50);
    }
});

// 7. SỰ KIỆN MOUSEOVER PREFETCH
document.addEventListener('mouseover', function (e) {
    const genreBtn = e.target.closest('.btn-the-loai');
    if (genreBtn) {
        const span = genreBtn.querySelector('span');
        if (span) {
            prefetchGenre(span.innerText.trim());
        }
    }
});