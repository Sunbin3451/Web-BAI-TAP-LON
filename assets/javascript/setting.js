const BASE_URL = 'https://myt-lh.konnn04.dev';

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  const token = localStorage.getItem("accessToken");

  // Nếu chưa đăng nhập, điều hướng về trang login
  if (!token) {
    alert("Vui lòng đăng nhập để truy cập cài đặt tài khoản.");
    window.location.href = "login.html";
    return;
  }

  // Helper Header đính kèm Bearer Token
  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Hàm lấy thông tin người dùng từ server
  async function fetchUserProfile() {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
        method: "GET",
        headers: authHeaders
      });

      if (response.status === 401) {
        // Token hết hạn
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
        return;
      }

      const result = await response.json();
      if (response.ok && result.data) {
        const user = result.data.user || result.data;
        // Lưu cache lại vào localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
        renderUserUI(user);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin cá nhân:", error);
      // Fallback lấy dữ liệu lưu tạm trong localStorage nếu mất mạng
      const cached = localStorage.getItem("currentUser");
      if (cached) renderUserUI(JSON.parse(cached));
    }
  }

  // Hàm render giao diện profile
  function renderUserUI(user) {
    const avatarNameDisplay = document.getElementById("user-display-name");
    const avatarEmailDisplay = document.getElementById("user-display-email");
    const avatarBtnElement = document.getElementById("user-avatar-btn");

    const displayName = user.displayName || user.fullName || user.username || user.email || "Người dùng";
    const email = user.email || "";

    if (avatarNameDisplay) avatarNameDisplay.textContent = displayName;
    if (avatarEmailDisplay) avatarEmailDisplay.textContent = email;

    if (avatarBtnElement) {
      if (user.avatar) {
        avatarBtnElement.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="this.parentElement.textContent='${displayName.trim().charAt(0).toUpperCase()}'">`;
      } else {
        avatarBtnElement.textContent = displayName.trim().charAt(0).toUpperCase();
      }
    }

    // Đổ dữ liệu vào Modal Chỉnh sửa thông tin
    const nameInput = document.getElementById("profile-name") || document.querySelector('#edit-profile-modal input[type="text"]');
    const emailInput = document.getElementById("profile-email") || document.querySelector('#edit-profile-modal input[type="email"]');
    const genderSelect = document.getElementById("profile-gender") || document.querySelector('#edit-profile-modal select');
    const avatarInput = document.getElementById("profile-avatar");

    if (nameInput) nameInput.value = displayName;
    if (emailInput) emailInput.value = email;
    if (genderSelect && user.gender) genderSelect.value = user.gender;
    if (avatarInput && user.avatar) avatarInput.value = user.avatar;
  }

  // Tải dữ liệu hồ sơ ngay khi vào trang
  await fetchUserProfile();

  // DROPDOWN MENU AVATAR
  const avatarBtn = document.getElementById("user-avatar-btn");
  const dropdownMenu = document.getElementById("user-dropdown-menu");

  if (avatarBtn && dropdownMenu) {
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== avatarBtn) {
        dropdownMenu.classList.add("hidden");
      }
    });
  }

  // MODAL SỬA THÔNG TIN CÁ NHÂN
  const editBtn = document.getElementById("edit-profile-btn");
  const modal = document.getElementById("edit-profile-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const cancelBtn = document.getElementById("cancel-modal-btn");
  const editForm = document.getElementById("edit-profile-form") || document.querySelector("#edit-profile-modal form");

  if (editBtn && modal) {
    editBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });

    const closeModal = () => {
      modal.style.display = "none";
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("profile-name") || document.querySelector('#edit-profile-modal input[type="text"]');
        const newName = nameInput ? nameInput.value.trim() : "";

        if (!newName) {
          alert("Tên hiển thị không được để trống!");
          return;
        }

        // Lưu cập nhật vào localStorage (feature này chưa dùng được, nếu reload trang thì sẽ bị mất và quay về dữ liệu cũ)
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        currentUser.displayName = newName;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        renderUserUI(currentUser);
        alert("Đã cập nhật thông tin thành công!");
        closeModal();
      });
    }
  }

  // ĐỔI MẬT KHẨU QUA API
  const pwdBtn = document.getElementById('change-password-btn');
  const pwdModal = document.getElementById('change-password-modal');
  const closePwdBtn = document.getElementById('close-pwd-modal');
  const cancelPwdBtn = document.getElementById('cancel-pwd-btn');
  const pwdForm = document.getElementById('change-password-form');

  if (pwdBtn && pwdModal) {
    pwdBtn.addEventListener('click', () => {
      pwdModal.style.display = 'flex';
    });
  }

  const closePasswordModal = () => {
    if (pwdModal) pwdModal.style.display = 'none';
    if (pwdForm) pwdForm.reset();
  };

  if (closePwdBtn) closePwdBtn.addEventListener('click', closePasswordModal);
  if (cancelPwdBtn) cancelPwdBtn.addEventListener('click', closePasswordModal);

  if (pwdForm) {
    pwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPwdInput = document.getElementById('new-password');
      const confirmPwdInput = document.getElementById('confirm-password');

      const newPwd = newPwdInput ? newPwdInput.value : '';
      const confirmPwd = confirmPwdInput ? confirmPwdInput.value : '';

      // 1. Kiểm tra rỗng
      if (!newPwd || !confirmPwd) {
        alert('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu!');
        return;
      }

      // 2. Kiểm tra độ dài tối thiểu
      if (newPwd.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
      }

      // 3. Kiểm tra trùng khớp mật khẩu mới
      if (newPwd !== confirmPwd) {
        alert('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
        return;
      }

      const submitBtn = pwdForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Đang đổi mật khẩu...';
      }

      try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/change-password`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            newPassword: newPwd
          })
        });

        const result = await response.json();

        if (response.ok && result.success !== false) {
          alert('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới cho lần đăng nhập sau.');
          closePasswordModal();
        } else {
          alert(result.message || 'Không thể đổi mật khẩu. Vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Lỗi API Đổi mật khẩu:', error);
        alert('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      }
    });
  }

  // MODAL QUẢN LÝ GÓI ĐĂNG KÝ
  const btnManageSub = document.getElementById("btn-manage-subscription");
  const subModal = document.getElementById("subscription-modal");
  const btnCloseSub = document.getElementById("close-sub-modal");

  if (btnManageSub && subModal) {
    btnManageSub.addEventListener("click", () => {
      subModal.style.display = "flex";
    });

    if (btnCloseSub) {
      btnCloseSub.addEventListener("click", () => {
        subModal.style.display = "none";
      });
    }

    subModal.addEventListener("click", (e) => {
      if (e.target === subModal) {
        subModal.style.display = "none";
      }
    });
  }
});