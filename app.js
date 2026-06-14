const TOKEN_KEY = "prode-mundial-2026-token";

let state = {
  players: [],
  matches: [],
  predictions: {},
  leaderboard: [],
  summary: {},
  session: null,
};
let currentFilter = "open";
let carouselIndex = 0;
let carouselTimer = null;

const elements = {
  sessionStatus: document.querySelector("#sessionStatus"),
  loginButton: document.querySelector("#loginButton"),
  adminLoginButton: document.querySelector("#adminLoginButton"),
  logoutButton: document.querySelector("#logoutButton"),
  loginDialog: document.querySelector("#loginDialog"),
  loginForm: document.querySelector("#loginForm"),
  loginPlayerSelect: document.querySelector("#loginPlayerSelect"),
  loginPin: document.querySelector("#loginPin"),
  loginError: document.querySelector("#loginError"),
  cancelLoginButton: document.querySelector("#cancelLoginButton"),
  adminDialog: document.querySelector("#adminDialog"),
  adminLoginForm: document.querySelector("#adminLoginForm"),
  adminCode: document.querySelector("#adminCode"),
  adminLoginError: document.querySelector("#adminLoginError"),
  cancelAdminButton: document.querySelector("#cancelAdminButton"),
  predictionList: document.querySelector("#predictionList"),
  rankingList: document.querySelector("#rankingList"),
  adminMatchList: document.querySelector("#adminMatchList"),
  unlockNextButton: document.querySelector("#unlockNextButton"),
  commitPredictionsButton: document.querySelector("#commitPredictionsButton"),
  knockoutForm: document.querySelector("#knockoutForm"),
  knockoutHome: document.querySelector("#knockoutHome"),
  knockoutAway: document.querySelector("#knockoutAway"),
  knockoutRound: document.querySelector("#knockoutRound"),
  adminPlayerForm: document.querySelector("#adminPlayerForm"),
  newPlayerName: document.querySelector("#newPlayerName"),
  newPlayerPin: document.querySelector("#newPlayerPin"),
  createdPlayerNote: document.querySelector("#createdPlayerNote"),
  exportButton: document.querySelector("#exportButton"),
  exportAdminButton: document.querySelector("#exportAdminButton"),
  summaryKicker: document.querySelector("#summaryKicker"),
  summaryDate: document.querySelector("#summaryDate"),
  summaryValue: document.querySelector("#summaryValue"),
  summaryMeta: document.querySelector("#summaryMeta"),
  summaryDots: document.querySelector("#summaryDots"),
};

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

document.querySelectorAll("[data-tab-jump]").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tabJump));
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    renderPredictions();
  });
});

elements.loginButton.addEventListener("click", () => {
  renderLoginOptions();
  elements.loginError.textContent = "";
  elements.loginPin.value = "";
  elements.loginDialog.showModal();
});

elements.adminLoginButton.addEventListener("click", () => {
  elements.adminLoginError.textContent = "";
  elements.adminCode.value = "";
  elements.adminDialog.showModal();
});

elements.logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  localStorage.removeItem(TOKEN_KEY);
  await refresh();
});

elements.cancelLoginButton.addEventListener("click", () => elements.loginDialog.close());
elements.cancelAdminButton.addEventListener("click", () => elements.adminDialog.close());

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const response = await api("/api/login", {
      method: "POST",
      body: {
        playerId: elements.loginPlayerSelect.value,
        pin: elements.loginPin.value,
      },
    });
    localStorage.setItem(TOKEN_KEY, response.token);
    elements.loginDialog.close();
    await refresh();
    setActiveTab("predictions");
  } catch (error) {
    elements.loginError.textContent = error.message;
  }
});

elements.adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const response = await api("/api/admin/login", {
      method: "POST",
      body: { code: elements.adminCode.value },
    });
    localStorage.setItem(TOKEN_KEY, response.token);
    elements.adminDialog.close();
    await refresh();
    setActiveTab("admin");
  } catch (error) {
    elements.adminLoginError.textContent = error.message;
  }
});

