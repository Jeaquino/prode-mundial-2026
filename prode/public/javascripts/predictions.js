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
  elements.predictionList.querySelectorAll('.prediction-form').forEach((form) => {
    form.addEventListener('submit', handlePredictionSubmit);
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
      ? `<span class="badge locked">Guardado</span>`
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
      <div class="match-group-label">${match.group ? `Grupo ${match.group}` : 'Eliminacion'}</div>
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
          <button class="button secondary" type="button" data-save-prediction="${match.id}" ${locked ? "disabled" : ""}>Guardar</button>
        </div>
      </div>
      <div class="result-line">
        <span class="prediction-note-inline">${match.final ? `Resultado oficial: ${match.homeGoals}-${match.awayGoals}` : prediction.locked ? "Pronostico guardado y bloqueado" : "Antes de guardar: este pronostico no se podra modificar"}</span>
      </div>
    </article>
  `;
}

async function handlePredictionSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const matchId = form.querySelector('input[name="partido_id"]').value;
  const homeInput = form.querySelector('input[name="goles_local_predicho"]');
  const awayInput = form.querySelector('input[name="goles_visitante_predicho"]');
  const button = form.querySelector('button[type="submit"]');

  try {
    await api('/api/pronosticos', {
      method: 'POST',
      body: {
        partido_id: matchId,
        goles_local_predicho: homeInput.value,
        goles_visitante_predicho: awayInput.value
      },
    });

    homeInput.disabled = true;
    awayInput.disabled = true;
    button.disabled = true;
    button.textContent = 'Guardado';
    form.closest('.prediction-item')?.classList.add('locked');
    const note = form.closest('.prediction-item')?.querySelector('.prediction-note');
    if (note) note.textContent = 'Pronostico ya guardado';
    window.location.hash = 'predictionsPanel';
  } catch (error) {
    alert(error.message);
  }
}


function getPrediction(matchId) {
  return state.predictions[matchId] || { homeGoals: null, awayGoals: null, locked: false };
}
