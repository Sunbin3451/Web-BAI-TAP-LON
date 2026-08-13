// 1. Hàm nạp component Header
async function loadHeaderComponent() {
    const headerContainer = document.getElementById("header-container") || document.getElementById("header-placeholder");
    if (!headerContainer || headerContainer.dataset.loaded === "true") return;

    try {
        const response = await fetch("components/header.html");
        if (!response.ok) throw new Error("Không thể tải header component");

        const htmlContent = await response.text();
        headerContainer.innerHTML = htmlContent;
        headerContainer.dataset.loaded = "true";

        // Khởi tạo trạng thái Đăng nhập & sự kiện sau khi load xong Header
        checkAuthStateAndRender();
        initHeaderEvents();

        // Chạy kiểm tra định kỳ để đồng bộ trạng thái UI (Chức năng từ bạn của bạn)
        startAuthStateWatcher();
    } catch (error) {
        console.error("Lỗi khi load header:", error);
    }
}

// 2. Hàm kiểm tra Đăng nhập & Render thông tin User (Gộp logic cả 2)
function checkAuthStateAndRender() {
    const loginBtn = document.getElementById('headerLoginBtn');
    const profileBox = document.getElementById('headerProfile');

    const userDataStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
    let user = null;

    if (userDataStr) {
        try {
            user = JSON.parse(userDataStr);
        } catch (e) {
            console.error("Lỗi parse dữ liệu người dùng:", e);
        }
    }

    const hasUser = user && (user.username || user.fullName || user.name || user.email);

    // 👉 Ẩn / Hiện Nút Đăng nhập & Khung Profile (Code của bạn bạn)
    if (loginBtn && profileBox) {
        if (hasUser) {
            loginBtn.classList.add('hidden');
            profileBox.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            profileBox.classList.add('hidden');
        }
    }

    // 👉 Render Tên, Email, Avatar vào UI (Code của bạn)
    if (hasUser) {
        const nameEl = document.getElementById("user-display-name");
        const emailEl = document.getElementById("user-display-email");
        const avatarBtn = document.getElementById("user-avatar-btn") || document.getElementById("headerAvatarBtn");

        if (nameEl) {
            nameEl.textContent = user.fullName || user.name || user.username || "Lê Văn A";
        }

        if (emailEl) {
            emailEl.textContent = user.email || "";
        }

        if (avatarBtn) {
            if (user.avatar) {
                avatarBtn.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="handleAvatarError(this)">`;
            } else {
                const name = user.fullName || user.name || user.username || "L";
                avatarBtn.textContent = name.trim().charAt(0).toUpperCase();
            }
        }
    }
}

// 👉 Chạy lặp kiểm tra định kỳ 300ms (Code của bạn bạn)
function startAuthStateWatcher() {
    setInterval(checkAuthStateAndRender, 300);
}

// 3. Hàm gắn toàn bộ sự kiện trong Header
function initHeaderEvents() {
    const profileBtn = document.getElementById("user-avatar-btn") || document.getElementById("headerAvatarBtn");
    const dropdownMenu = document.getElementById("user-dropdown-menu") || document.getElementById("headerLogoutMenu");

    // Toggle Menu Dropdown Avatar
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
    const btnLogout = document.getElementById("btn-logout") || document.getElementById("headerLogoutBtn");
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                localStorage.removeItem("currentUser");
                localStorage.removeItem("user");
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

        // Form Gửi Yêu Cầu Quên Mật Khẩu
        if (forgotForm) {
            forgotForm.addEventListener("submit", function (e) {
                e.preventDefault();
                const emailInput = document.getElementById("forgot-email-input");
                const email = emailInput ? emailInput.value : "";

                alert(`Đã gửi liên kết khôi phục mật khẩu tới email: ${email}`);
                forgotModal.classList.add("hidden");
                if (emailInput) emailInput.value = "";
            });
        }
    }
}

// 4. Khởi chạy khi DOM sẵn sàng
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHeaderComponent);
} else {
    loadHeaderComponent();
}

// Lỗi Avatar thay thế bằng hình mặc định
window.handleAvatarError = function (img) {
    img.onerror = null;
    img.src = "https://i.pravatar.cc/150?img=11";
};