elements.commitPredictionsButton.addEventListener("click", async () => {
  if (state.session?.role !== "player") {
    elements.loginButton.click();
    return;
  }
  await api("/api/predictions/commit", { method: "POST", body: {} });
  await refresh();
});

elements.unlockNextButton.addEventListener("click", async () => {
  await adminAction("/api/admin/unlock-next", { method: "POST" });
});

elements.adminPlayerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const response = await adminAction("/api/admin/players", {
    method: "POST",
    body: {
      name: elements.newPlayerName.value,
      pin: elements.newPlayerPin.value,
    },
  });
  if (response?.createdPlayer) {
    elements.createdPlayerNote.textContent = `Jugador ${response.createdPlayer.name} creado. PIN: ${response.createdPlayer.pin}`;
  }
  elements.adminPlayerForm.reset();
});

elements.knockoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await adminAction("/api/admin/matches/knockout", {
    method: "POST",
    body: {
      home: elements.knockoutHome.value,
      away: elements.knockoutAway.value,
      stage: elements.knockoutRound.value,
    },
  });
  elements.knockoutForm.reset();
});

[elements.exportButton, elements.exportAdminButton].forEach((button) => {
  button.addEventListener("click", exportData);
});

async function exportData() {
  try {
    const data = await api("/api/admin/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "prode-mundial-2026.json";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(error.message);
  }
}

function setActiveTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
  document.querySelector(`#${tabName}Panel`).classList.add("active");
}

async function refresh() {
  state = await api("/api/state");
  render();
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) localStorage.removeItem(TOKEN_KEY);
    throw new Error(payload.error || "No se pudo completar la accion");
  }
  return payload;
}

async function adminAction(path, options) {
  if (state.session?.role !== "admin") {
    elements.adminLoginButton.click();
    return null;
  }
  try {
    const response = await api(path, options);
    state = response;
    render();
    return response;
  } catch (error) {
    alert(error.message);
    await refresh();
    return null;
  }
}

function render() {
  renderSession();
  renderLoginOptions();
  renderSummary();
  setupCarousel();
  renderPredictions();
  renderRanking();
  renderAdmin();
}

function renderSession() {
  const session = state.session;
  elements.logoutButton.classList.toggle("hidden", !session);
  elements.loginButton.classList.toggle("hidden", Boolean(session));
  elements.adminLoginButton.classList.toggle("hidden", Boolean(session));

  if (!session) {
    elements.sessionStatus.textContent = "Sin sesion";
  } else if (session.role === "admin") {
    elements.sessionStatus.textContent = "Admin";
  } else {
    elements.sessionStatus.textContent = session.playerName;
  }
}

function renderLoginOptions() {
  elements.loginPlayerSelect.innerHTML = state.players
    .map((player) => `<option value="${player.id}">${escapeHtml(player.name)}</option>`)
    .join("");
}

function renderSummary() {
  renderCarousel();
}

function setupCarousel() {
  carouselIndex = Math.min(carouselIndex, Math.max(getSummarySlides().length - 1, 0));
  renderCarousel();
  if (carouselTimer) window.clearInterval(carouselTimer);
  carouselTimer = window.setInterval(() => {
    const slides = getSummarySlides();
    if (!slides.length) return;
    carouselIndex = (carouselIndex + 1) % slides.length;
    renderCarousel();
  }, 4200);
}

function renderCarousel() {
  const slides = getSummarySlides();
  const slide = slides[carouselIndex % slides.length];
  elements.summaryKicker.textContent = slide.kicker;
  elements.summaryDate.textContent = slide.date || "";
  elements.summaryDate.classList.toggle("hidden", !slide.date);
  elements.summaryValue.textContent = slide.value;
  elements.summaryMeta.textContent = slide.meta;
  elements.summaryDots.innerHTML = slides
    .map((_, index) => `<span class="${index === carouselIndex ? "active" : ""}"></span>`)
    .join("");
}

