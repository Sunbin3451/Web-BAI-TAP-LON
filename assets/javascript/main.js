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

    } catch (error) {
        console.error('Lỗi hệ thống:', error);
    }
}

// Hàm tải nội dung động vào #app-content
async function loadPage(page) {
    try {
        let filePath;
        if (page === 'index' || page === '') {
            filePath = './content/home-content.html';
        } else {
            filePath = `./content/${page}-content.html`;
        }

        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Không thể tải trang ${page}`);

        const htmlContent = await response.text();
        const appContent = document.getElementById('app-content');

        if (appContent) {
            appContent.innerHTML = htmlContent;
        }

        setActiveMenu(page);

    } catch (error) {
        console.error('Lỗi tải nội dung:', error);
        document.getElementById('app-content').innerHTML = '<p>Lỗi tải trang. Vui lòng thử lại.</p>';
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

// Khởi tạo ứng dụng
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await Promise.all([
            loadComponent("sidebar-placeholder", "./components/sidebar.html"),
            loadComponent("header-placeholder", "./components/header.html"),
            loadComponent("player-placeholder", "./components/player.html")
        ]);

        loadPage('index');

    } catch (error) {
        console.error("Lỗi tải khung giao diện:", error);
    }
});