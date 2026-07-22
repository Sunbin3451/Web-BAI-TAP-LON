// Danh sách bài hát 
const songDatabase = [
    // Sơn Tùng M-TP
    { title: "Đừng Làm Trái Tim Anh Đau", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "4:10" },
    { title: "Chúng Ta Của Tương Lai", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "4:35" },
    { title: "Muộn Rồi Mà Sao Còn", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "3:58" },
    { title: "Có Chắc Yêu Là Đây", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "3:52" },
    { title: "Hãy Trao Cho Anh", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "3:52" },
    { title: "Chạy Ngay Đi", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "4:02" },
    { title: "Lạc Trôi", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "4:20" },
    { title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP", album: "Chúng Ta Của Tương Lai", duration: "4:22" },

    // Đen Vâu
    { title: "Mang Tiền Về Cho Mẹ", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "4:15" },
    { title: "Nấu Ăn Cho Em", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "3:45" },
    { title: "Đi Về Nhà", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "4:05" },
    { title: "Lối Nhỏ", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "3:50" },
    { title: "Hai Triệu Năm", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "4:00" },
    { title: "Bài Này Chill Phết", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "3:40" },
    { title: "Trốn Tìm", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "3:55" },
    { title: "Anh Đếch Cần Gì Nhiều Ngoài Em", artist: "Đen Vâu", album: "Mang Tiền Về Cho Mẹ", duration: "4:12" },

    // RPT MCK
    { title: "Chìm Sâu", artist: "RPT MCK", album: "99%", duration: "3:48" },
    { title: "Tại Vì Sao", artist: "RPT MCK", album: "99%", duration: "3:52" },
    { title: "Va Vào Giai Điệu Này", artist: "RPT MCK", album: "99%", duration: "4:00" },
    { title: "Anh Đã Ổn Hơn", artist: "RPT MCK", album: "99%", duration: "3:44" },
    { title: "Thôi Em Đừng Đi", artist: "RPT MCK", album: "99%", duration: "4:10" },
    { title: "Giàu Vì Bạn Sang Vì Vợ", artist: "RPT MCK", album: "99%", duration: "3:38" },
    { title: "Chỉ Một Đêm Nữa Thôi", artist: "RPT MCK", album: "99%", duration: "3:56" },
    { title: "Cuốn Cho Anh Một Điếu Nữa Đi", artist: "RPT MCK", album: "99%", duration: "4:08" },

    // tlinh
    { title: "Nếu Lúc Đó", artist: "tlinh", album: "Ái", duration: "3:35" },
    { title: "Ghệ Iu Dấu Của Em Ơi", artist: "tlinh", album: "Ái", duration: "3:20" },
    { title: "Em Là Châu Báu", artist: "tlinh", album: "Ái", duration: "3:42" },
    { title: "Gái Độc Thân", artist: "tlinh", album: "Ái", duration: "3:30" },
    { title: "Không Cần Phải Nói Nhiều", artist: "tlinh", album: "Ái", duration: "3:48" },
    { title: "Thích Quá Rùi Nà", artist: "tlinh", album: "Ái", duration: "3:15" },
    { title: "Ái", artist: "tlinh", album: "Ái", duration: "4:00" },
    { title: "Người Điên", artist: "tlinh", album: "Ái", duration: "3:52" },

    // Vũ.
    { title: "Bước Qua Mùa Cô Đơn", artist: "Vũ.", album: "Một Vạn Năm", duration: "4:05" },
    { title: "Lạ Lùng", artist: "Vũ.", album: "Một Vạn Năm", duration: "3:50" },
    { title: "Đông Kiếm Em", artist: "Vũ.", album: "Một Vạn Năm", duration: "3:58" },
    { title: "Mùa Mưa Ngâu Nằm Cạnh", artist: "Vũ.", album: "Một Vạn Năm", duration: "4:15" },
    { title: "Những Lời Hứa Bỏ Quên", artist: "Vũ.", album: "Một Vạn Năm", duration: "3:44" },
    { title: "Chậm Lại", artist: "Vũ.", album: "Một Vạn Năm", duration: "3:36" },
    { title: "Anh Nhớ Ra", artist: "Vũ.", album: "Một Vạn Năm", duration: "3:55" },
    { title: "Một Vạn Năm", artist: "Vũ.", album: "Một Vạn Năm", duration: "4:20" },

    // HIEUTHUHAI
    { title: "Không Thể Say", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "3:40" },
    { title: "Exit Sign", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "3:21" },
    { title: "Ngủ Một Mình", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "3:48" },
    { title: "Hẹn Gặp Em Dưới Ánh Trăng", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "4:00" },
    { title: "Vệ Tinh", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "3:35" },
    { title: "Trình", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "3:52" },
    { title: "Love Sand", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "3:44" },
    { title: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", artist: "HIEUTHUHAI", album: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó", duration: "4:05" },

    // Mỹ Tâm
    { title: "Đúng Cũng Thành Sai", artist: "Mỹ Tâm", album: "Tâm 9", duration: "4:10" },
    { title: "Người Hãy Quên Em Đi", artist: "Mỹ Tâm", album: "Tâm 9", duration: "3:55" },
    { title: "Đừng Hỏi Em", artist: "Mỹ Tâm", album: "Tâm 9", duration: "4:02" },
    { title: "Nếu Anh Đi", artist: "Mỹ Tâm", album: "Tâm 9", duration: "3:48" },
    { title: "Họa Mi Tóc Nâu", artist: "Mỹ Tâm", album: "Tâm 9", duration: "4:15" },
    { title: "Ước Gì", artist: "Mỹ Tâm", album: "Tâm 9", duration: "3:40" },
    { title: "Nhé Anh", artist: "Mỹ Tâm", album: "Tâm 9", duration: "3:52" },
    { title: "Chuyện Như Chưa Bắt Đầu", artist: "Mỹ Tâm", album: "Tâm 9", duration: "4:05" },

    // BTS
    { title: "Dynamite", artist: "BTS", album: "Proof", duration: "3:19" },
    { title: "Butter", artist: "BTS", album: "Proof", duration: "2:44" },
    { title: "Permission To Dance", artist: "BTS", album: "Proof", duration: "3:07" },
    { title: "Fake Love", artist: "BTS", album: "Proof", duration: "4:03" },
    { title: "Boy With Luv", artist: "BTS", album: "Proof", duration: "3:38" },
    { title: "DNA", artist: "BTS", album: "Proof", duration: "3:43" },
    { title: "Spring Day", artist: "BTS", album: "Proof", duration: "4:34" },
    { title: "Life Goes On", artist: "BTS", album: "Proof", duration: "3:34" },

    // BLACKPINK
    { title: "Pink Venom", artist: "BLACKPINK", album: "BORN PINK", duration: "3:07" },
    { title: "Shut Down", artist: "BLACKPINK", album: "BORN PINK", duration: "2:59" },
    { title: "How You Like That", artist: "BLACKPINK", album: "BORN PINK", duration: "3:01" },
    { title: "DDU-DU DDU-DU", artist: "BLACKPINK", album: "BORN PINK", duration: "3:29" },
    { title: "Kill This Love", artist: "BLACKPINK", album: "BORN PINK", duration: "3:11" },
    { title: "Playing With Fire", artist: "BLACKPINK", album: "BORN PINK", duration: "3:20" },
    { title: "Lovesick Girls", artist: "BLACKPINK", album: "BORN PINK", duration: "3:12" },
    { title: "As If It's Your Last", artist: "BLACKPINK", album: "BORN PINK", duration: "3:26" },

    // NewJeans
    { title: "Super Shy", artist: "NewJeans", album: "Get Up", duration: "2:34" },
    { title: "ETA", artist: "NewJeans", album: "Get Up", duration: "2:37" },
    { title: "OMG", artist: "NewJeans", album: "Get Up", duration: "3:32" },
    { title: "Ditto", artist: "NewJeans", album: "Get Up", duration: "3:05" },
    { title: "Attention", artist: "NewJeans", album: "Get Up", duration: "3:10" },
    { title: "Hype Boy", artist: "NewJeans", album: "Get Up", duration: "3:01" },
    { title: "Cookie", artist: "NewJeans", album: "Get Up", duration: "3:07" },
    { title: "Cool With You", artist: "NewJeans", album: "Get Up", duration: "3:03" },

    // Taylor Swift
    { title: "Fortnight", artist: "Taylor Swift", album: "The Tortured Poets Department", duration: "3:48" },
    { title: "Cruel Summer", artist: "Taylor Swift", album: "The Tortured Poets Department", duration: "2:58" },
    { title: "Anti-Hero", artist: "Taylor Swift", album: "The Tortured Poets Department", duration: "3:20" },
    { title: "Blank Space", artist: "Taylor Swift", album: "The Tortured Poets Department", duration: "3:51" },
    { title: "Style", artist: "Taylor Swift", album: "The Tortured Poets Department", duration: "3:51" },
    { title: "Lover", artist: "Taylor Swift", album: "The Tortured Poets Department", duration: "3:41" },
    { title: "cardigan", artist: "Taylor Swift", album: "The Tortured Poets Department", duration: "3:59" },

    // Bruno Mars
    { title: "24K Magic", artist: "Bruno Mars", album: "24K Magic", duration: "3:46" },
    { title: "That's What I Like", artist: "Bruno Mars", album: "24K Magic", duration: "3:26" },
    { title: "Versace On The Floor", artist: "Bruno Mars", album: "24K Magic", duration: "4:41" },
    { title: "Locked Out Of Heaven", artist: "Bruno Mars", album: "24K Magic", duration: "3:53" },
    { title: "Just The Way You Are", artist: "Bruno Mars", album: "24K Magic", duration: "3:40" },
    { title: "Grenade", artist: "Bruno Mars", album: "24K Magic", duration: "3:41" },
    { title: "Treasure", artist: "Bruno Mars", album: "24K Magic", duration: "2:53" },
    { title: "Talking To The Moon", artist: "Bruno Mars", album: "24K Magic", duration: "3:37" },

    // The Weeknd
    { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20" },
    { title: "Save Your Tears", artist: "The Weeknd", album: "After Hours", duration: "3:35" },
    { title: "Starboy", artist: "The Weeknd", album: "After Hours", duration: "3:50" },
    { title: "The Hills", artist: "The Weeknd", album: "After Hours", duration: "4:02" },
    { title: "Can't Feel My Face", artist: "The Weeknd", album: "After Hours", duration: "3:33" },
    { title: "Die For You", artist: "The Weeknd", album: "After Hours", duration: "4:20" },
    { title: "Earned It", artist: "The Weeknd", album: "After Hours", duration: "4:37" },
    { title: "After Hours", artist: "The Weeknd", album: "After Hours", duration: "6:01" },

    // Karik
    { title: "Bạn Đời", artist: "Karik", album: "Đánh Mất", duration: "3:50" },
    { title: "Đánh Mất", artist: "Karik", album: "Đánh Mất", duration: "4:00" },
    { title: "Thương", artist: "Karik", album: "Đánh Mất", duration: "3:44" },
    { title: "Có Chơi Có Chịu", artist: "Karik", album: "Đánh Mất", duration: "3:38" },
    { title: "Anh Không Đòi Quà", artist: "Karik", album: "Đánh Mất", duration: "4:05" },
    { title: "Quan Trọng Là Thần Thái", artist: "Karik", album: "Đánh Mất", duration: "3:52" },
    { title: "Người Lạ Ơi", artist: "Karik", album: "Đánh Mất", duration: "4:10" },
    { title: "Anh Là Sinh Viên", artist: "Karik", album: "Đánh Mất", duration: "3:48" },

    // Erik
    { title: "Váy Cưới", artist: "Erik", album: "Best Of Erik", duration: "3:55" },
    { title: "Sau Tất Cả", artist: "Erik", album: "Best Of Erik", duration: "4:12" },
    { title: "Em Không Sai Chúng Ta Sai", artist: "Erik", album: "Best Of Erik", duration: "4:00" },
    { title: "Chạm Đáy Nỗi Đau", artist: "Erik", album: "Best Of Erik", duration: "3:48" },
    { title: "Yêu Và Yêu", artist: "Erik", album: "Best Of Erik", duration: "3:52" },
    { title: "Dù Cho Tận Thế", artist: "Erik", album: "Best Of Erik", duration: "3:53" },
    { title: "Ghen", artist: "Erik", album: "Best Of Erik", duration: "3:44" },
    { title: "Mùa Đông", artist: "Erik", album: "Best Of Erik", duration: "4:05" },

    // AMEE
    { title: "Anh Nhà Ở Đâu Thế", artist: "AMEE", album: "dreAMEE", duration: "3:30" },
    { title: "Đen Đá Không Đường", artist: "AMEE", album: "dreAMEE", duration: "3:20" },
    { title: "Yêu Thì Yêu Không Yêu Thì Yêu", artist: "AMEE", album: "dreAMEE", duration: "3:44" },
    { title: "Ex's Hate Me", artist: "AMEE", album: "dreAMEE", duration: "3:15" },
    { title: "Mama Boy", artist: "AMEE", album: "dreAMEE", duration: "3:35" },
    { title: "Sao Anh Chưa Về Nhà", artist: "AMEE", album: "dreAMEE", duration: "3:52" },
    { title: "Trời Giấu Trời Mang Đi", artist: "AMEE", album: "dreAMEE", duration: "4:00" },
    { title: "Shay Nắnggg", artist: "AMEE", album: "dreAMEE", duration: "3:10" },

    // Hà Anh Tuấn
    { title: "Tháng Tư Là Lời Nói Dối Của Em", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "4:15" },
    { title: "Xuân Thì", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "3:58" },
    { title: "Người Con Gái Ta Thương", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "4:05" },
    { title: "Chuyện Của Mùa Đông", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "3:52" },
    { title: "Truyện Ngắn", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "3:48" },
    { title: "Nhà Tôi Có Treo Một Lá Cờ", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "4:20" },
    { title: "Chiếc Lá Mùa Đông", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "4:00" },
    { title: "Những Vết Thương Lành", artist: "Hà Anh Tuấn", album: "Cuối Ngày Người Đàn Ông Một Mình", duration: "3:55" },

    // Alan Walker
    { title: "Faded", artist: "Alan Walker", album: "World Of Walker", duration: "3:32" },
    { title: "Alone", artist: "Alan Walker", album: "World Of Walker", duration: "2:43" },
    { title: "Darkside", artist: "Alan Walker", album: "World Of Walker", duration: "3:33" },
    { title: "On My Way", artist: "Alan Walker", album: "World Of Walker", duration: "2:37" },
    { title: "Sing Me To Sleep", artist: "Alan Walker", album: "World Of Walker", duration: "3:33" },
    { title: "The Spectre", artist: "Alan Walker", album: "World Of Walker", duration: "3:52" },
    { title: "Lily", artist: "Alan Walker", album: "World Of Walker", duration: "3:05" },
    { title: "Tired", artist: "Alan Walker", album: "World Of Walker", duration: "3:04" },

    // Ngọt
    { title: "Cho Tôi Đi Theo", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:40" },
    { title: "Lần Cuối", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:52" },
    { title: "Em Dạo Này", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:44" },
    { title: "Bartender", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:30" },
    { title: "Đá Tan", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:38" },
    { title: "Cho Tôi Lang Thang", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:48" },
    { title: "Để Quên", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:35" },
    { title: "Đốt", artist: "Ngọt", album: "LẦN CUỐI", duration: "3:42" },

    // Chillies
    { title: "Mascara", artist: "Chillies", album: "Trên Những Đám Mây", duration: "3:50" },
    { title: "Vùng Ký Ức", artist: "Chillies", album: "Trên Những Đám Mây", duration: "4:00" },
    { title: "Nếu Ngày Mai Không Đến", artist: "Chillies", album: "Trên Những Đám Mây", duration: "3:55" },
    { title: "Cứ Chill Thôi", artist: "Chillies", album: "Trên Những Đám Mây", duration: "3:40" },
    { title: "Đại Lộ Mặt Trời", artist: "Chillies", album: "Trên Những Đám Mây", duration: "4:05" },
    { title: "Em Đừng Khóc", artist: "Chillies", album: "Trên Những Đám Mây", duration: "3:48" },
    { title: "Trên Những Đám Mây", artist: "Chillies", album: "Trên Những Đám Mây", duration: "4:10" },
    { title: "Giấc Mơ Khác", artist: "Chillies", album: "Trên Những Đám Mây", duration: "3:52" },
];

const searchInput = document.getElementById('songSearchInput');
const searchResults = document.getElementById('searchResults');

function normalize(str) {
    return str.normalize('NFC').toLowerCase();
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

function renderResults(query) {
    const q = normalize(query.trim());

    if (!q) {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
        return;
    }

    const matches = songDatabase.filter(
        (s) => normalize(s.title).startsWith(q) || normalize(s.artist).startsWith(q)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = `<p class="text-neutral-400 text-sm px-2 py-3">Không tìm thấy bài hát nào bắt đầu bằng "${query}"</p>`;
        searchResults.classList.remove('hidden');
        return;
    }

    searchResults.innerHTML = matches
        .map(
            (s) => `
        <div class="search-result-row grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 px-2 py-2 rounded cursor-pointer">
            <div class="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-music text-neutral-400 text-sm"></i>
            </div>
            <div class="min-w-0">
                <p class="text-sm text-white truncate">${s.title}</p>
                <p class="text-xs text-neutral-400 truncate">${s.artist}</p>
            </div>
            <p class="text-sm text-neutral-400 truncate hidden sm:block">${s.album}</p>
            <button
                class="search-add-btn ${isInPlaylist(s.title) ? "added" : ""} w-7 h-7 rounded-full border border-neutral-400 text-white flex items-center justify-center flex-shrink-0"
                data-title="${s.title}">
                <i class="fa-solid ${isInPlaylist(s.title) ? "fa-check" : "fa-plus"} text-xs"></i>
            </button>
        </div>
    `
        )
        .join('');

    searchResults.classList.remove('hidden');
}

function renderPlaylist() {
    const fullView = document.getElementById('playlistFullView');
    const trackList = document.getElementById('playlistTrackList');
    const countEl = document.getElementById('playlistCount');
    const durationEl = document.getElementById('playlistTotalDuration');
    const coverEl = document.getElementById('playlistCover');
    if (!fullView || !trackList) return;

    const playlistSongs = getPlaylist();

    if (playlistSongs.length === 0) {
        fullView.classList.add('hidden');
        trackList.innerHTML = '';
        return;
    }

    // Tính tổng thời lượng
    let totalSeconds = 0;
    playlistSongs.forEach(s => {
        const [m, sec] = (s.duration || '0:00').split(':').map(Number);
        totalSeconds += (m || 0) * 60 + (sec || 0);
    });
    const totalMin = Math.floor(totalSeconds / 60);
    const totalSec = totalSeconds % 60;

    countEl.textContent = `${playlistSongs.length} bài hát`;
    durationEl.textContent = totalMin > 0 ? `, khoảng ${totalMin} phút ${totalSec} giây` : `, ${totalSec} giây`;

    // Icon nốt nhạc làm ảnh bìa (có thể thay bằng ảnh thumbnail thật nếu có)
    coverEl.innerHTML = `<i class="fa-solid fa-music text-5xl text-neutral-400"></i>`;

    trackList.innerHTML = playlistSongs
        .map((s, index) => `
        <tr class="hover:bg-white/10 group">
            <td class="py-3 pl-2 text-neutral-400">${index + 1}</td>
            <td class="py-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid fa-music text-neutral-400 text-sm"></i>
                    </div>
                    <p class="text-sm text-white truncate">${s.title}</p>
                </div>
            </td>
            <td class="py-3 text-neutral-400 text-sm hidden md:table-cell">${s.artist}</td>
            <td class="py-3 text-neutral-400 text-sm hidden lg:table-cell">${s.album || ''}</td>
            <td class="py-3 text-neutral-400 text-sm hidden lg:table-cell">${s.dateAdded || ''}</td>
            <td class="py-3 pr-4 text-right text-neutral-400 text-sm">
                <button class="remove-track-btn opacity-0 group-hover:opacity-100 mr-2 hover:text-white" data-title="${s.title}">
                    <i class="fa-solid fa-xmark"></i>
                </button>${s.duration || ''}
            </td>
        </tr>
    `).join('');

    fullView.classList.remove('hidden');
}

// ====== Gắn sự kiện ======

// Đây là dòng bị THIẾU trong file cũ — chính là nguyên nhân search không hiện gì
searchInput.addEventListener('input', (e) => {
    renderResults(e.target.value);
});

searchResults.addEventListener('click', (e) => {
    const btn = e.target.closest('.search-add-btn');
    if (!btn) return;
    const title = btn.getAttribute('data-title');
    const song = songDatabase.find(s => s.title === title);

    if (isInPlaylist(title)) {
        removeFromPlaylist(title);
    } else if (song) {
        addToPlaylist({ title: song.title, artist: song.artist, album: song.album, duration: song.duration });
    }

    renderResults(searchInput.value);
    renderPlaylist();
});

document.getElementById('playlistTrackList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-track-btn');
    if (!btn) return;
    removeFromPlaylist(btn.getAttribute('data-title'));
    renderPlaylist();
    renderResults(searchInput.value);
});

renderPlaylist();