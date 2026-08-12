// 1. TẠO MOCK DATA (Dữ liệu giả lập)
const danhSachBaiHat = [
    { id: 1, title: "How You Like That", artist: "BLACKPINK", genre: "K-Pop", image: "https://placehold.co/300x300/2a1a0f/d97736?text=K-Pop" },
    { id: 2, title: "Dynamite", artist: "BTS", genre: "K-Pop", image: "https://placehold.co/300x300/2a1a0f/d97736?text=K-Pop" },
    { id: 3, title: "Lạc Trôi", artist: "Sơn Tùng M-TP", genre: "V-Pop", image: "https://placehold.co/300x300/1a1a2e/4f46e5?text=V-Pop" },
    { id: 4, title: "Chạy Ngay Đi", artist: "Sơn Tùng M-TP", genre: "V-Pop", image: "https://placehold.co/300x300/1a1a2e/4f46e5?text=V-Pop" },
    { id: 5, title: "Shape of You", artist: "Ed Sheeran", genre: "US/UK", image: "https://placehold.co/300x300/111827/10b981?text=US/UK" },
    { id: 6, title: "Blinding Lights", artist: "The Weeknd", genre: "US/UK", image: "https://placehold.co/300x300/111827/10b981?text=US/UK" },
    { id: 7, title: "Thủy Tinh", artist: "Chillies", genre: "Indie", image: "https://placehold.co/300x300/14532d/4ade80?text=Indie" }
];

// 2. HÀM VẼ GIAO DIỆN (Render)
function renderSongs(theLoaiDuocChon) {
    const container = document.getElementById('song-list-container');
    if (!container) return;
    
    container.innerHTML = '';

    // Lọc bài hát theo thể loại
    const baiHatCuaTheLoai = danhSachBaiHat.filter(song => song.genre === theLoaiDuocChon);

    // Thông báo nếu chưa có dữ liệu
    if (baiHatCuaTheLoai.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-500 mt-10">Đang cập nhật bài hát cho thể loại này...</p>`;
        return;
    }

    // Tạo HTML cho các bài hát
    let htmlContent = '';
    baiHatCuaTheLoai.forEach(song => {
        htmlContent += `
            <div class="bg-[var(--bg-surface)] p-4 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer group">
                <div class="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
                    <img src="${song.image}" alt="${song.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="w-12 h-12 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                            <i class="fa-solid fa-play ml-1"></i>
                        </button>
                    </div>
                </div>
                <h4 class="font-bold text-[var(--text-primary)] truncate mb-1">${song.title}</h4>
                <p class="text-sm text-[var(--text-secondary)] truncate">${song.artist}</p>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
}

// 3. HÀM KHỞI TẠO VÀ TỰ ĐỘNG PHÁT HIỆN SỰ KIỆN NẠP TRANG
function initTheLoaiPage() {
    const container = document.getElementById('song-list-container');
    if (!container) return; // Nếu chưa xuất hiện container (chưa ở trang Thể loại) thì thoát

    // Tìm nút đang active (ví dụ K-Pop), nếu không thấy thì lấy mặc định K-Pop
    const activeBtn = document.querySelector('.btn-the-loai.active span');
    const defaultGenre = activeBtn ? activeBtn.innerText.trim() : 'K-Pop';

    renderSongs(defaultGenre);
}

// Xử lý khi trang web được tải lần đầu
document.addEventListener('DOMContentLoaded', initTheLoaiPage);

// 4. LẮNG NGHE SỰ KIỆN CLICK TOÀN CỤC (Event Delegation)
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
        setTimeout(initTheLoaiPage, 100);
    }
});