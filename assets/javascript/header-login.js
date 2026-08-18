//  Hàm nạp component Header
async function loadHeaderComponent() {
    const headerContainer = document.getElementById("header-container") || document.getElementById("header-placeholder");
    if (!headerContainer || headerContainer.dataset.loaded === "true") return;

    try {
        const response = await fetch("components/header.html");
        if (!response.ok) throw new Error("Không thể tải header component");

        const htmlContent = await response.text();
        headerContainer.innerHTML = htmlContent;
        headerContainer.dataset.loaded = "true";

        checkAuthStateAndRender();
        initHeaderEvents();
        startAuthStateWatcher();
    } catch (error) {
        console.error("Lỗi khi load header:", error);
    }
}

//  Hàm kiểm tra Đăng nhập & Render thông tin User
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

    //  Ẩn / Hiện Nút Đăng nhập & Khung Profile trên Header
    if (loginBtn && profileBox) {
        if (hasUser) {
            loginBtn.classList.add('hidden');
            profileBox.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            profileBox.classList.add('hidden');
        }
    }

    //  Render Tên, Email, Avatar vào UI (Bao gồm cả Header & Trang Setting)
    if (hasUser) {
        const nameEl = document.getElementById("user-display-name");
        const emailEl = document.getElementById("user-display-email");
        const avatarBtn = document.getElementById("user-avatar-btn") || document.getElementById("headerAvatarBtn");
        const profileAvatarEl = document.getElementById("user-display-avatar"); // Avatar lớn ở trang Setting

        const name = user.fullName || user.name || user.username || "Lê Văn A";
        const initialLetter = name.trim().charAt(0).toUpperCase();

        if (nameEl) {
            nameEl.textContent = name;
        }

        if (emailEl) {
            emailEl.textContent = user.email || "";
        }

        // Render Avatar nhỏ trên Header
        if (avatarBtn) {
            if (user.avatar) {
                avatarBtn.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="handleAvatarError(this)">`;
            } else {
                avatarBtn.textContent = initialLetter;
            }
        }

        // Render Avatar lớn ở Banner trang Setting.html
        if (profileAvatarEl) {
            if (user.avatar) {
                profileAvatarEl.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="handleAvatarError(this)">`;
            } else {
                profileAvatarEl.textContent = initialLetter;
            }
        }
    }
}

// Chạy lặp kiểm tra định kỳ 300ms để đồng bộ trạng thái
function startAuthStateWatcher() {
    setInterval(checkAuthStateAndRender, 300);
}

// Hàm gắn toàn bộ sự kiện trong Header
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

    //  CHỨC NĂNG 1: ĐĂNG XUẤT
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

    //  CHỨC NĂNG 2: QUÊN MẬT KHẨU (Mở Modal)
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

//  Khởi chạy khi DOM sẵn sàng
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        loadHeaderComponent();
        checkAuthStateAndRender();
        startAuthStateWatcher();
    });
} else {
    loadHeaderComponent();
    checkAuthStateAndRender();
    startAuthStateWatcher();
}

// Lỗi Avatar thay thế bằng hình mặc định
window.handleAvatarError = function (img) {
    img.onerror = null;
    img.src = "https://i.pravatar.cc/150?img=11";
};