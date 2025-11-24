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
