let currentPage = 1;
const ITEMS_PER_PAGE = 10;

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
        button.addEventListener('click', () => {
            setActiveTab(button.dataset.tab);
            if (button.dataset.tab === 'predictions') {
                loadMatchs(1);
            }
        });
    });

    tabJumpButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setActiveTab(button.dataset.tabJump);
            if (button.dataset.tabJump === 'predictions') {
                loadMatchs(1);
            }
        });
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

async function loadMatchs(page = 1) {
    currentPage = page;
    const container = document.getElementById('matchsTableContainer');
    
    if (!container) {
        console.warn('matchsTableContainer not found');
        return;
    }

    try {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Cargando partidos...</p>';

        const response = await fetch(`/api/matchs/paginate?page=${page}&limit=${ITEMS_PER_PAGE}`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        renderMatchsTable(data, container);
        renderPaginationControls(data, container);
    } catch (error) {
        console.error('Error loading matchs:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #ff6d7a;">
                <p>Error al cargar los partidos: ${error.message}</p>
                <button class="button" onclick="loadMatchs(1)" style="margin-top: 10px;">Reintentar</button>
            </div>
        `;
    }
}

function renderMatchsTable(data, container) {
    if (!data.matchs || data.matchs.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No hay partidos disponibles.</p>';
        return;
    }

    let tableHTML = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: rgba(112, 224, 163, 0.1); border-bottom: 2px solid rgba(112, 224, 163, 0.3);">
                        <th style="padding: 12px; text-align: left; font-weight: 700;">ID</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700;">Fecha y Hora</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700;">Equipo 1</th>
                        <th style="padding: 12px; text-align: center; font-weight: 700;">vs</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700;">Equipo 2</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700;">Estadio</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700;">Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.matchs.forEach((match, index) => {
        const rowBG = index % 2 === 0 ? 'rgba(112, 224, 163, 0.03)' : 'transparent';
        const fecha = new Date(match.fecha_hora).toLocaleString('es-ES');
        const equipoLocal = match.local?.nombre || 'N/A';
        const equipoVisitante = match.visitante?.nombre || 'N/A';
        const estadio = match.estadio?.nombre || 'N/A';
        
        tableHTML += `
            <tr style="background: ${rowBG}; border-bottom: 1px solid rgba(112, 224, 163, 0.1);">
                <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">${match.id}</td>
                <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">${fecha}</td>
                <td style="padding: 12px; color: var(--text);">${equipoLocal}</td>
                <td style="padding: 12px; text-align: center; color: rgba(255, 255, 255, 0.5);">vs</td>
                <td style="padding: 12px; color: var(--text);">${equipoVisitante}</td>
                <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">${estadio}</td>
                <td style="padding: 12px;">
                    <button class="button" style="padding: 8px 12px; font-size: 12px;" onclick="pronosticar(${match.id})">
                        Pronosticar
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

function renderPaginationControls(data, container) {
    const paginationHTML = `
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
            <button 
                class="button" 
                onclick="loadMatchs(1)" 
                style="padding: 8px 12px; font-size: 12px;" 
                ${data.currentPage === 1 ? 'disabled' : ''}
            >
                « Primera
            </button>
            <button 
                class="button" 
                onclick="loadMatchs(${data.currentPage - 1})" 
                style="padding: 8px 12px; font-size: 12px;" 
                ${data.currentPage === 1 ? 'disabled' : ''}
            >
                ‹ Anterior
            </button>
            
            <span style="padding: 8px 12px; color: var(--text); font-weight: 700;">
                Página ${data.currentPage} de ${data.totalPages}
            </span>
            
            <button 
                class="button" 
                onclick="loadMatchs(${data.currentPage + 1})" 
                style="padding: 8px 12px; font-size: 12px;" 
                ${data.currentPage === data.totalPages ? 'disabled' : ''}
            >
                Siguiente ›
            </button>
            <button 
                class="button" 
                onclick="loadMatchs(${data.totalPages})" 
                style="padding: 8px 12px; font-size: 12px;" 
                ${data.currentPage === data.totalPages ? 'disabled' : ''}
            >
                Última »
            </button>
        </div>
    `;

    container.insertAdjacentHTML('afterend', paginationHTML);
}

function pronosticar(matchId) {
    alert(`Pronosticar para el partido ID: ${matchId}`);
    // TODO: Implementar modal o formulario de pronóstico
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

