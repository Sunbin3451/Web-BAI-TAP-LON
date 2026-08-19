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

// 2. HÀM RENDER BÀI HÁT
function renderSongsToUI(songs) {
    const container = document.getElementById('song-list-container');
    if (!container) return;

    let htmlContent = '';
    songs.forEach(song => {
        const imageUrl = song.thumbnail || song.image || song.cover || 'https://placehold.co/300x300/1e1e2e/ffffff?text=Music';
        const artistName = song.artist || (Array.isArray(song.artists) ? song.artists.join(', ') : 'Unknown Artist');

        htmlContent += `
            <div class="bg-[var(--bg-surface)] p-2.5 sm:p-4 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer group" data-id="${song.id}">
                <div class="relative w-full aspect-square mb-2 sm:mb-4 rounded-md overflow-hidden shadow-lg">
                    <img src="${imageUrl}" alt="${song.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="w-9 h-9 sm:w-12 sm:h-12 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                            <i class="fa-solid fa-play ml-0.5 text-xs sm:text-base"></i>
                        </button>
                    </div>
                </div>
                <h4 class="font-bold text-xs sm:text-sm md:text-base text-[var(--text-primary)] truncate mb-0.5 sm:mb-1">${song.title}</h4>
                <p class="text-[11px] sm:text-xs md:text-sm text-[var(--text-secondary)] truncate">${artistName}</p>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
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