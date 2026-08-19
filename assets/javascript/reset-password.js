const BASE_URL = 'https://myt-lh.konnn04.dev';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');

    if (!resetToken) {
        alert('Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu token xác thực!');
        window.location.href = 'login.html';
        return;
    }

    const resetForm = document.getElementById('reset-pwd-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitBtn = document.getElementById('btn-submit-reset');

    if (!resetForm) return;

    // Xử lý sự kiện gửi form
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = newPasswordInput ? newPasswordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        // Kiểm tra độ dài mật khẩu tối thiểu
        if (newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
            if (newPasswordInput) newPasswordInput.focus();
            return;
        }

        // Kiểm tra trùng khớp
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            if (confirmPasswordInput) confirmPasswordInput.focus();
            return;
        }

        const originalText = submitBtn ? submitBtn.innerText : 'Xác nhận đặt lại';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Đang xử lý...';
        }

        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: newPassword
                })
            });

            const resData = await response.json();

            if (response.ok && resData.success !== false) {
                alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');
                window.location.href = 'login.html';
            } else {
                alert(resData.message || 'Liên kết đặt lại mật khẩu đã hết hạn (chỉ có hiệu lực trong 10 phút) hoặc không hợp lệ.');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API reset-password:', error);
            alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        }
    });
});