// Hàm set class active cho sidebar dựa vào trang hiện tại
function setActiveMenu(page) {
    const navLinks = document.querySelectorAll('.nav-section a');

    navLinks.forEach(link => {
        link.classList.remove('active');

        const linkPage = link.getAttribute('data-page');

        if (linkPage === page) {
            link.classList.add('active');
        }
    });
}

// Hàm tải component cố định (Header, Sidebar, Player)
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Không thể tải ${filePath}`);

        const htmlContent = await response.text();
        const placeholder = document.getElementById(elementId);

        if (placeholder) {
            placeholder.outerHTML = htmlContent;
        }

        if (elementId === "sidebar-placeholder") {
            attachSidebarListeners();
        }

        if (elementId === "player-placeholder") {
            if (typeof initPlayer === 'function') {
                initPlayer();
            }
        }

        if (elementId === "header-placeholder" || elementId === "header-container") {
            if (typeof initHeader === 'function') {
                initHeader();
            }
        }

    } catch (error) {
        console.error('Lỗi hệ thống:', error);
    }
}

async function loadPage(page, artistId = null) {
    try {
        const pageKey = (page || '').trim().toLowerCase();
        const normalizedPage = pageKey === 'albumdetail' ? 'album-detail' : pageKey;
        const menuPage = normalizedPage === 'album-detail' ? 'album' : normalizedPage;

        let filePath;
        if (normalizedPage === 'index' || normalizedPage === '') {
            filePath = './content/home-content.html';
        } else {
            filePath = `./content/${normalizedPage}-content.html`;
        }

        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Không thể tải trang ${page}`);

        const htmlContent = await response.text();
        const appContent = document.getElementById('app-content');

        if (appContent) {
            appContent.innerHTML = htmlContent;
        }

        setActiveMenu(menuPage);

        // Kích hoạt lại JS tương ứng cho từng trang
        if (normalizedPage === "album") {
            if (typeof initAlbum === 'function') initAlbum();
        }

        // Trang Album Detail - đã nhận artistId an toàn
        if (normalizedPage === "album-detail") {
            if (typeof initAlbumDetail === 'function') {
                initAlbumDetail(artistId);
            }
        }

        // Báo cho các module khác (search.js,...) biết trang nào vừa được load xong
        document.dispatchEvent(new CustomEvent('spa:pageLoaded', { detail: { page: normalizedPage } }));

    } catch (error) {
        console.error('Lỗi tải nội dung:', error);
        document.getElementById('app-content').innerHTML = '<p class="text-white p-4">Lỗi tải trang. Vui lòng thử lại.</p>';
    }
}

// Hàm gắn sự kiện click cho sidebar
function attachSidebarListeners() {
    const navLinks = document.querySelectorAll('.nav-section a[data-page]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const page = link.getAttribute('data-page');
            loadPage(page);
        });
    });
}

function attachContentPageListeners() {
    const appContent = document.getElementById('app-content');

    if (!appContent) return;

    appContent.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page]');

        if (!target) return;

        e.preventDefault();
        const page = target.getAttribute('data-page');
        const artistId = target.getAttribute('data-artist'); // Lấy ID ở đây

        if (page) {
            loadPage(page, artistId); // Truyền ID sang loadPage
        }
    });
}

// Khởi tạo ứng dụng
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await Promise.all([
            loadComponent("sidebar-placeholder", "./components/sidebar.html"),
            loadComponent("header-placeholder", "./components/header.html"),
            loadComponent("player-placeholder", "./components/player.html")
        ]);

        attachContentPageListeners();
        loadPage('index');

    } catch (error) {
        console.error("Lỗi tải khung giao diện:", error);
    }
});