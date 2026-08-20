import { initPlayer } from './music-player.js';
import { initHomePage } from './home.js';

const LAST_PAGE_KEY = 'ou_last_page';
const LAST_ARTIST_ID_KEY = 'ou_last_artist_id';

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

        if (elementId === "header-placeholder" || elementId === "header-container") {
            if (typeof initHeader === 'function') {
                initHeader();
            }
        }
    } catch (error) {
        console.error('Lỗi hệ thống khi tải component:', error);
    }
}

async function loadPage(page, artistId = null) {
    try {
        const pageKey = (page || '').trim().toLowerCase();
        const normalizedPage = pageKey === 'albumdetail' ? 'album-detail' : pageKey;
        const menuPage = ((normalizedPage === 'index' || normalizedPage === '') ? 'home' : normalizedPage);

        let filePath;
        if (normalizedPage === 'index' || normalizedPage === '' || normalizedPage === 'home') {
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

        localStorage.setItem(LAST_PAGE_KEY, normalizedPage);
        if (artistId) {
            localStorage.setItem(LAST_ARTIST_ID_KEY, artistId);
        } else {
            localStorage.removeItem(LAST_ARTIST_ID_KEY);
        }

        // 1. Kích hoạt logic Trang Chủ
        if ((normalizedPage === "index" || normalizedPage === "home" || normalizedPage === "") && typeof initHomePage === 'function') {
            initHomePage();
        }

        document.dispatchEvent(new CustomEvent('spa:pageLoaded', { detail: { page: normalizedPage } }));

    } catch (error) {
        console.error('Lỗi tải nội dung trang:', error);
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = '<p class="text-white p-4">Lỗi tải trang. Vui lòng thử lại.</p>';
        }
    }
}

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
        const artistId = target.getAttribute('data-artist');

        if (page) {
            loadPage(page, artistId);
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Tải toàn bộ khung HTML
        await Promise.all([
            loadComponent("sidebar-placeholder", "./components/sidebar.html"),
            loadComponent("header-placeholder", "./components/header.html"),
            loadComponent("queue-placeholder", "./components/queue.html"),
            loadComponent("player-placeholder", "./components/player.html")
        ]);

        if (typeof initPlayer === 'function') {
            initPlayer();
        }

        attachContentPageListeners();

        const savedPage = localStorage.getItem(LAST_PAGE_KEY) || 'index';
        const savedArtistId = localStorage.getItem(LAST_ARTIST_ID_KEY);

        loadPage(savedPage, savedArtistId);

    } catch (error) {
        console.error("Lỗi khởi tạo giao diện:", error);
    }
});