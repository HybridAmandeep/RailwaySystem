// Authentication state management

// Check auth status on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status', { credentials: 'include' });
        const data = await response.json();

        if (data.authenticated) {
            localStorage.setItem('user', JSON.stringify(data.user));
            updateNavForLoggedIn(data.user);
        } else {
            localStorage.removeItem('user');
            updateNavForLoggedOut();
        }
    } catch (error) {
        // Check localStorage as fallback
        const user = localStorage.getItem('user');
        if (user && user !== 'null') {
            updateNavForLoggedIn(JSON.parse(user));
        }
    }
}

// Update navigation for logged in user
function updateNavForLoggedIn(user) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const historyLink = document.getElementById('historyLink');

    if (loginBtn) {
        loginBtn.style.display = 'none';
    }

    if (logoutBtn) {
        logoutBtn.style.display = 'inline';
        logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${user.username}`;
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (historyLink) {
        historyLink.style.display = 'inline';
    }
}

// Update navigation for logged out user
function updateNavForLoggedOut() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const historyLink = document.getElementById('historyLink');

    if (loginBtn) {
        loginBtn.style.display = 'inline';
    }

    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }

    if (historyLink) {
        historyLink.style.display = 'none';
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();

    try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
        // Continue with local logout even if server fails
    }

    localStorage.removeItem('user');
    window.location.href = '/';
}