function getSummarySlides() {
  const leader = state.leaderboard[0];
  const nextMatches = state.matches.filter((match) => match.unlocked && !match.final).slice(0, 3);
  const slides = [
    {
      kicker: "Jugadores",
      value: String(state.summary.totalPlayers ?? 0),
      meta: "Participantes cargados en el prode.",
    },
    {
      kicker: "Partidos abiertos",
      value: String(state.summary.openMatches ?? 0),
      meta: "Disponibles para cargar pronosticos.",
    },
    {
      kicker: "Lider actual",
      value: leader ? `${leader.name} · ${leader.points} pts` : "Sin lider",
      meta: leader ? `${leader.hits} aciertos sobre ${leader.played} finalizados.` : "El ranking se activa con resultados.",
    },
  ];

  nextMatches.forEach((match, index) => {
    slides.push({
      kicker: index === 0 ? "Proximo partido" : "Tambien abierto",
      value: `${match.home} vs ${match.away}`,
      meta: `${matchDateText(match)} · ${stageLabel(match)}${match.group ? ` · Grupo ${match.group}` : ""}`,
      date: matchDateText(match),
    });
  });

  slides.push({
    kicker: "Finalizados",
    value: String(state.summary.finishedMatches ?? 0),
    meta: "Resultados oficiales ya bloqueados.",
  });

  return slides;
}

function renderPredictions() {
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
    state = await api(`/api/predictions/${encodeURIComponent(matchId)}`, {
      method: "POST",
      body,
    });
    render();
  } catch (error) {
    alert(error.message);
    await refresh();
  }
}

function getPrediction(matchId) {
  return state.predictions[matchId] || { homeGoals: null, awayGoals: null, locked: false };
}

function renderRanking() {
  elements.rankingList.innerHTML = state.leaderboard
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

function renderAdmin() {
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

  elements.adminMatchList.querySelectorAll("[data-admin-score]").forEach((input) => {
    input.addEventListener("change", handleAdminScoreInput);
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

async function handleAdminScoreInput(event) {
  const match = findMatch(event.target.dataset.matchId);
  const field = event.target.dataset.adminScore === "home" ? "homeGoals" : "awayGoals";
  await patchMatch(match.id, { [field]: event.target.value });
}

async function handleAdminToggle(event) {
  const match = findMatch(event.target.dataset.matchId);
  if (event.target.hasAttribute("data-admin-final")) {
    await patchMatch(match.id, { final: event.target.checked });
  } else {
    await patchMatch(match.id, { unlocked: event.target.checked });
  }
}

async function handleAdminWinner(event) {
  await patchMatch(event.target.dataset.matchId, { winner: event.target.value });
}

async function patchMatch(matchId, body) {
  await adminAction(`/api/admin/matches/${encodeURIComponent(matchId)}`, {
    method: "PATCH",
    body,
  });
}

function findMatch(matchId) {
  return state.matches.find((match) => match.id === matchId);
}

function groupMatches(matches) {
  const groupOrder = "ABCDEFGHIJKL".split("");
  const groups = groupOrder
    .map((groupKey) => ({
      key: groupKey,
      kicker: "Grupo",
      title: `Grupo ${groupKey}`,
      matches: matches.filter((match) => match.group === groupKey),
    }))
    .filter((group) => group.matches.length);

  const knockoutMatches = matches.filter((match) => !match.group);
  if (knockoutMatches.length) {
    groups.push({
      key: "KO",
      kicker: "Llaves",
      title: "Eliminacion",
      matches: knockoutMatches,
    });
  }

  return groups;
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

function matchDateText(match) {
  if (!match.dateLabel && !match.timeLabel) return "Fecha a confirmar";
  return [match.dateLabel, match.timeLabel].filter(Boolean).join(" · ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

refresh().catch((error) => {
  document.body.innerHTML = `<main class="app-shell"><div class="empty-state">${escapeHtml(error.message)}</div></main>`;
});
