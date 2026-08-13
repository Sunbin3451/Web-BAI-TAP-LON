document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const errorEl = document.getElementById('registerError');

    const fields = {
        username: { input: document.getElementById('regUsername'), check: document.getElementById('regUsernameCheck') },
        email: { input: document.getElementById('regEmail'), check: document.getElementById('regEmailCheck') },
        password: { input: document.getElementById('regPassword'), check: document.getElementById('regPasswordCheck') },
        confirm: { input: document.getElementById('regConfirmPassword'), check: document.getElementById('regConfirmCheck') },
    };

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    Object.entries(fields).forEach(([key, { input, check }]) => {
        input.addEventListener('input', () => {
            let valid = input.checkValidity() && input.value.trim() !== '';
            if (key === 'email') {
                valid = valid && isValidEmail(input.value.trim());
            }
            check.classList.toggle('text-green-400', valid);
            check.classList.toggle('text-neutral-600', !valid);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorEl.classList.add('hidden');

        const username = fields.username.input.value.trim();
        const email = fields.email.input.value.trim();
        const password = fields.password.input.value;
        const confirmPassword = fields.confirm.input.value;

        if (!username || !email || !password || !confirmPassword) {
            showError('Vui lòng điền đầy đủ tất cả các trường.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Email không đúng định dạng. Vui lòng nhập đúng email (ví dụ: ten@gmail.com).');
            return;
        }

        if (password.length < 6) {
            showError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp.');
            return;
        }

        // TODO: Gọi API đăng ký thật ở đây khi có endpoint
        // Ví dụ: await fetch(`${BASE_URL}/api/v1/auth/register`, { method: 'POST', body: JSON.stringify({ username, email, password }) })

        const normalizedUsername = username.normalize('NFC');
        const normalizedEmail = email.normalize('NFC');
        const userData = { username: normalizedUsername, email: normalizedEmail };

        localStorage.setItem('registeredUser', JSON.stringify(userData)); // Lưu tài khoản, không mất khi đăng xuất
        localStorage.setItem('currentUser', JSON.stringify(userData));    // Đánh dấu đang đăng nhập

        alert(`Đăng ký thành công! Chào mừng ${username}.`);
        window.location.href = 'index.html';
    });

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
});