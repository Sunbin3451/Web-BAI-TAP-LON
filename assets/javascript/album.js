// 1: Khai báo danh sách nghệ sĩ
const artists = [
    // V-Pop
    { id: "sontung", name: "Sơn Tùng M-TP", img: "images/sontung.jpg", category: "vpop" },
    { id: "hieuthuhai", name: "HIEUTHUHAI", img: "images/hieuthuhai.jpg", category: "vpop" },
    { id: "denvau", name: "Đen Vâu", img: "images/denvau.jpg", category: "vpop" },
    { id: "tlinh", name: "tlinh", img: "images/tlinh.jpg", category: "vpop" },
    { id: "vu", name: "Vũ.", img: "images/vu.jpg", category: "vpop" },
    { id: "mytam", name: "Mỹ Tâm", img: "images/mytam.jpg", category: "vpop" },

    // K-Pop
    { id: "bts", name: "BTS", img: "images/bts.jpg", category: "kpop" },
    { id: "blackpink", name: "BLACKPINK", img: "images/blackpink.jpg", category: "kpop" },
    { id: "newjeans", name: "NewJeans", img: "images/newjeans.jpg", category: "kpop" },

    // US/UK
    { id: "taylorswift", name: "Taylor Swift", img: "images/taylor.jpg", category: "usuk" },
    { id: "brunomars", name: "Bruno Mars", img: "images/bruno.jpg", category: "usuk" },
    { id: "theweeknd", name: "The Weeknd", img: "images/weeknd.jpg", category: "usuk" },

    // Rap Việt
    { id: "mck", name: "RPT MCK", img: "images/mck.jpg", category: "rap" },
    { id: "karik", name: "Karik", img: "images/karik.jpg", category: "rap" },

    // Nhạc trẻ
    { id: "amee", name: "AMEE", img: "images/amee.jpg", category: "nhactre" },
    { id: "erik", name: "Erik", img: "images/erik.jpg", category: "nhactre" },

    // Ballad
    { id: "haanhtuan", name: "Hà Anh Tuấn", img: "images/haanhtuan.jpg", category: "ballad" },

    // EDM
    { id: "alanwalker", name: "Alan Walker", img: "images/alanwalker.jpg", category: "edm" },

    // Indie / Chill
    { id: "ngot", name: "Ngọt", img: "images/ngot.jpg", category: "indie" },
    { id: "chillies", name: "Chillies", img: "images/chillies.jpg", category: "chill" }
];

// 2: Tìm thẻ artist-grid
const grid = document.getElementById("artist-grid");

//  3: Chỉ chạy vòng lặp NẾU grid có tồn tại trên trang hiện tại
if (grid) {
    for (let artist of artists) {
        let artistCardHtml = `
        <div class="artist-card">
            <a href="album-detail.html?artist=${artist.id}" class="artist-image">
                <img src="${artist.img}" alt="${artist.name}">
                <div class="play-btn">
                    <i class="fa-solid fa-play"></i>
                </div>
            </a>
            <p>
                <a href="album-detail.html?artist=${artist.id}">
                    ${artist.name}
                </a>
            </p>
        </div>
        `;
        
        grid.innerHTML += artistCardHtml;
    }
}