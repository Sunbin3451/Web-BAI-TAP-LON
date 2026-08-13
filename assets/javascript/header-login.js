setInterval(function () {
    var loginBtn = document.getElementById('headerLoginBtn');
    var profileBox = document.getElementById('headerProfile');

    if (!loginBtn || !profileBox) return;

    var userDataStr = localStorage.getItem('currentUser');
    var hasUser = false;

    if (userDataStr) {
        try {
            var user = JSON.parse(userDataStr);
            if (user && (user.username || user.fullName || user.name)) {
                hasUser = true;
            }
        } catch (e) {
            hasUser = false;
        }
    }

    if (hasUser) {
        loginBtn.classList.add('hidden');
        profileBox.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        profileBox.classList.add('hidden');
    }
}, 300);

document.addEventListener('click', function (e) {
    const avatarBtn = document.getElementById('headerAvatarBtn');
    const logoutMenu = document.getElementById('headerLogoutMenu');
    const logoutBtn = document.getElementById('headerLogoutBtn');

    if (!avatarBtn || !logoutMenu || !logoutBtn) return;

    // Bấm vào avatar -> hiện/ẩn menu đăng xuất
    if (e.target === avatarBtn) {
        logoutMenu.classList.toggle('hidden');
        return;
    }

    // Bấm vào nút "Đăng xuất" -> xóa currentUser, load lại trang
    if (e.target === logoutBtn) {
        localStorage.removeItem('currentUser');  // chỉ xóa phiên đăng nhập, KHÔNG xóa registeredUser
        window.location.reload();
        return;
    }
    // Bấm ra ngoài -> ẩn menu
    if (!logoutMenu.contains(e.target)) {
        logoutMenu.classList.add('hidden');
    }
});