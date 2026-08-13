document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo Icon Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // 2. Hàm cập nhật giao diện Header & Form
  function updateHeaderUI() {
    const savedData = localStorage.getItem("currentUser") || localStorage.getItem("registeredUser");
    let user = {
      fullName: "Lê Văn A",
      email: "user@gmail.com",
      avatar: ""
    };

    if (savedData) {
      try {
        user = JSON.parse(savedData);
      } catch (e) {
        console.error("Lỗi đọc dữ liệu người dùng:", e);
      }
    }

    const avatarNameDisplay = document.getElementById("user-display-name");
    const avatarEmailDisplay = document.getElementById("user-display-email");
    const avatarBtnElement = document.getElementById("user-avatar-btn");

    if (avatarNameDisplay) avatarNameDisplay.textContent = user.fullName || user.username || user.name || "Lê Văn A";
    if (avatarEmailDisplay) avatarEmailDisplay.textContent = user.email || "user@gmail.com";

    if (avatarBtnElement) {
      if (user.avatar) {
        avatarBtnElement.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="handleAvatarError(this)">`;
      } else {
        const name = user.fullName || user.username || user.name || "L";
        avatarBtnElement.textContent = name.trim().charAt(0).toUpperCase();
      }
    }

    // Đổ dữ liệu vào Form Chỉnh Sửa
    const nameInput = document.getElementById("profile-name") || document.querySelector('#edit-profile-modal input[type="text"]');
    const emailInput = document.getElementById("profile-email") || document.querySelector('#edit-profile-modal input[type="email"]');
    const avatarInput = document.getElementById("profile-avatar");

    if (nameInput) nameInput.value = user.fullName || user.username || user.name || "";
    if (emailInput) emailInput.value = user.email || "";
    if (avatarInput) avatarInput.value = user.avatar || "";
  }

  setTimeout(updateHeaderUI, 100);

  // 3. Dropdown Menu Avatar
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

  // 4. XỬ LÝ ĐỔI EMAIL & ĐỒNG BỘ CHO ĐĂNG NHẬP (registeredUser)
  const editBtn = document.getElementById("edit-profile-btn");
  const modal = document.getElementById("edit-profile-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const cancelBtn = document.getElementById("cancel-modal-btn");
  const form = document.getElementById("edit-profile-form") || document.querySelector("#edit-profile-modal form");

  if (editBtn && modal) {
    editBtn.addEventListener("click", () => {
      updateHeaderUI(); 
      modal.style.display = "flex";
    });

    const closeModal = () => {
      modal.style.display = "none";
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Đọc dữ liệu cũ từ registeredUser và currentUser
        let registeredUserObj = {};
        let currentUserObj = {};

        try {
          registeredUserObj = JSON.parse(localStorage.getItem('registeredUser')) || {};
        } catch(e) {}

        try {
          currentUserObj = JSON.parse(localStorage.getItem('currentUser')) || {};
        } catch(e) {}

        // Lấy dữ liệu mới từ ô Input
        const nameInput = document.getElementById("profile-name") || document.querySelector('#edit-profile-modal input[type="text"]');
        const emailInput = document.getElementById("profile-email") || document.querySelector('#edit-profile-modal input[type="email"]');
        const avatarInput = document.getElementById("profile-avatar");

        const newName = nameInput ? nameInput.value.trim() : (currentUserObj.fullName || registeredUserObj.fullName || "Người dùng");
        const newEmail = emailInput ? emailInput.value.trim() : (currentUserObj.email || registeredUserObj.email || "");
        const newAvatar = avatarInput ? avatarInput.value.trim() : (currentUserObj.avatar || registeredUserObj.avatar || "");

        if (!newEmail) {
          alert("Email không được để trống!");
          return;
        }

        // Tạo Object đã cập nhật (Giữ nguyên username, password cũ của tài khoản)
        const updatedRegisteredUser = {
          ...registeredUserObj,
          fullName: newName,
          email: newEmail,
          avatar: newAvatar
        };

        const updatedCurrentUser = {
          ...currentUserObj,
          ...registeredUserObj,
          fullName: newName,
          email: newEmail,
          avatar: newAvatar
        };

        // 🌟 QUAN TRỌNG: Lưu trực tiếp vào 'registeredUser' để login.js nhận diện ngay email mới
        localStorage.setItem("registeredUser", JSON.stringify(updatedRegisteredUser));
        
        // Cập nhật phiên đăng nhập hiện tại
        localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

        // Cập nhật giao diện lập tức
        updateHeaderUI();

        alert("Đã đổi Email thành công! Bạn có thể dùng email mới này để đăng nhập.");
        closeModal();
      });
    }
  }

  // 5. Modal Quản lý gói đăng ký
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
// ==========================================
// XỬ LÝ MODAL ĐỔI MẬT KHẨU
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const pwdBtn = document.getElementById('change-password-btn');
  const pwdModal = document.getElementById('change-password-modal');
  const closePwdBtn = document.getElementById('close-pwd-modal');
  const cancelPwdBtn = document.getElementById('cancel-pwd-btn');
  const pwdForm = document.getElementById('change-password-form');

  // 1. Mở Modal khi bấm nút "Đổi mật khẩu"
  if (pwdBtn && pwdModal) {
    pwdBtn.addEventListener('click', () => {
      pwdModal.style.display = 'flex';
    });
  }

  // 2. Hàm đóng Modal & xóa sạch ô nhập
  const closePasswordModal = () => {
    pwdModal.style.display = 'none';
    pwdForm.reset(); // Reset form về trống
  };

  if (closePwdBtn) closePwdBtn.addEventListener('click', closePasswordModal);
  if (cancelPwdBtn) cancelPwdBtn.addEventListener('click', closePasswordModal);

  // 3. Đóng Modal khi bấm ra vùng xám bên ngoài
  window.addEventListener('click', (e) => {
    if (e.target === pwdModal) {
      closePasswordModal();
    }
  });

  // 4. Xử lý khi bấm nút "Lưu / Đổi mật khẩu"
  if (pwdForm) {
    pwdForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Chặn load lại trang

      const oldPwd = document.getElementById('old-password').value;
      const newPwd = document.getElementById('new-password').value;
      const confirmPwd = document.getElementById('confirm-password').value;

      // Check 1: Mật khẩu mới có trùng với xác nhận không
      if (newPwd !== confirmPwd) {
        alert('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
        return;
      }

      // Check 2: Độ dài mật khẩu (ít nhất 6 ký tự)
      if (newPwd.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
      }

      // Check 3: Mật khẩu mới trùng với mật khẩu cũ
      if (oldPwd === newPwd) {
        alert('Mật khẩu mới không được giống mật khẩu hiện tại!');
        return;
      }

      // Thông báo thành công (Ở đây sau này bạn có thể fetch/call API lên Server)
      alert('Đổi mật khẩu thành công!');
      closePasswordModal();
    });
  }
});