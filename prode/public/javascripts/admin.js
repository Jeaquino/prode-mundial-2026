import { elements, state, groupMatches, escapeHtml, matchDateText, stageLabel } from "./shared.js";

export function renderAdmin() {
  if (state.session?.role !== "admin") {
    elements.adminPlayerForm.classList.add("hidden");
    elements.knockoutForm.classList.add("hidden");
    elements.adminMatchList.innerHTML = `
      <div class="empty-state">
        Entra como admin para crear jugadores, desbloquear partidos y cargar resultados.
      </div>
    `;
    return;
  }

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

export function attachSyncHandlers(adminActionFn, refreshFn) {
  if (!elements.syncWorldCupForm) return;
  elements.syncWorldCupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const response = await adminActionFn('/api/sync/worldcup', { method: 'POST', body: { key: elements.worldCupApiKey.value } }, refreshFn);
      if (elements.syncWorldCupNote) {
        elements.syncWorldCupNote.textContent = response ? `Sincronizado: ${response.inserted} nuevos, ${response.updated} actualizados.` : '';
      }
    } catch (error) {
      if (elements.syncWorldCupNote) elements.syncWorldCupNote.textContent = error.message;
    }
  });
}
