// Danh sách bài hát 
const songDatabase = [
    { title: "Exit Sign", artist: "HIEUTHUHAI, marzuz", duration: "3:21" },
    { title: "Dù Cho Tận Thế", artist: "ERIK", duration: "3:53" },
    { title: "Đừng Quên Tên Anh", artist: "Hoa Vinh", duration: "5:45" },
    { title: "Bạc Phận", artist: "Jack, K-ICM", duration: "4:12" },
    { title: "Sao Không Nói Yêu Anh", artist: "Jack, K-ICM", duration: "4:05" },
    { title: "Waiting For You", artist: "MONSTAR", duration: "3:47" },
    { title: "Chạy Về Khóc Với Anh", artist: "Erik", duration: "4:02" },
    { title: "Chúng Ta Của Hiện Tại", artist: "Sơn Tùng M-TP", duration: "5:07" },
    { title: "Chúng Ta Của Tương Lai", artist: "Sơn Tùng M-TP", duration: "4:35" },
    { title: "Hãy Trao Cho Anh", artist: "Sơn Tùng M-TP", duration: "3:52" },
    { title: "Thu Cuối", artist: "Yanbi, Mr T, Hằng Bingbon", duration: "4:48" },
    { title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP", duration: "4:22" },
];

const searchInput = document.getElementById('songSearchInput');
const searchResults = document.getElementById('searchResults');
const addedSongs = new Set();

function normalize(str) {
    return str.toLowerCase();
}

function renderResults(query) {
    const q = normalize(query.trim());

    if (!q) {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
        return;
    }

    const startsWith = songDatabase.filter(
        (s) => normalize(s.title).startsWith(q) || normalize(s.artist).startsWith(q)
    );
    const contains = songDatabase.filter(
        (s) =>
            !startsWith.includes(s) &&
            (normalize(s.title).includes(q) || normalize(s.artist).includes(q))
    );
    const matches = [...startsWith, ...contains];

    if (matches.length === 0) {
        searchResults.innerHTML = `<p class="text-neutral-400 text-sm px-2 py-3">Không tìm thấy bài hát nào khớp với "${query}"</p>`;
        searchResults.classList.remove('hidden');
        return;
    }

    searchResults.innerHTML = matches
        .map(
            (s) => `
        <div class="search-result-row flex items-center gap-3 px-2 py-2 rounded cursor-pointer">
            <div class="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-music text-neutral-400 text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-white truncate">${s.title}</p>
                <p class="text-xs text-neutral-400 truncate">${s.artist}</p>
            </div>
            <span class="text-xs text-neutral-400 mr-2">${s.duration}</span>
            <button
                class="search-add-btn ${addedSongs.has(s.title) ? 'added' : ''} w-7 h-7 rounded-full border border-neutral-400 text-white flex items-center justify-center flex-shrink-0"
                data-title="${s.title}">
                <i class="fa-solid ${addedSongs.has(s.title) ? 'fa-check' : 'fa-plus'} text-xs"></i>
            </button>
        </div>
    `
        )
        .join('');

    searchResults.classList.remove('hidden');
}

searchInput.addEventListener('input', (e) => {
    renderResults(e.target.value);
});

searchResults.addEventListener('click', (e) => {
    const btn = e.target.closest('.search-add-btn');
    if (!btn) return;
    const title = btn.getAttribute('data-title');
    addedSongs.has(title) ? addedSongs.delete(title) : addedSongs.add(title);
    renderResults(searchInput.value);
});

window.addEventListener('load', (renderResults) => {
    console.log('The entire page and all resources are fully loaded.');
});

window.onload = function() {
    console.log('The entire page and all resources are fully loaded.');
};