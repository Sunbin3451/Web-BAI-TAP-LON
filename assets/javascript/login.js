const BASE_URL = 'https://myt-lh.konnn04.dev';

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. XỬ LÝ ĐĂNG NHẬP (LOGIN)
    // ==========================================
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

    // ==========================================
    // 2. XỬ LÝ QUÊN MẬT KHẨU (FORGOT PASSWORD MODAL)
    // ==========================================
    const forgotLink = document.getElementById('btn-open-forgot') || document.querySelector('.forgot-password-link') || document.querySelector('a[href="#forgot"]');
    const forgotModal = document.getElementById('forgot-modal');
    const closeForgotBtn = document.getElementById('btn-close-forgot');
    const forgotForm = document.getElementById('forgot-password-form');
    const forgotEmailInput = document.getElementById('forgot-email-input');

    // Mở modal khi bấm vào link "Quên mật khẩu?"
    if (forgotLink && forgotModal) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Tự động điền email nếu người dùng đã lỡ gõ vào ô đăng nhập
            const loginInputField = document.getElementById('loginUsername') || document.getElementById('loginEmail');
            if (loginInputField && loginInputField.value && forgotEmailInput) {
                forgotEmailInput.value = loginInputField.value.trim();
            }

            forgotModal.classList.remove('hidden');
        });
    }

    // Đóng modal
    const closeForgotModal = () => {
        if (forgotModal) {
            forgotModal.classList.add('hidden');
            if (forgotEmailInput) forgotEmailInput.value = '';
        }
    };

    if (closeForgotBtn) {
        closeForgotBtn.addEventListener('click', closeForgotModal);
    }

    if (forgotModal) {
        forgotModal.addEventListener('click', (e) => {
            if (e.target === forgotModal) {
                closeForgotModal();
            }
        });
    }

    // Gửi yêu cầu API
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgotEmailInput ? forgotEmailInput.value.trim() : '';

            if (!email) {
                alert('Vui lòng nhập địa chỉ email!');
                return;
            }

            const submitForgotBtn = forgotForm.querySelector('button[type="submit"]');
            const originalText = submitForgotBtn ? submitForgotBtn.innerText : 'Gửi yêu cầu';

            if (submitForgotBtn) {
                submitForgotBtn.disabled = true;
                submitForgotBtn.innerText = 'Đang gửi...';
            }

            try {
                const response = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.normalize('NFC') })
                });

                const resData = await response.json();

                if (response.ok && resData.success !== false) {
                    alert(`Đã gửi liên kết đặt lại mật khẩu đến email: ${email}\nVui lòng kiểm tra hộp thư của bạn.`);
                    closeForgotModal();
                } else {
                    alert(resData.message || 'Email không tồn tại trên hệ thống hoặc không hợp lệ.');
                }
            } catch (err) {
                console.error('Forgot Password API Error:', err);
                alert('Không thể kết nối máy chủ. Vui lòng thử lại sau.');
            } finally {
                if (submitForgotBtn) {
                    submitForgotBtn.disabled = false;
                    submitForgotBtn.innerText = originalText;
                }
            }
        });
    }
});