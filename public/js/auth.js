document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            // Loading State
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data));
                    window.location.href = data.role === 'admin' ? '/admin.html' : '/dashboard.html';
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                handleError(err);
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // Register Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            // Loading State
            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, username, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    showSuccess('Registration successful! Please login.');
                    document.getElementById('register-form').reset();
                    // Switch to login tab
                    if (typeof switchTab === 'function') {
                        switchTab('login');
                    }
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                handleError(err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // Show Password Toggle
    const togglePassword = (inputId, iconId) => {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);

        if (input && icon) {
            icon.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);

                // Toggle icon
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    };

    togglePassword('reg-password', 'toggle-reg-password');
    togglePassword('reg-confirm-password', 'toggle-reg-confirm-password');
});
