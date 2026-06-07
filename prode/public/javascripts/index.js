document.addEventListener('DOMContentLoaded', function () {
    initTabNavigation();
    initLogoutButton();
});

function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab');
    const tabJumpButtons = document.querySelectorAll('[data-tab-jump]');

    if (tabButtons.length === 0 && tabJumpButtons.length === 0) {
        return;
    }

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => setActiveTab(button.dataset.tab));
    });

    tabJumpButtons.forEach((button) => {
        button.addEventListener('click', () => setActiveTab(button.dataset.tabJump));
    });
}

function setActiveTab(tabName) {
    if (!tabName) return;

    const targetPanel = document.getElementById(`${tabName}Panel`);
    if (!targetPanel) return;

    document.querySelectorAll('.panel').forEach((panel) => {
        panel.classList.toggle('active', panel === targetPanel);
    });

    document.querySelectorAll('.tab').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tabName);
    });
}

function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutButton');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async function (e) {
        if (e) e.preventDefault();

        logoutBtn.disabled = true;
        const originalText = logoutBtn.textContent;
        logoutBtn.textContent = 'Cerrando sesión...';

        let logoutUrl = '/users/logout';
        const parent = logoutBtn.closest('a');
        if (parent && parent.getAttribute('href')) {
            logoutUrl = parent.getAttribute('href');
        }

        try {
            const res = await fetch(logoutUrl, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'text/html, application/json'
                }
            });

            if (res.redirected) {
                window.location.href = res.url;
                return;
            }

            if (res.ok) {
                window.location.href = '/';
                return;
            }

            console.error('Logout failed', res.status);
            logoutBtn.disabled = false;
            logoutBtn.textContent = originalText;
            alert('No se pudo cerrar la sesión. Intenta nuevamente.');
        } catch (err) {
            console.error(err);
            logoutBtn.disabled = false;
            logoutBtn.textContent = originalText;
            alert('Error de red al cerrar sesión.');
        }
    });
}
