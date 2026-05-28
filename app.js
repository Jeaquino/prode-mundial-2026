const STORAGE_KEY = "prode-mundial-2026-state-v1";

const GROUPS = {
  A: ["Mexico", "Sudafrica", "Corea del Sur", "Chequia"],
  B: ["Canada", "Suiza", "Qatar", "Bosnia y Herzegovina"],
  C: ["Brasil", "Marruecos", "Haiti", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquia"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Paises Bajos", "Japon", "Tunez", "Suecia"],
  G: ["Belgica", "Egipto", "Iran", "Nueva Zelanda"],
  H: ["Espana", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "Noruega", "Irak"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "Uzbekistan", "Colombia", "RD Congo"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panama"],
};

const state = loadState();
let currentFilter = "open";

const elements = {
  playerSelect: document.querySelector("#playerSelect"),
  addPlayerButton: document.querySelector("#addPlayerButton"),
  playerDialog: document.querySelector("#playerDialog"),
  playerForm: document.querySelector("#playerForm"),
  cancelPlayerButton: document.querySelector("#cancelPlayerButton"),
  playerName: document.querySelector("#playerName"),
  predictionList: document.querySelector("#predictionList"),
  rankingList: document.querySelector("#rankingList"),
  adminMatchList: document.querySelector("#adminMatchList"),
  unlockNextButton: document.querySelector("#unlockNextButton"),
  knockoutForm: document.querySelector("#knockoutForm"),
  knockoutHome: document.querySelector("#knockoutHome"),
  knockoutAway: document.querySelector("#knockoutAway"),
  knockoutRound: document.querySelector("#knockoutRound"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  totalPlayers: document.querySelector("#totalPlayers"),
  openMatches: document.querySelector("#openMatches"),
  finishedMatches: document.querySelector("#finishedMatches"),
  leaderPoints: document.querySelector("#leaderPoints"),
};

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}Panel`).classList.add("active");
  });
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    renderPredictions();
  });
});

elements.addPlayerButton.addEventListener("click", () => {
  elements.playerName.value = "";
  elements.playerDialog.showModal();
  elements.playerName.focus();
});

elements.cancelPlayerButton.addEventListener("click", () => elements.playerDialog.close());

elements.playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.playerName.value.trim();
  if (!name) return;
  const id = crypto.randomUUID();
  state.players.push({ id, name });
  state.activePlayerId = id;
  saveAndRender();
  elements.playerDialog.close();
});

elements.playerSelect.addEventListener("change", (event) => {
  state.activePlayerId = event.target.value;
  saveAndRender();
});

elements.unlockNextButton.addEventListener("click", () => {
  const nextLocked = state.matches.filter((match) => !match.unlocked).slice(0, 12);
  nextLocked.forEach((match) => {
    match.unlocked = true;
  });
  saveAndRender();
});

elements.knockoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const home = elements.knockoutHome.value.trim();
  const away = elements.knockoutAway.value.trim();
  if (!home || !away) return;
  state.matches.push({
    id: `ko-${crypto.randomUUID()}`,
    stage: elements.knockoutRound.value,
    group: null,
    home,
    away,
    unlocked: true,
    final: false,
    homeGoals: null,
    awayGoals: null,
    winner: "",
  });
  elements.knockoutForm.reset();
  saveAndRender();
});

elements.exportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prode-mundial-2026.json";
  link.click();
  URL.revokeObjectURL(url);
});

elements.importInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const imported = JSON.parse(await file.text());
  Object.assign(state, imported);
  ensureShape(state);
  saveAndRender();
  event.target.value = "";
});

function createInitialState() {
  const matches = [];
  Object.entries(GROUPS).forEach(([group, teams]) => {
    const pairings = [
      [0, 1],
      [2, 3],
      [0, 2],
      [1, 3],
      [0, 3],
      [1, 2],
    ];
    pairings.forEach(([homeIndex, awayIndex], roundIndex) => {
      matches.push({
        id: `${group}-${roundIndex + 1}`,
        stage: "GR",
        group,
        home: teams[homeIndex],
        away: teams[awayIndex],
        unlocked: roundIndex < 2,
        final: false,
        homeGoals: null,
        awayGoals: null,
        winner: "",
      });
    });
  });

  const firstPlayerId = crypto.randomUUID();
  return {
    activePlayerId: firstPlayerId,
    players: [{ id: firstPlayerId, name: "Yo" }],
    predictions: {},
    matches,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      ensureShape(saved);
      return saved;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return createInitialState();
}

function ensureShape(data) {
  data.players ||= [];
  data.predictions ||= {};
  data.matches ||= [];
  if (!data.players.length) {
    const id = crypto.randomUUID();
    data.players.push({ id, name: "Yo" });
    data.activePlayerId = id;
  }
  data.activePlayerId ||= data.players[0].id;
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function render() {
  renderPlayers();
  renderSummary();
  renderPredictions();
  renderRanking();
  renderAdmin();
}

function renderPlayers() {
  elements.playerSelect.innerHTML = state.players
    .map((player) => `<option value="${player.id}">${escapeHtml(player.name)}</option>`)
    .join("");
  elements.playerSelect.value = state.activePlayerId;
}

function renderSummary() {
  const leaderboard = calculateLeaderboard();
  elements.totalPlayers.textContent = state.players.length;
  elements.openMatches.textContent = state.matches.filter((match) => match.unlocked && !match.final).length;
  elements.finishedMatches.textContent = state.matches.filter((match) => match.final).length;
  elements.leaderPoints.textContent = leaderboard[0]?.points ?? 0;
}

function renderPredictions() {
  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);
  if (!activePlayer) return;

  const matches = state.matches.filter((match) => {
    if (currentFilter === "open") return match.unlocked && !match.final;
    if (currentFilter === "finished") return match.final;
    return true;
  });

  elements.predictionList.innerHTML = matches.length
    ? matches.map((match) => renderPredictionCard(match, activePlayer.id)).join("")
    : `<div class="empty-state">No hay partidos para este filtro.</div>`;

  elements.predictionList.querySelectorAll("[data-prediction]").forEach((input) => {
    input.addEventListener("input", handlePredictionInput);
  });
}

function renderPredictionCard(match, playerId) {
  const prediction = getPrediction(playerId, match.id);
  const locked = !match.unlocked || match.final;
  const score = match.final ? scorePrediction(prediction, match) : null;
  const status = match.final
    ? `<span class="badge final">Finalizado</span>`
    : match.unlocked
      ? `<span class="badge">Abierto</span>`
      : `<span class="badge locked">Bloqueado</span>`;

  return `
    <article class="match-card ${locked ? "locked" : ""}">
      <div class="match-head">
        <div class="match-meta">
          <span>${stageLabel(match)}</span>
          ${match.group ? `<span>Grupo ${match.group}</span>` : ""}
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
        <span>${match.final ? `Resultado oficial: ${match.homeGoals}-${match.awayGoals}` : "Pendiente de resultado oficial"}</span>
        <strong class="points ${score?.points < 0 ? "negative" : ""}">${score ? `${score.points} pts` : ""}</strong>
      </div>
    </article>
  `;
}

function handlePredictionInput(event) {
  const input = event.target;
  const matchId = input.dataset.matchId;
  const field = input.dataset.prediction === "home" ? "homeGoals" : "awayGoals";
  const prediction = getPrediction(state.activePlayerId, matchId);
  prediction[field] = input.value === "" ? null : Number(input.value);
  saveAndRender();
}

function getPrediction(playerId, matchId) {
  state.predictions[playerId] ||= {};
  state.predictions[playerId][matchId] ||= { homeGoals: null, awayGoals: null };
  return state.predictions[playerId][matchId];
}

function renderRanking() {
  const leaderboard = calculateLeaderboard();
  elements.rankingList.innerHTML = leaderboard
    .map(
      (row, index) => `
        <article class="ranking-row">
          <span class="rank-number">${index + 1}</span>
          <div class="rank-info">
            <strong>${escapeHtml(row.name)}</strong>
            <span>${row.hits} aciertos con puntos sobre ${row.played} partidos finalizados</span>
          </div>
          <strong class="points">${row.points} pts</strong>
        </article>
      `,
    )
    .join("");
}

function calculateLeaderboard() {
  return state.players
    .map((player) => {
      const scores = state.matches
        .filter((match) => match.final)
        .map((match) => scorePrediction(getPrediction(player.id, match.id), match));
      return {
        ...player,
        points: scores.reduce((total, score) => total + score.points, 0),
        hits: scores.filter((score) => score.points > 0).length,
        played: scores.length,
      };
    })
    .sort((a, b) => b.points - a.points || b.hits - a.hits || a.name.localeCompare(b.name));
}

function renderAdmin() {
  elements.adminMatchList.innerHTML = state.matches.map(renderAdminMatch).join("");

  elements.adminMatchList.querySelectorAll("[data-admin-score]").forEach((input) => {
    input.addEventListener("input", handleAdminScoreInput);
  });
  elements.adminMatchList.querySelectorAll("[data-admin-final]").forEach((input) => {
    input.addEventListener("change", handleAdminToggle);
  });
  elements.adminMatchList.querySelectorAll("[data-admin-unlocked]").forEach((input) => {
    input.addEventListener("change", handleAdminToggle);
  });
  elements.adminMatchList.querySelectorAll("[data-admin-winner]").forEach((select) => {
    select.addEventListener("change", handleAdminWinner);
  });
}

function renderAdminMatch(match) {
  return `
    <article class="admin-match">
      <div>
        <strong>${escapeHtml(match.home)} vs ${escapeHtml(match.away)}</strong>
        <div class="match-meta">
          <span>${stageLabel(match)}</span>
          ${match.group ? `<span>Grupo ${match.group}</span>` : ""}
        </div>
      </div>
      <div class="admin-controls">
        <input data-admin-score="home" data-match-id="${match.id}" type="number" min="0" max="20"
          value="${match.homeGoals ?? ""}" aria-label="Resultado ${escapeHtml(match.home)}" />
        <strong>-</strong>
        <input data-admin-score="away" data-match-id="${match.id}" type="number" min="0" max="20"
          value="${match.awayGoals ?? ""}" aria-label="Resultado ${escapeHtml(match.away)}" />
        ${match.stage === "GR" ? "" : renderWinnerSelect(match)}
        <label><input data-admin-unlocked data-match-id="${match.id}" type="checkbox" ${match.unlocked ? "checked" : ""} /> Abierto</label>
        <label><input data-admin-final data-match-id="${match.id}" type="checkbox" ${match.final ? "checked" : ""} /> Final</label>
      </div>
    </article>
  `;
}

function renderWinnerSelect(match) {
  return `
    <select data-admin-winner data-match-id="${match.id}" aria-label="Ganador final">
      <option value="">Ganador final</option>
      <option value="home" ${match.winner === "home" ? "selected" : ""}>${escapeHtml(match.home)}</option>
      <option value="away" ${match.winner === "away" ? "selected" : ""}>${escapeHtml(match.away)}</option>
    </select>
  `;
}

function handleAdminScoreInput(event) {
  const match = findMatch(event.target.dataset.matchId);
  const field = event.target.dataset.adminScore === "home" ? "homeGoals" : "awayGoals";
  match[field] = event.target.value === "" ? null : Number(event.target.value);
  saveAndRender();
}

function handleAdminToggle(event) {
  const match = findMatch(event.target.dataset.matchId);
  if (event.target.hasAttribute("data-admin-final")) {
    match.final = event.target.checked;
    if (match.final) match.unlocked = true;
  } else {
    match.unlocked = event.target.checked;
  }
  saveAndRender();
}

function handleAdminWinner(event) {
  const match = findMatch(event.target.dataset.matchId);
  match.winner = event.target.value;
  saveAndRender();
}

function findMatch(matchId) {
  return state.matches.find((match) => match.id === matchId);
}

function scorePrediction(prediction, match) {
  if (
    prediction.homeGoals === null ||
    prediction.awayGoals === null ||
    match.homeGoals === null ||
    match.awayGoals === null
  ) {
    return { points: 0, reason: "Sin datos" };
  }

  const predictedDiff = prediction.homeGoals - prediction.awayGoals;
  const actualDiff = match.homeGoals - match.awayGoals;
  const predictedSign = Math.sign(predictedDiff);
  const actualSign = Math.sign(actualDiff);
  let points = 0;
  let reason = "Errado";

  if (prediction.homeGoals === match.homeGoals && prediction.awayGoals === match.awayGoals) {
    points = 5;
    reason = "Marcador exacto";
  } else if (predictedSign === 0 && actualSign === 0) {
    points = 4;
    reason = "Empate correcto";
  } else if (predictedSign === actualSign && predictedDiff === actualDiff) {
    points = 4;
    reason = "Diferencia y ganador";
  } else if (predictedSign === actualSign && actualSign !== 0) {
    points = 3;
    reason = "Ganador";
  }

  if (match.stage !== "GR" && match.winner) {
    const predictedWinner = predictedSign > 0 ? "home" : predictedSign < 0 ? "away" : "";
    points += predictedWinner === match.winner ? 1 : -1;
  }

  return { points, reason };
}

function stageLabel(match) {
  const labels = {
    GR: "Fase de grupos",
    R32: "16avos",
    R16: "Octavos",
    QF: "Cuartos",
    SF: "Semifinal",
    F: "Final",
  };
  return labels[match.stage] || match.stage;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
