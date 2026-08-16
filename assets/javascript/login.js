const BASE_URL = 'https://myt-lh.konnn04.dev';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('loginError');
    const submitBtn = form?.querySelector('.login__submit-btn') || form?.querySelector('button[type="submit"]') || form?.querySelector('button');

    function showError(message) {
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorEl) errorEl.classList.add('hidden');

        const inputField = document.getElementById('loginUsername') || document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        const usernameOrEmail = inputField?.value.trim();
        const password = passwordInput?.value;

        if (!usernameOrEmail || !password) {
            showError('Vui lòng nhập tên đăng nhập/email và mật khẩu.');
            return;
        }

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner spinner-icon"></i> Đang đăng nhập...';

        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: usernameOrEmail.normalize('NFC'),
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok && result.success !== false) {
                const token = result.data?.token || result.data?.accessToken || result.accessToken || result.token;
                if (token) {
                    localStorage.setItem('accessToken', token);
                }

                const userData = result.data?.user || result.user || { identifier: usernameOrEmail };
                localStorage.setItem('currentUser', JSON.stringify(userData));

                alert('Đăng nhập thành công!');
                window.location.href = 'index.html';
            } else {
                showError(result.message || 'Tên đăng nhập/email hoặc mật khẩu không chính xác.');
            }
        } catch (error) {
            console.error('API Login Error:', error);
            showError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});