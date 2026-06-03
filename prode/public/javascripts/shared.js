export const TOKEN_KEY = "prode-mundial-2026-token";

export const state = {
  players: [],
  matches: [],
  predictions: {},
  leaderboard: [],
  summary: {},
  session: null,
};

export const elements = {
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

export async function api(path, options = {}) {
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

export async function adminAction(path, options, refreshFn) {
  if (state.session?.role !== "admin") {
    elements.adminLoginButton.click();
    return null;
  }

  try {
    const response = await api(path, options);
    Object.assign(state, response);
    return response;
  } catch (error) {
    alert(error.message);
    if (typeof refreshFn === "function") await refreshFn();
    return null;
  }
}

export function groupMatches(matches) {
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

export function stageLabel(match) {
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

export function matchDateText(match) {
  if (!match.dateLabel && !match.timeLabel) return "Fecha a confirmar";
  return [match.dateLabel, match.timeLabel].filter(Boolean).join(" · ");
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
