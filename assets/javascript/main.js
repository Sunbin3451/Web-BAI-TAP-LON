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

// Hàm lấy api data
import { getMusicByQuery, getHomeDashboard } from './api.js';
import { renderSongGrid } from './data-render.js';

document.addEventListener('DOMContentLoaded', async () => {

    const kpopTracks = await getMusicByQuery('K-Pop');
    renderSongGrid(kpopTracks, 'song-grid-container');

    const buttons = document.querySelectorAll('.genre-filters button');
    buttons.forEach(button => {
        button.addEventListener('click', async (e) => {
            buttons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const genre = e.target.textContent.trim();
            const genreTracks = await getMusicByQuery(genre);
            renderSongGrid(genreTracks, 'song-grid-container');
        });
    });
});