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