// Event Listeners for Global Logic
document.addEventListener('DOMContentLoaded', () => {
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
