// Hàm tải thành phần (Giữ nguyên không sửa)
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Không thể tải ${filePath}`);
        }

        const htmlContent = await response.text();
        const placeholder = document.getElementById(elementId);

        if (placeholder) {
            placeholder.outerHTML = htmlContent;
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
document.addEventListener("click", (e) => {
    console.log("Đã click vào:", e.target);
    const playlistLink = e.target.closest("#playlist-link");
    console.log("playlistLink tìm được:", playlistLink);
    if (playlistLink) {
        e.preventDefault();
        console.log("default-view:", document.getElementById("default-view"));
        console.log("playlist-view:", document.getElementById("playlist-view"));
        document.getElementById("default-view")?.classList.add("hidden");
        document.getElementById("playlist-view")?.classList.remove("hidden");
    }
});