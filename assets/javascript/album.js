const artists = [

    // V-Pop
    {
        id: "sontung",
        name: "Sơn Tùng M-TP",
        img: "images/sontung.jpg",
        category: "vpop"
    },

    {
        id: "hieuthuhai",
        name: "HIEUTHUHAI",
        img: "images/hieuthuhai.jpg",
        category: "vpop"
    },

    {
        id: "denvau",
        name: "Đen Vâu",
        img: "images/denvau.jpg",
        category: "vpop"
    },

    {
        id: "tlinh",
        name: "tlinh",
        img: "images/tlinh.jpg",
        category: "vpop"
    },

    {
        id: "vu",
        name: "Vũ.",
        img: "images/vu.jpg",
        category: "vpop"
    },

    {
        id: "mytam",
        name: "Mỹ Tâm",
        img: "images/mytam.jpg",
        category: "vpop"
    },


    // K-Pop
    {
        id: "bts",
        name: "BTS",
        img: "images/bts.jpg",
        category: "kpop"
    },

    {
        id: "blackpink",
        name: "BLACKPINK",
        img: "images/blackpink.jpg",
        category: "kpop"
    },

    {
        id: "newjeans",
        name: "NewJeans",
        img: "images/newjeans.jpg",
        category: "kpop"
    },


    // US/UK
    {
        id: "taylorswift",
        name: "Taylor Swift",
        img: "images/taylor.jpg",
        category: "usuk"
    },

    {
        id: "brunomars",
        name: "Bruno Mars",
        img: "images/bruno.jpg",
        category: "usuk"
    },

    {
        id: "theweeknd",
        name: "The Weeknd",
        img: "images/weeknd.jpg",
        category: "usuk"
    },


    // Rap Việt
    {
        id: "mck",
        name: "RPT MCK",
        img: "images/mck.jpg",
        category: "rap"
    },

    {
        id: "karik",
        name: "Karik",
        img: "images/karik.jpg",
        category: "rap"
    },


    // Nhạc trẻ
    {
        id: "amee",
        name: "AMEE",
        img: "images/amee.jpg",
        category: "nhactre"
    },

    {
        id: "erik",
        name: "Erik",
        img: "images/erik.jpg",
        category: "nhactre"
    },


    // Ballad
    {
        id: "haanhtuan",
        name: "Hà Anh Tuấn",
        img: "images/haanhtuan.jpg",
        category: "ballad"
    },


    // EDM
    {
        id: "alanwalker",
        name: "Alan Walker",
        img: "images/alanwalker.jpg",
        category: "edm"
    },


    // Indie / Chill
    {
        id: "ngot",
        name: "Ngọt",
        img: "images/ngot.jpg",
        category: "indie"
    },

    {
        id: "chillies",
        name: "Chillies",
        img: "images/chillies.jpg",
        category: "chill"
    }
];



function initAlbum() {
    const grid = document.getElementById("artist-grid");
    if (!grid) return;

    grid.innerHTML = "";

    for (let artist of artists) {
        const artistCardHtml = `
            <div class="artist-card">
                <a href="#" data-page="album-detail" data-artist="${artist.id}">
                    <img
                        src="${artist.img}"
                        alt="${artist.name}"
                        class="artist-card-img"
                    >
                </a>

                <p class="artist-card-name">
                    <a href="#" data-page="album-detail" data-artist="${artist.id}">
                        ${artist.name}
                    </a>
                </p>
            </div>
        `;

        grid.innerHTML += artistCardHtml;
    }
}