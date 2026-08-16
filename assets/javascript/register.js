const BASE_URL = 'https://myt-lh.konnn04.dev';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const errorEl = document.getElementById('registerError');
    const submitBtn = form?.querySelector('.register__submit-btn') || form?.querySelector('button');

    // OTP Modal elements
    const otpModal = document.getElementById('otpModal');
    const closeOtpModal = document.getElementById('closeOtpModal');
    const otpForm = document.getElementById('otpForm');
    const otpInput = document.getElementById('otpInput');
    const otpTargetEmail = document.getElementById('otpTargetEmail');
    const otpError = document.getElementById('otpError');
    const btnVerifyOtp = document.getElementById('btnVerifyOtp');
    const btnResendOtp = document.getElementById('btnResendOtp');
    const resendCountdown = document.getElementById('resendCountdown');
    const timerText = document.getElementById('timerText');

    let currentEmailForOtp = '';
    let currentPasswordForOtp = '';
    let currentUsernameForOtp = '';
    let countdownInterval = null;

    const fields = {
        username: { input: document.getElementById('regUsername'), check: document.getElementById('regUsernameCheck') },
        email: { input: document.getElementById('regEmail'), check: document.getElementById('regEmailCheck') },
        password: { input: document.getElementById('regPassword'), check: document.getElementById('regPasswordCheck') },
        confirm: { input: document.getElementById('regConfirmPassword'), check: document.getElementById('regConfirmCheck') },
    };

    // 1. CÁC HÀM REGEX VALIDATION
    function isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPassword(password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&._-]{8,}$/;
        return passwordRegex.test(password);
    }

    function showError(message) {
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    function showOtpError(message) {
        if (!otpError) return;
        otpError.textContent = message;
        otpError.classList.remove('hidden');
    }

    // KIỂM TRA DỮ LIỆU NHẬP
    Object.entries(fields).forEach(([key, { input, check }]) => {
        if (!input || !check) return;

        input.addEventListener('input', () => {
            let valid = false;
            const val = input.value;

            if (key === 'username') {
                valid = isValidUsername(val.trim());
            } else if (key === 'email') {
                valid = isValidEmail(val.trim());
            } else if (key === 'password') {
                valid = isValidPassword(val);

                if (fields.confirm.input.value) {
                    const confirmValid = fields.confirm.input.value === val && val !== '';
                    fields.confirm.check.classList.toggle('text-green-400', confirmValid);
                    fields.confirm.check.classList.toggle('text-neutral-600', !confirmValid);
                }
            } else if (key === 'confirm') {
                valid = val === fields.password.input.value && val !== '' && isValidPassword(fields.password.input.value);
            }

            check.classList.toggle('text-green-400', valid);
            check.classList.toggle('text-neutral-600', !valid);
        });
    });

    // RESEND COUNTDOWN
    function startResendCountdown() {
        clearInterval(countdownInterval);
        let timeLeft = 60;
        btnResendOtp.disabled = true;
        resendCountdown?.classList.remove('hidden');
        if (timerText) timerText.textContent = timeLeft;

        countdownInterval = setInterval(() => {
            timeLeft--;
            if (timerText) timerText.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                btnResendOtp.disabled = false;
                resendCountdown?.classList.add('hidden');
            }
        }, 1000);
    }

    // Đóng Modal OTP
    closeOtpModal?.addEventListener('click', () => {
        clearInterval(countdownInterval);
        otpModal?.classList.add('hidden');
    });

    // Xử lý form đăng ký
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorEl) errorEl.classList.add('hidden');

        const username = fields.username.input.value.trim();
        const email = fields.email.input.value.trim();
        const password = fields.password.input.value;
        const confirmPassword = fields.confirm.input.value;

        if (!username || !email || !password || !confirmPassword) {
            showError('Vui lòng điền đầy đủ tất cả các trường.');
            return;
        }

        if (!isValidUsername(username)) {
            showError('Tên đăng nhập từ 3-20 ký tự, viết liền không dấu và không chứa ký tự đặc biệt.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Email không đúng định dạng. Vui lòng nhập đúng email (ví dụ: ten@gmail.com).');
            return;
        }

        if (!isValidPassword(password)) {
            showError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp.');
            return;
        }

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang đăng ký...';

        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: username,
                    email: email.normalize('NFC'),
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok && result.success !== false) {
                currentEmailForOtp = email;
                currentUsernameForOtp = username;
                currentPasswordForOtp = password;

                if (otpTargetEmail) otpTargetEmail.textContent = email;
                if (otpInput) otpInput.value = '';
                if (otpError) otpError.classList.add('hidden');

                otpModal?.classList.remove('hidden');
                startResendCountdown();
            } else {
                // Check if email is already pending verification or registered
                const isExisting = response.status === 400 ||
                    result.statusCode === 400 ||
                    result.message?.toLowerCase().includes('exist') ||
                    result.message?.toLowerCase().includes('already');

                if (isExisting) {
                    const wantVerify = confirm('Email này đã được đăng ký hoặc đang chờ xác thực OTP. Bạn có muốn mở lại khung nhập mã OTP không?');
                    if (wantVerify) {
                        currentEmailForOtp = email;
                        currentUsernameForOtp = username;
                        currentPasswordForOtp = password;

                        if (otpTargetEmail) otpTargetEmail.textContent = email;
                        if (otpInput) otpInput.value = '';
                        if (otpError) otpError.classList.add('hidden');

                        otpModal?.classList.remove('hidden');
                        startResendCountdown();
                        return;
                    }
                }

                showError(result.message || 'Đăng ký không thành công. Email có thể đã được sử dụng.');
            }
        } catch (error) {
            console.error('API Register Error:', error);
            showError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Resend OTP
    btnResendOtp?.addEventListener('click', async () => {
        btnResendOtp.disabled = true;
        if (otpError) otpError.classList.add('hidden');

        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentEmailForOtp
                })
            });

            const result = await response.json();

            if (response.ok && result.success !== false) {
                alert('Mã OTP mới đã được gửi vào email của bạn!');
                startResendCountdown();
            } else {
                btnResendOtp.disabled = false;
                showOtpError(result.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
            }
        } catch (error) {
            btnResendOtp.disabled = false;
            console.error('API Resend OTP Error:', error);
            showOtpError('Lỗi kết nối máy chủ khi gửi lại mã.');
        }
    });

    // Verify OTP
    otpForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (otpError) otpError.classList.add('hidden');

        const otpCode = otpInput?.value.trim();
        if (!otpCode) {
            showOtpError('Vui lòng nhập mã OTP.');
            return;
        }

        const originalOtpBtnText = btnVerifyOtp.innerHTML;
        btnVerifyOtp.disabled = true;
        btnVerifyOtp.innerHTML = '<i class="fa-solid fa-spinner spinner-icon"></i> Đang xác thực...';

        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentEmailForOtp,
                    token: otpCode
                })
            });

            const result = await response.json();

            if (response.ok && result.success !== false) {
                const token = result.data?.token || result.data?.accessToken || result.token || result.accessToken;
                if (token) {
                    localStorage.setItem('accessToken', token);
                }

                alert('Xác thực tài khoản thành công!');
                window.location.href = 'index.html';
            } else {
                showOtpError(result.message || 'Mã OTP không đúng hoặc đã hết hạn.');
            }
        } catch (error) {
            console.error('API Verify OTP Error:', error);
            showOtpError('Lỗi kết nối máy chủ xác thực.');
        } finally {
            btnVerifyOtp.disabled = false;
            btnVerifyOtp.innerHTML = originalOtpBtnText;
        }
    });
});