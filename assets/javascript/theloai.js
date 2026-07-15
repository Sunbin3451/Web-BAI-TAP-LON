// Bắt sự kiện khi file HTML đã load xong hoàn toàn
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Tìm tất cả các nút có class 'btn-the-loai'
    const genreButtons = document.querySelectorAll('.btn-the-loai');

    // 2. Lặp qua từng nút để gắn 'tai nghe' chờ sự kiện click
    genreButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            // Bước A: Xóa class 'active' khỏi TẤT CẢ các nút
            genreButtons.forEach(btn => btn.classList.remove('active'));

            // Bước B: Thêm class 'active' vào chính nút vừa được click
            this.classList.add('active');
            
            // (Tùy chọn) In ra console để kiểm tra xem đã lấy đúng tên thể loại chưa
            // const tenTheLoai = this.querySelector('span').innerText;
            // console.log("Bạn vừa chọn thể loại:", tenTheLoai);
        });
    });

});
// 1. TẠO MOCK DATA (Dữ liệu giả lập)
// Cấu trúc này giống hệt dữ liệu từ API thật sau này trả về
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
    container.innerHTML = ''; // Xóa sạch các bài hát cũ đang hiển thị

    // Lọc ra các bài hát thuộc thể loại vừa click
    const baiHatCuaTheLoai = danhSachBaiHat.filter(song => song.genre === theLoaiDuocChon);

    // Nếu thể loại này chưa có dữ liệu bài hát
    if (baiHatCuaTheLoai.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-500 mt-10">Đang cập nhật bài hát cho thể loại này...</p>`;
        return;
    }

    // Nếu có dữ liệu, dùng vòng lặp để tạo ra các thẻ HTML
    let htmlContent = '';
    baiHatCuaTheLoai.forEach(song => {
        htmlContent += `
            <div class="bg-[var(--bg-surface)] p-4 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer group">
                <div class="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
                    <!-- Ảnh bìa bài hát -->
                    <img src="${song.image}" alt="${song.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    
                    <!-- Lớp phủ tối màu và Nút Play hiện ra khi hover -->
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="w-12 h-12 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                            <i class="fa-solid fa-play ml-1"></i>
                        </button>
                    </div>
                </div>
                <!-- Thông tin bài hát -->
                <h4 class="font-bold text-[var(--text-primary)] truncate mb-1">${song.title}</h4>
                <p class="text-sm text-[var(--text-secondary)] truncate">${song.artist}</p>
            </div>
        `;
    });

    // Đổ toàn bộ HTML vừa tạo vào khung
    container.innerHTML = htmlContent;
}

// 3. CẬP NHẬT LẠI SỰ KIỆN CLICK LÚC NÃY
document.addEventListener('DOMContentLoaded', function() {
    const genreButtons = document.querySelectorAll('.btn-the-loai');

    // Chạy mặc định gọi hàm render cho K-Pop (vì nút K-Pop đang để active từ đầu)
    renderSongs("K-Pop");

    genreButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xử lý đổi màu nút như cũ
            genreButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Lấy tên thể loại từ thẻ <span> bên trong nút vừa click
            const tenTheLoai = this.querySelector('span').innerText;
            
            // Gọi hàm vẽ lại danh sách bài hát theo thể loại đó
            renderSongs(tenTheLoai);
        });
    });
});