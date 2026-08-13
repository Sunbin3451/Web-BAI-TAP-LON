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

        let registeredUser = null;
        try {
            registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
        } catch (err) {
            registeredUser = null;
        }

        function normalizeText(str) {
            return (str || '').normalize('NFC').trim().toLowerCase();
        }

        const matched = registeredUser && (
            normalizeText(registeredUser.username) === normalizeText(usernameOrEmail) ||
            normalizeText(registeredUser.email) === normalizeText(usernameOrEmail)
        );

        if (!matched) {
            showError('Tên đăng nhập/email hoặc mật khẩu không đúng.');
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(registeredUser));
        alert(`Đăng nhập thành công! Chào mừng trở lại, ${registeredUser.username}.`);
        window.location.href = 'index.html';
    });

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
});