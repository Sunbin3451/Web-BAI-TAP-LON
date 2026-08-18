const BASE_URL = 'https://myt-lh.konnn04.dev';

// Hàm khởi tạo sau khi Header đã được nạp vào DOM
function initHeader() {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
    checkAuthStateAndRender();
    initHeaderEvents();
}

// Hàm kiểm tra Đăng nhập & Render thông tin User
async function checkAuthStateAndRender() {
    const loginBtn = document.getElementById('headerLoginBtn');
    const profileBox = document.getElementById('headerProfile') || document.getElementById('headerUserMenu');

    const token = localStorage.getItem("accessToken");
    let user = null;

    const userDataStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
    if (userDataStr) {
        try {
            user = JSON.parse(userDataStr);
        } catch (e) {
            console.error("Lỗi parse dữ liệu người dùng:", e);
        }
    }

    if (token) {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();
            if (response.ok && result.success !== false) {
                user = result.data || result;
                localStorage.setItem("currentUser", JSON.stringify(user));
            } else if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("user");
                user = null;
            }
        } catch (error) {
            console.error("Lỗi gọi API /api/v1/auth/me:", error);
        }
    }

    const hasUser = !!token && !!user;

    if (loginBtn) loginBtn.classList.toggle('hidden', hasUser);
    if (profileBox) profileBox.classList.toggle('hidden', !hasUser);

    if (hasUser) {
        const nameEl = document.getElementById("user-display-name");
        const emailEl = document.getElementById("user-display-email");
        const avatarBtn = document.getElementById("user-avatar-btn") || document.getElementById("headerAvatarBtn");
        const profileAvatarEl = document.getElementById("user-display-avatar");

        const name = user.displayName || user.fullName || user.username || user.name || (user.email ? user.email.split('@')[0] : "Người dùng");
        const initialLetter = name.trim().charAt(0).toUpperCase();

        if (nameEl) nameEl.textContent = name;
        if (emailEl) emailEl.textContent = user.email || "";

        if (avatarBtn) {
            if (user.avatar) {
                avatarBtn.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="this.parentElement.textContent='${initialLetter}'">`;
            } else {
                avatarBtn.textContent = initialLetter;
            }
        }

        if (profileAvatarEl) {
            if (user.avatar) {
                profileAvatarEl.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="this.parentElement.textContent='${initialLetter}'">`;
            } else {
                profileAvatarEl.textContent = initialLetter;
            }
        }
    }
}

// Hàm Gắn sự kiện (Dropdown, Logout, Forgot Password)
function initHeaderEvents() {
    const profileBtn = document.getElementById("user-avatar-btn") || document.getElementById("headerAvatarBtn");
    const dropdownMenu = document.getElementById("user-dropdown-menu") || document.getElementById("headerLogoutMenu");

    if (profileBtn && dropdownMenu) {
        profileBtn.onclick = function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle("hidden");
        };

        document.addEventListener("click", function (e) {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add("hidden");
            }
        });
    }

    const btnOpenSettings = document.getElementById("btn-open-settings");
    if (btnOpenSettings) {
        btnOpenSettings.onclick = function () {
            window.location.href = "setting.html";
        };
    }

    const btnLogout = document.getElementById("btn-logout") || document.getElementById("headerLogoutBtn");
    if (btnLogout) {
        btnLogout.onclick = function () {
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("user");
                localStorage.removeItem("registeredUser");
                window.location.href = "login.html";
            }
        };
    }

    // CHỨC NĂNG QUÊN MẬT KHẨU
    const btnOpenForgot = document.getElementById("btn-open-forgot");
    const forgotModal = document.getElementById("forgot-modal");
    const btnCloseForgot = document.getElementById("btn-close-forgot");
    const forgotForm = document.getElementById("forgot-password-form");
    const emailInput = document.getElementById("forgot-email-input");

    if (btnOpenForgot && forgotModal) {
        btnOpenForgot.onclick = function () {
            if (dropdownMenu) dropdownMenu.classList.add("hidden");

            // Tự động điền sẵn email của user đang đăng nhập nếu có
            const userDataStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
            if (userDataStr && emailInput) {
                try {
                    const currentUser = JSON.parse(userDataStr);
                    if (currentUser.email) {
                        emailInput.value = currentUser.email;
                    }
                } catch (e) {
                    console.error("Lỗi đọc user email:", e);
                }
            }

            forgotModal.classList.remove("hidden");
        };

        // Đóng popup bằng nút Hủy
        if (btnCloseForgot) {
            btnCloseForgot.onclick = function () {
                forgotModal.classList.add("hidden");
            };
        }

        // Đóng popup khi click ra ngoài overlay
        forgotModal.onclick = function (e) {
            if (e.target === forgotModal) {
                forgotModal.classList.add("hidden");
            }
        };

        // Xử lý gửi Form
        if (forgotForm) {
            forgotForm.onsubmit = async function (e) {
                e.preventDefault();
                const email = emailInput ? emailInput.value.trim() : "";

                if (!email) {
                    alert("Vui lòng nhập địa chỉ email!");
                    return;
                }

                const submitBtn = forgotForm.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.innerText : "Gửi yêu cầu";

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Đang gửi liên kết...";
                }

                try {
                    const response = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: email.normalize("NFC")
                        })
                    });

                    const resData = await response.json();

                    if (response.ok && resData.success !== false) {
                        alert(`Đã gửi liên kết khôi phục mật khẩu đến email: ${email}\nVui lòng kiểm tra hộp thư đến (hoặc Spam).`);
                        forgotModal.classList.add("hidden");
                        if (emailInput) emailInput.value = "";
                    } else {
                        alert(resData.message || "Email không tồn tại trên hệ thống hoặc không hợp lệ.");
                    }
                } catch (err) {
                    console.error("Lỗi API Forgot Password:", err);
                    alert("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = originalText;
                    }
                }
            };
        }
    }
}

// Lắng nghe thay đổi đăng nhập từ tab khác
window.addEventListener("storage", checkAuthStateAndRender);