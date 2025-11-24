const API_URL = '/api';

// Helper to get token
const getToken = () => localStorage.getItem('token');

// Helper to handle errors
const handleError = (err) => {
    console.error(err);
    showToast(err.message || 'An error occurred', 'error');
};

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Helper to show success message
const showSuccess = (msg, alertId = 'alert-box') => {
    const alertBox = document.getElementById(alertId);
    if (alertBox) {
        alertBox.textContent = msg;
        alertBox.className = 'alert alert-success';
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 5000);
    } else {
        alert(msg);
    }
};

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Event Listeners for Auth Pages
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

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
            const role = document.getElementById('reg-role').value;

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, username, email, password, role })
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
            }
        });
    }

    // Check auth on protected pages
    const path = window.location.pathname;
    if (path.includes('dashboard') || path.includes('admin')) {
        const token = getToken();
        if (!token) {
            window.location.href = '/index.html';
        }

        // Display user name
        const user = JSON.parse(localStorage.getItem('user'));
        const userNameEl = document.getElementById('user-name');
        if (userNameEl && user) {
            userNameEl.textContent = user.name;
        }
    }
});
