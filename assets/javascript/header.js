
async function loadHeaderComponent() {
    const headerContainer = document.getElementById("header-container") || document.getElementById("header-placeholder");
    if (!headerContainer || headerContainer.dataset.loaded === "true") return;

    try {
        const response = await fetch("components/header.html");
        if (!response.ok) throw new Error("Không thể tải header component");
        
        const htmlContent = await response.text();
        headerContainer.innerHTML = htmlContent;
        headerContainer.dataset.loaded = "true";
        
        initHeaderEvents();
        renderHeaderUserInfo();
    } catch (error) {
        console.error("Lỗi khi load header:", error);
    }
}

// 2. Render thông tin User từ localStorage
function renderHeaderUserInfo() {
    const userDataStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
    if (!userDataStr) return;

    try {
        const user = JSON.parse(userDataStr);

        const nameEl = document.getElementById("user-display-name");
        const emailEl = document.getElementById("user-display-email");
        const avatarBtn = document.getElementById("user-avatar-btn");

        if (nameEl && (user.fullName || user.name)) {
            nameEl.textContent = user.fullName || user.name;
        }

        if (emailEl && user.email) {
            emailEl.textContent = user.email;
        }

        if (avatarBtn) {
            if (user.avatar) {
                avatarBtn.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="handleAvatarError(this)">`;
            } else {
                const name = user.fullName || user.name || "L";
                avatarBtn.textContent = name.trim().charAt(0).toUpperCase();
            }
        }
    } catch (e) {
        console.error("Lỗi parse dữ liệu người dùng:", e);
    }
}

// 3. Hàm gắn toàn bộ sự kiện trong Header
function initHeaderEvents() {
    const profileBtn = document.getElementById("user-avatar-btn");
    const dropdownMenu = document.getElementById("user-dropdown-menu");

    // Toggle Dropdown Avatar
    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", function (e) {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add("hidden");
            }
        });
    }

    // Nút Cài đặt tài khoản
    const btnOpenSettings = document.getElementById("btn-open-settings");
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener("click", function () {
            window.location.href = "setting.html";
        });
    }

    // 🌟 CHỨC NĂNG 1: ĐĂNG XUẤT
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                // Xóa thông tin đăng nhập trong localStorage
                localStorage.removeItem("currentUser");
                localStorage.removeItem("user");

                // Chuyển hướng sang trang Đăng nhập (Demo)
                window.location.href = "login.html"; 
            }
        });
    }

    // 🌟 CHỨC NĂNG 2: QUÊN MẬT KHẨU (Mở Modal)
    const btnOpenForgot = document.getElementById("btn-open-forgot");
    const forgotModal = document.getElementById("forgot-modal");
    const btnCloseForgot = document.getElementById("btn-close-forgot");
    const forgotForm = document.getElementById("forgot-password-form");

    if (btnOpenForgot && forgotModal) {
        // Mở modal
        btnOpenForgot.addEventListener("click", function () {
            if (dropdownMenu) dropdownMenu.classList.add("hidden"); // Đóng dropdown
            forgotModal.classList.remove("hidden");
        });

        // Đóng modal bằng nút Hủy
        if (btnCloseForgot) {
            btnCloseForgot.addEventListener("click", function () {
                forgotModal.classList.add("hidden");
            });
        }

        // Đóng modal khi click ra ngoài hộp thoại
        forgotModal.addEventListener("click", function (e) {
            if (e.target === forgotModal) {
                forgotModal.classList.add("hidden");
            }
        });

        // Xử lý Form Gửi Yêu Cầu Quên Mật Khẩu
        if (forgotForm) {
            forgotForm.addEventListener("submit", function (e) {
                e.preventDefault();
                const emailInput = document.getElementById("forgot-email-input");
                const email = emailInput ? emailInput.value : "";

                alert(`Đã gửi liên kết khôi phục mật khẩu tới email: ${email}`);
                forgotModal.classList.add("hidden");
                if (emailInput) emailInput.value = ""; // Clear input
            });
        }
    }
}

// 4. Khởi chạy
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHeaderComponent);
} else {
    loadHeaderComponent();
}

window.handleAvatarError = function(img) {
    img.onerror = null;
    img.src = "https://i.pravatar.cc/150?img=11";
};