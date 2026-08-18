document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Cập nhật giao diện Header & Form
  function updateHeaderUI() {
    const savedData = localStorage.getItem("currentUser") || localStorage.getItem("registeredUser");
    let user = {
      fullName: "Nguyễn Văn A",
      email: "user@gmail.com",
      gender: "Nam",
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
    const genderSelect = document.getElementById("profile-gender") || document.querySelector('#edit-profile-modal select');
    const avatarInput = document.getElementById("profile-avatar");

    if (nameInput) nameInput.value = user.fullName || user.username || user.name || "";
    if (emailInput) emailInput.value = user.email || "";
    if (genderSelect) genderSelect.value = user.gender || "Nam";
    if (avatarInput) avatarInput.value = user.avatar || "";
  }

  setTimeout(updateHeaderUI, 100);

  // Dropdown Menu Avatar
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

  // Xử lý đổi thông tin người dùng (đồng bộ)
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

        // Lấy dữ liệu CŨ trước khi lưu
        const oldName = currentUserObj.fullName || registeredUserObj.fullName || "";
        const oldEmail = currentUserObj.email || registeredUserObj.email || "";
        const oldGender = currentUserObj.gender || registeredUserObj.gender || "Nam";

        // Lấy dữ liệu MỚI từ các ô Input / Select
        const nameInput = document.getElementById("profile-name") || document.querySelector('#edit-profile-modal input[type="text"]');
        const emailInput = document.getElementById("profile-email") || document.querySelector('#edit-profile-modal input[type="email"]');
        const genderSelect = document.getElementById("profile-gender") || document.querySelector('#edit-profile-modal select');
        const avatarInput = document.getElementById("profile-avatar");

        const newName = nameInput ? nameInput.value.trim() : oldName;
        const newEmail = emailInput ? emailInput.value.trim() : oldEmail;
        const newGender = genderSelect ? genderSelect.value : oldGender;
        const newAvatar = avatarInput ? avatarInput.value.trim() : (currentUserObj.avatar || registeredUserObj.avatar || "");

        if (!newEmail) {
          alert("Email không được để trống!");
          return;
        }

        // Kiểm tra xem trường nào bị thay đổi
        const isNameChanged = (newName !== oldName);
        const isEmailChanged = (newEmail !== oldEmail);
        const isGenderChanged = (newGender !== oldGender);

        // Tạo Object đã cập nhật
        const updatedRegisteredUser = {
          ...registeredUserObj,
          fullName: newName,
          email: newEmail,
          gender: newGender,
          avatar: newAvatar
        };

        const updatedCurrentUser = {
          ...currentUserObj,
          ...registeredUserObj,
          fullName: newName,
          email: newEmail,
          gender: newGender,
          avatar: newAvatar
        };

        // Lưu dữ liệu vào LocalStorage
        localStorage.setItem("registeredUser", JSON.stringify(updatedRegisteredUser));
        localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

        // Cập nhật giao diện lập tức
        updateHeaderUI();

        // Tạo thông báo linh hoạt theo các trường vừa đổi
        const changedFields = [];
        if (isNameChanged) changedFields.push("Tên hiển thị");
        if (isEmailChanged) changedFields.push("Email");
        if (isGenderChanged) changedFields.push("Giới tính");

        if (changedFields.length > 0) {
          alert(`Đã cập nhật ${changedFields.join(", ")} thành công!`);
        } else {
          alert("Bạn chưa thay đổi thông tin nào!");
        }

        closeModal();
      });
    }
  }

  // Modal Quản lý gói đăng ký
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

// Đổi mật khẩu
document.addEventListener('DOMContentLoaded', () => {
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
    pwdModal.style.display = 'none';
    pwdForm.reset();
  };

  if (closePwdBtn) closePwdBtn.addEventListener('click', closePasswordModal);
  if (cancelPwdBtn) cancelPwdBtn.addEventListener('click', closePasswordModal);

  window.addEventListener('click', (e) => {
    if (e.target === pwdModal) {
      closePasswordModal();
    }
  });

  if (pwdForm) {
    pwdForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const oldPwd = document.getElementById('old-password').value;
      const newPwd = document.getElementById('new-password').value;
      const confirmPwd = document.getElementById('confirm-password').value;

      let registeredUserObj = {};
      let currentUserObj = {};

      try {
        registeredUserObj = JSON.parse(localStorage.getItem('registeredUser')) || {};
      } catch(e) {}

      try {
        currentUserObj = JSON.parse(localStorage.getItem('currentUser')) || {};
      } catch(e) {}

      const realPassword = currentUserObj.password || registeredUserObj.password || "123456";

      if (oldPwd !== realPassword) {
        alert('Mật khẩu hiện tại không chính xác!');
        return;
      }

      if (newPwd !== confirmPwd) {
        alert('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
        return;
      }

      if (newPwd.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
      }

      if (oldPwd === newPwd) {
        alert('Mật khẩu mới không được giống mật khẩu hiện tại!');
        return;
      }

      const updatedRegisteredUser = {
        ...registeredUserObj,
        password: newPwd
      };

      const updatedCurrentUser = {
        ...currentUserObj,
        password: newPwd
      };

      localStorage.setItem("registeredUser", JSON.stringify(updatedRegisteredUser));
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

      alert('Đổi mật khẩu thành công! Hãy dùng mật khẩu mới cho lần đăng nhập sau.');
      closePasswordModal();
    });
  }
});