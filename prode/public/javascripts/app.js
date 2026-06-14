import { TOKEN_KEY, elements, state, api, adminAction, escapeHtml } from "./shared.js";
import { renderSummary, setupCarousel } from "./home.js";
import { renderPredictions, attachPredictionHandlers } from "./predictions.js";
import { renderRanking } from "./ranking.js";
import { renderAdmin, attachAdminHandlers, attachSyncHandlers } from "./admin.js";

let currentFilter = "open";

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
    renderPredictions(currentFilter);
    attachPredictionHandlers();
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
  await adminAction("/api/admin/unlock-next", { method: "POST" }, refresh);
  render();
});

elements.adminPlayerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const response = await adminAction("/api/admin/players", {
    method: "POST",
    body: {
      name: elements.newPlayerName.value,
      pin: elements.newPlayerPin.value,
    },
  }, refresh);
  if (response?.createdPlayer) {
    elements.createdPlayerNote.textContent = `Jugador ${response.createdPlayer.name} creado. PIN: ${response.createdPlayer.pin}`;
  }
  elements.adminPlayerForm.reset();
  render();
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
  }, refresh);
  elements.knockoutForm.reset();
  render();
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
  Object.assign(state, await api("/api/state"));
  render();
}

function render() {
  renderSession();
  renderLoginOptions();
  renderSummary();
  setupCarousel();
  renderPredictions(currentFilter);
  attachPredictionHandlers();
  renderRanking();
  renderAdmin();
  attachAdminHandlers(adminAction, refresh);
  attachSyncHandlers(adminAction, refresh);
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

refresh().catch((error) => {
  document.body.innerHTML = `<main class="app-shell"><div class="empty-state">${escapeHtml(error.message)}</div></main>`;
});
