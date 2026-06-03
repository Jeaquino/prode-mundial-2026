import { elements, state, groupMatches, escapeHtml, matchDateText, stageLabel, api } from "./shared.js";

export function renderPredictions(currentFilter) {
  if (state.session?.role !== "player") {
    elements.predictionList.innerHTML = `
      <div class="empty-state">
        Inicia sesion con tu jugador y PIN para cargar o ver tus pronosticos.
      </div>
    `;
    return;
  }

  const matches = state.matches.filter((match) => {
    if (currentFilter === "open") return match.unlocked && !match.final;
    if (currentFilter === "finished") return match.final;
    return true;
  });
  const groupedMatches = groupMatches(matches);

  elements.predictionList.innerHTML = matches.length
    ? groupedMatches.map(renderPredictionGroup).join("")
    : `<div class="empty-state">No hay partidos para este filtro.</div>`;
}

export function attachPredictionHandlers() {
  elements.predictionList.querySelectorAll("[data-prediction]").forEach((input) => {
    input.addEventListener("change", handlePredictionInput);
  });
}

function renderPredictionGroup(group) {
  return `
    <section class="group-card">
      <header class="group-head">
        <div>
          <span class="group-kicker">${group.kicker}</span>
          <h3>${escapeHtml(group.title)}</h3>
        </div>
        <span class="badge">${group.matches.length} partidos</span>
      </header>
      <div class="group-match-list">
        ${group.matches.map(renderPredictionCard).join("")}
      </div>
    </section>
  `;
}

function renderPredictionCard(match) {
  const prediction = getPrediction(match.id);
  const locked = !match.unlocked || match.final || prediction.locked;
  const status = match.final
    ? `<span class="badge final">Finalizado</span>`
    : prediction.locked
    ? `<span class="badge locked">Confirmado</span>`
    : match.unlocked
    ? `<span class="badge">Abierto</span>`
    : `<span class="badge locked">Bloqueado</span>`;

  return `
    <article class="match-card ${locked ? "locked" : ""}">
      <div class="match-head">
        <div class="match-meta">
          <span>${matchDateText(match)}</span>
          <span>${stageLabel(match)}</span>
          ${match.group ? `<span>Grupo ${match.group}</span>` : ""}
          ${match.venue ? `<span>${escapeHtml(match.venue)}</span>` : ""}
        </div>
        ${status}
      </div>
      <div class="team-line">
        <div class="teams">
          ${escapeHtml(match.home)} <span>vs ${escapeHtml(match.away)}</span>
        </div>
        <div class="score-inputs" aria-label="Pronostico">
          <input data-prediction="home" data-match-id="${match.id}" type="number" min="0" max="20"
            value="${prediction.homeGoals ?? ""}" ${locked ? "disabled" : ""} aria-label="Goles ${escapeHtml(match.home)}" />
          <strong>-</strong>
          <input data-prediction="away" data-match-id="${match.id}" type="number" min="0" max="20"
            value="${prediction.awayGoals ?? ""}" ${locked ? "disabled" : ""} aria-label="Goles ${escapeHtml(match.away)}" />
        </div>
      </div>
      <div class="result-line">
        <span>${match.final ? `Resultado oficial: ${match.homeGoals}-${match.awayGoals}` : prediction.locked ? "Pronostico confirmado" : "Pendiente de resultado oficial"}</span>
      </div>
    </article>
  `;
}

async function handlePredictionInput(event) {
  const input = event.target;
  const matchId = input.dataset.matchId;
  const current = getPrediction(matchId);
  const body = {
    homeGoals: input.dataset.prediction === "home" ? input.value : current.homeGoals,
    awayGoals: input.dataset.prediction === "away" ? input.value : current.awayGoals,
  };

  try {
    Object.assign(state, await api(`/api/predictions/${encodeURIComponent(matchId)}`, {
      method: "POST",
      body,
    }));
  } catch (error) {
    alert(error.message);
    Object.assign(state, await api("/api/state"));
  }
}

function getPrediction(matchId) {
  return state.predictions[matchId] || { homeGoals: null, awayGoals: null, locked: false };
}
