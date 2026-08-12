document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('loginError');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorEl.classList.add('hidden');

        const usernameOrEmail = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!usernameOrEmail || !password) {
            showError('Vui lòng điền đầy đủ tên đăng nhập/email và mật khẩu.');
            return;
        }

        // TODO: Gọi API đăng nhập thật ở đây khi có endpoint
        // Ví dụ: await fetch(`${BASE_URL}/api/v1/auth/login`, { method: 'POST', body: JSON.stringify({ usernameOrEmail, password }) })

        let registeredUser = null;
        try {
            registeredUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (err) {
            registeredUser = null;
        }

        const matched = registeredUser && (
            registeredUser.username === usernameOrEmail ||
            registeredUser.email === usernameOrEmail
        );

        if (!matched) {
            showError('Tên đăng nhập/email hoặc mật khẩu không đúng.');
            return;
        }

        alert(`Đăng nhập thành công! Chào mừng trở lại, ${registeredUser.username}.`);
        window.location.href = 'index.html';
    });

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
});