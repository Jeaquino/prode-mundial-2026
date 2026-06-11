import { elements, state, groupMatches, escapeHtml, matchDateText, stageLabel } from "./shared.js";

export function renderAdmin() {

  const users = 
  elements.adminPlayerForm.classList.remove("hidden");
  elements.knockoutForm.classList.remove("hidden");
  elements.adminMatchList.innerHTML = groupMatches(state.matches)
    .map(
      (group) => `
        <section class="group-card admin-group">
          <header class="group-head">
            <div>
              <span class="group-kicker">${group.kicker}</span>
              <h3>${escapeHtml(group.title)}</h3>
            </div>
            <span class="badge">${group.matches.length} partidos</span>
          </header>
          <div class="group-match-list">
            ${group.matches.map(renderAdminMatch).join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

export function attachAdminHandlers(adminActionFn, refreshFn) {
  elements.adminMatchList.querySelectorAll("[data-admin-score]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const match = findMatch(event.target.dataset.matchId);
      const field = event.target.dataset.adminScore === "home" ? "homeGoals" : "awayGoals";
      await patchMatch(match.id, { [field]: event.target.value }, adminActionFn, refreshFn);
      renderAdmin();
      attachAdminHandlers(adminActionFn, refreshFn);
    });
  });

  elements.adminMatchList.querySelectorAll("[data-admin-final]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const match = findMatch(event.target.dataset.matchId);
      await patchMatch(match.id, { final: event.target.checked }, adminActionFn, refreshFn);
      renderAdmin();
      attachAdminHandlers(adminActionFn, refreshFn);
    });
  });

  elements.adminMatchList.querySelectorAll("[data-admin-unlocked]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const match = findMatch(event.target.dataset.matchId);
      await patchMatch(match.id, { unlocked: event.target.checked }, adminActionFn, refreshFn);
      renderAdmin();
      attachAdminHandlers(adminActionFn, refreshFn);
    });
  });

  elements.adminMatchList.querySelectorAll("[data-admin-winner]").forEach((select) => {
    select.addEventListener("change", async (event) => {
      await patchMatch(event.target.dataset.matchId, { winner: event.target.value }, adminActionFn, refreshFn);
      renderAdmin();
      attachAdminHandlers(adminActionFn, refreshFn);
    });
  });
}

function renderAdminMatch(match) {
  const disabled = match.resultLocked ? "disabled" : "";
  const resultNote = match.resultLocked ? `<span class="badge final">Resultado bloqueado</span>` : "";
  return `
    <article class="admin-match">
      <div>
        <strong>${escapeHtml(match.home)} vs ${escapeHtml(match.away)}</strong>
        <div class="match-meta">
          <span>${matchDateText(match)}</span>
          <span>${stageLabel(match)}</span>
          ${match.group ? `<span>Grupo ${match.group}</span>` : ""}
          ${match.venue ? `<span>${escapeHtml(match.venue)}</span>` : ""}
          ${resultNote}
        </div>
      </div>
      <div class="admin-controls">
        <input data-admin-score="home" data-match-id="${match.id}" type="number" min="0" max="20"
          value="${match.homeGoals ?? ""}" ${disabled} aria-label="Resultado ${escapeHtml(match.home)}" />
        <strong>-</strong>
        <input data-admin-score="away" data-match-id="${match.id}" type="number" min="0" max="20"
          value="${match.awayGoals ?? ""}" ${disabled} aria-label="Resultado ${escapeHtml(match.away)}" />
        ${match.stage === "GR" ? "" : renderWinnerSelect(match, disabled)}
        <label><input data-admin-unlocked data-match-id="${match.id}" type="checkbox" ${match.unlocked ? "checked" : ""} ${disabled} /> Abierto</label>
        <label><input data-admin-final data-match-id="${match.id}" type="checkbox" ${match.final ? "checked" : ""} ${disabled} /> Final</label>
      </div>
    </article>
  `;
}

function renderWinnerSelect(match, disabled) {
  return `
    <select data-admin-winner data-match-id="${match.id}" ${disabled} aria-label="Ganador final">
      <option value="">Ganador final</option>
      <option value="home" ${match.winner === "home" ? "selected" : ""}>${escapeHtml(match.home)}</option>
      <option value="away" ${match.winner === "away" ? "selected" : ""}>${escapeHtml(match.away)}</option>
    </select>
  `;
}

async function patchMatch(matchId, body, adminActionFn, refreshFn) {
  await adminActionFn(`/api/admin/matches/${encodeURIComponent(matchId)}`, {
    method: "PATCH",
    body,
  }, refreshFn);
}

function findMatch(matchId) {
  return state.matches.find((match) => match.id === matchId);
}

/* FUNCIONES PARA TABLAS Y MODALES */

export async function loadAndRenderUserTable() {
  const tableBody = document.getElementById("usuariosTableBody");
  try {
    const response = await fetch("/api/usuarios");
    const usuarios = await response.json();
    
    if (usuarios.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios</td></tr>';
      return;
    }

    tableBody.innerHTML = usuarios.map(usuario => `
      <tr>
        <td>${usuario.id}</td>
        <td>${escapeHtml(usuario.nombre)}</td>
        <td>${escapeHtml(usuario.email)}</td>
        <td>${usuario.pin || '-'}</td>
        <td>${usuario.es_admin ? 'Sí' : 'No'}</td>
        <td>${new Date(usuario.createdAt).toLocaleDateString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-small edit" data-edit-user="${usuario.id}">Editar</button>
          </div>
        </td>
      </tr>
    `).join("");

    attachUserTableHandlers(usuarios);
  } catch (error) {
    console.error("Error loading usuarios:", error);
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar usuarios</td></tr>';
  }
}

export async function loadAndRenderPartidoTable() {
  const tableBody = document.getElementById("partidosTableBody");
  try {
    const response = await fetch("/api/partidos");
    const partidos = await response.json();
    
    if (partidos.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay partidos</td></tr>';
      return;
    }

    tableBody.innerHTML = partidos.map(partido => `
      <tr>
        <td>${partido.id}</td>
        <td>${escapeHtml(partido.equipo_local)}</td>
        <td>${escapeHtml(partido.equipo_visitante)}</td>
        <td>${new Date(partido.fecha).toLocaleString()}</td>
        <td>${partido.goles_local !== null ? partido.goles_local : '-'}</td>
        <td>${partido.goles_visitante !== null ? partido.goles_visitante : '-'}</td>
        <td>${partido.resultado_procesado ? 'Procesado' : 'Pendiente'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-small edit" data-edit-partido="${partido.id}">Editar</button>
          </div>
        </td>
      </tr>
    `).join("");

    attachPartidoTableHandlers(partidos);
  } catch (error) {
    console.error("Error loading partidos:", error);
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Error al cargar partidos</td></tr>';
  }
}

function attachUserTableHandlers(usuarios) {
  document.querySelectorAll("[data-edit-user]").forEach(button => {
    button.addEventListener("click", (e) => {
      const usuarioId = parseInt(e.target.dataset.editUser);
      const usuario = usuarios.find(u => u.id === usuarioId);
      if (usuario) {
        openEditUserModal(usuario);
      }
    });
  });
}

function attachPartidoTableHandlers(partidos) {
  document.querySelectorAll("[data-edit-partido]").forEach(button => {
    button.addEventListener("click", (e) => {
      const partidoId = parseInt(e.target.dataset.editPartido);
      const partido = partidos.find(p => p.id === partidoId);
      if (partido) {
        openEditPartidoModal(partido);
      }
    });
  });
}

function openEditUserModal(usuario) {
  document.getElementById("editUserId").value = usuario.id;
  document.getElementById("editUserName").value = usuario.nombre;
  document.getElementById("editUserEmail").value = usuario.email;
  document.getElementById("editUserPin").value = usuario.pin || "";
  document.getElementById("editUserAdmin").checked = usuario.es_admin;
  
  const modal = document.getElementById("editUserModal");
  modal.classList.add("active");
}

function openEditPartidoModal(partido) {
  document.getElementById("editPartidoId").value = partido.id;
  document.getElementById("editPartidoLocal").value = partido.equipo_local;
  document.getElementById("editPartidoVisitante").value = partido.equipo_visitante;
  
  const fecha = new Date(partido.fecha);
  const fechaStr = fecha.toISOString().slice(0, 16);
  document.getElementById("editPartidoFecha").value = fechaStr;
  
  document.getElementById("editPartidoGolesLocal").value = partido.goles_local || "";
  document.getElementById("editPartidoGolesVisitante").value = partido.goles_visitante || "";
  
  const modal = document.getElementById("editPartidoModal");
  modal.classList.add("active");
}

export function setupModalHandlers() {
  // Cerrar modales con botones
  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", (e) => {
      const modalId = e.target.dataset.closeModal;
      document.getElementById(modalId).classList.remove("active");
    });
  });

  // Cerrar modales al hacer click fuera
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Manejar envío del formulario de usuario
  const editUserForm = document.getElementById("editUserForm");
  if (editUserForm) {
    editUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const usuarioId = document.getElementById("editUserId").value;
      const data = {
        nombre: document.getElementById("editUserName").value,
        email: document.getElementById("editUserEmail").value,
        pin: document.getElementById("editUserPin").value,
        es_admin: document.getElementById("editUserAdmin").checked
      };

      try {
        const response = await fetch(`/api/usuarios/${usuarioId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          document.getElementById("editUserModal").classList.remove("active");
          await loadAndRenderUserTable();
        } else {
          alert("Error al actualizar usuario");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar usuario");
      }
    });
  }

  // Manejar envío del formulario de partido
  const editPartidoForm = document.getElementById("editPartidoForm");
  if (editPartidoForm) {
    editPartidoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const partidoId = document.getElementById("editPartidoId").value;
      const data = {
        equipo_local: document.getElementById("editPartidoLocal").value,
        equipo_visitante: document.getElementById("editPartidoVisitante").value,
        fecha: document.getElementById("editPartidoFecha").value,
        goles_local: document.getElementById("editPartidoGolesLocal").value || null,
        goles_visitante: document.getElementById("editPartidoGolesVisitante").value || null
      };

      try {
        const response = await fetch(`/api/partidos/${partidoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          document.getElementById("editPartidoModal").classList.remove("active");
          await loadAndRenderPartidoTable();
        } else {
          alert("Error al actualizar partido");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar partido");
      }
    });
  }
}
