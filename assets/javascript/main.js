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

    } catch (error) {
        console.error('Lỗi hệ thống:', error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent("sidebar-placeholder", "./components/sidebar.html");
    loadComponent("header-placeholder", "./components/header.html");
    loadComponent("player-placeholder", "./components/player.html");
});