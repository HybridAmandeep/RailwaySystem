// Utility functions for IRCTC Clone

// Format date to display string
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Format date with time
function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format running days
function formatRunningDays(days) {
    if (!days) return 'All Days';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.split('').map((d, i) =>
        d !== '-' ? dayNames[i] : ''
    ).filter(Boolean).join(', ');
}

// Show loading spinner
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    }
}

// Show error message
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="alert alert-error">${message}</div>`;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get status color
function getStatusColor(status) {
    switch (status?.toUpperCase()) {
        case 'CONFIRMED': return '#28a745';
        case 'WAITLIST': return '#ffc107';
        case 'CANCELLED': return '#dc3545';
        case 'PENDING': return '#17a2b8';
        default: return '#6c757d';
    }
}

// Parse URL parameters
function getUrlParams() {
    return Object.fromEntries(
        new URLSearchParams(window.location.search).entries()
    );
}

// Calculate journey duration
function calculateDuration(departure, arrival) {
    if (!departure || !arrival) return '--';

    const [depHr, depMin] = departure.split(':').map(Number);
    const [arrHr, arrMin] = arrival.split(':').map(Number);

    let hours = arrHr - depHr;
    let minutes = arrMin - depMin;

    if (minutes < 0) {
        hours -= 1;
        minutes += 60;
    }

    if (hours < 0) {
        hours += 24;
    }

    return `${hours}h ${minutes}m`;
}

// Check if user is logged in
function isLoggedIn() {
    const user = localStorage.getItem('user');
    return user && user !== 'null';
}

// Get current user
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        // Ignore errors
    }
    localStorage.removeItem('user');
    window.location.href = '/';
}
