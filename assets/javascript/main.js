
// Hàm set class active cho sidebar
function setActiveMenu() {
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '') {
        currentPage = 'index.html';
    }

    const navLinks = document.querySelectorAll('.nav-section a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href').split('/').pop();

        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });
}
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
            setActiveMenu();
        }
        if (elementId === "header-placeholder") {
            updateHeaderAuthState();
        }
    } catch (error) {
        console.error('Lỗi hệ thống:', error);
    }
}

// Cập nhật nút Đăng Nhập / khung Avatar ở header dựa theo trạng thái đăng nhập
function updateHeaderAuthState() {
    const loginBtn = document.getElementById('headerLoginBtn');
    const profileBox = document.getElementById('headerProfile');
    const avatarLetter = document.getElementById('headerAvatarLetter');

    if (!loginBtn || !profileBox) return;

    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        currentUser = null;
    }

    if (currentUser && currentUser.username) {
        profileBox.style.display = 'flex';
        loginBtn.style.display = 'none';
        avatarLetter.textContent = currentUser.username.charAt(0).toUpperCase();
    } else {
        loginBtn.style.display = 'inline-block';
        profileBox.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent("sidebar-placeholder", "./components/sidebar.html");
    loadComponent("header-placeholder", "./components/header.html");
    loadComponent("player-placeholder", "./components/player.html");
});