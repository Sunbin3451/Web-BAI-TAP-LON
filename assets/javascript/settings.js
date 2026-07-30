document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

    function updateHeaderUI() {
      const savedData = localStorage.getItem("currentUser");
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

   
    if (avatarNameDisplay) avatarNameDisplay.textContent = user.fullName || "Lê Văn A";
    if (avatarEmailDisplay) avatarEmailDisplay.textContent = user.email || "user@gmail.com";

    
    if (avatarBtnElement) {
      if (user.avatar) {
        avatarBtnElement.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" onerror="handleAvatarError(this)">`;
      } else {
        const name = user.fullName || "L";
        avatarBtnElement.textContent = name.trim().charAt(0).toUpperCase();
      }
    }

   
    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const avatarInput = document.getElementById("profile-avatar");

    if (nameInput) nameInput.value = user.fullName || "";
    if (emailInput) emailInput.value = user.email || "";
    if (avatarInput && user.avatar) avatarInput.value = user.avatar;
  }

  
  setTimeout(updateHeaderUI, 100);

  
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

 
  const editBtn = document.getElementById("edit-profile-btn");
  const modal = document.getElementById("edit-profile-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const cancelBtn = document.getElementById("cancel-modal-btn");
  const form = document.getElementById("edit-profile-form");

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

        const nameInput = document.getElementById("profile-name");
        const emailInput = document.getElementById("profile-email");
        const avatarInput = document.getElementById("profile-avatar");

       
        const oldDataStr = localStorage.getItem("currentUser");
        let oldAvatar = "";
        if (oldDataStr) {
          try { oldAvatar = JSON.parse(oldDataStr).avatar || ""; } catch(e) {}
        }

        const newName = nameInput ? nameInput.value.trim() : "Lê Văn A";
        const newEmail = emailInput ? emailInput.value.trim() : "user@gmail.com";
        const newAvatar = avatarInput ? avatarInput.value.trim() : oldAvatar;

       
        const updatedUser = {
          fullName: newName,
          email: newEmail,
          avatar: newAvatar
        };

       
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        
        updateHeaderUI();

        alert("Cập nhật thông tin thành công!");
        closeModal();
      });
    }
  }
});


// Dán hoặc cập nhật đoạn này trong file assets/javascript/settings.js

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------
    // XỬ LÝ MODAL QUẢN LÝ GÓI ĐĂNG KÝ
    // ---------------------------------------------
    const btnManageSub = document.getElementById("btn-manage-subscription");
    const subModal = document.getElementById("subscription-modal");
    const btnCloseSub = document.getElementById("close-sub-modal");

    if (btnManageSub && subModal) {
        // Bấm vào mục "Quản lý gói đăng ký" -> Hiện Modal
        btnManageSub.addEventListener("click", () => {
            subModal.style.display = "flex";
        });

        // Bấm nút 'X' -> Ẩn Modal
        if (btnCloseSub) {
            btnCloseSub.addEventListener("click", () => {
                subModal.style.display = "none";
            });
        }

        // Bấm ra vùng đen ngoài Modal -> Ẩn Modal
        subModal.addEventListener("click", (e) => {
            if (e.target === subModal) {
                subModal.style.display = "none";
            }
        });
    }
});