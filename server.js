const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const PORT = Number(process.env.PORT || 4174);
const ADMIN_CODE = process.env.ADMIN_CODE || "admin2026";
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data", "store.json");
const PUBLIC_DIR = __dirname;

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

const sessions = new Map();
let db = loadDb();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(res, url.pathname);
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Error inesperado" });
  }
});

server.listen(PORT, () => {
  console.log(`Prode Mundial 2026 escuchando en http://127.0.0.1:${PORT}`);
});

async function handleApi(req, res, url) {
  const body = await readBody(req);
  const session = getSession(req);

  if (req.method === "GET" && url.pathname === "/api/state") {
    sendJson(res, 200, buildClientState(session));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const player = db.players.find((item) => item.id === body.playerId);
    if (!player || !verifyPin(body.pin, player.pinHash)) {
      throw httpError(401, "Jugador o PIN incorrecto");
    }
    const token = createSession({ role: "player", playerId: player.id });
    sendJson(res, 200, { token, role: "player", player: publicPlayer(player) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    if (body.code !== ADMIN_CODE) throw httpError(401, "Codigo de admin incorrecto");
    const token = createSession({ role: "admin" });
    sendJson(res, 200, { token, role: "admin" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/logout") {
    const token = getBearerToken(req);
    if (token) sessions.delete(token);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/predictions/")) {
    requirePlayer(session);
    if (url.pathname === "/api/predictions/commit") {
      commitPlayerPredictions(session.playerId, body.matchIds);
      saveDb();
      sendJson(res, 200, buildClientState(session));
      return;
    }

    const matchId = decodeURIComponent(url.pathname.split("/").pop());
    upsertPrediction(session.playerId, matchId, body);
    saveDb();
    sendJson(res, 200, buildClientState(session));
    return;
  }

  if (url.pathname.startsWith("/api/admin/")) {
    requireAdmin(session);

    if (req.method === "POST" && url.pathname === "/api/admin/players") {
      const pin = String(body.pin || generatePin());
      const name = String(body.name || "").trim();
      if (!name) throw httpError(400, "El nombre es obligatorio");
      const player = { id: crypto.randomUUID(), name, pinHash: hashPin(pin), createdAt: now() };
      db.players.push(player);
      audit("player.create", { playerId: player.id, name });
      saveDb();
      sendJson(res, 200, { ...buildClientState(session), createdPlayer: { ...publicPlayer(player), pin } });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/unlock-next") {
      db.matches
        .filter((match) => !match.unlocked)
        .slice(0, 12)
        .forEach((match) => {
          match.unlocked = true;
        });
      audit("matches.unlockNext", {});
      saveDb();
      sendJson(res, 200, buildClientState(session));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/matches/knockout") {
      const home = String(body.home || "").trim();
      const away = String(body.away || "").trim();
      if (!home || !away) throw httpError(400, "Los equipos son obligatorios");
      db.matches.push({
        id: `ko-${crypto.randomUUID()}`,
        stage: body.stage || "R16",
        group: null,
        home,
        away,
        unlocked: true,
        final: false,
        homeGoals: null,
        awayGoals: null,
        winner: "",
        resultLocked: false,
      });
      audit("match.createKnockout", { home, away });
      saveDb();
      sendJson(res, 200, buildClientState(session));
      return;
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/api/admin/matches/")) {
      const matchId = decodeURIComponent(url.pathname.split("/").pop());
      updateMatch(matchId, body);
      saveDb();
      sendJson(res, 200, buildClientState(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/export") {
      sendJson(res, 200, db);
      return;
    }
  }

  throw httpError(404, "Endpoint no encontrado");
}

function buildClientState(session) {
  return {
    players: db.players.map(publicPlayer),
    matches: db.matches,
    predictions:
      session?.role === "player"
        ? Object.fromEntries(
            db.predictions
              .filter((prediction) => prediction.playerId === session.playerId)
              .map((prediction) => [prediction.matchId, publicPrediction(prediction)]),
          )
        : {},
    session: session
      ? {
          role: session.role,
          playerId: session.playerId || null,
          playerName: db.players.find((player) => player.id === session.playerId)?.name || null,
        }
      : null,
    summary: buildSummary(),
    leaderboard: calculateLeaderboard(),
  };
}

function createInitialDb() {
  const matches = [];
  Object.entries(GROUPS).forEach(([group, teams]) => {
    [
      [0, 1],
      [2, 3],
      [0, 2],
      [1, 3],
      [0, 3],
      [1, 2],
    ].forEach(([homeIndex, awayIndex], roundIndex) => {
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
        resultLocked: false,
      });
    });
  });

  return {
    players: [
      {
        id: "demo",
        name: "Demo",
        pinHash: hashPin("123456"),
        createdAt: now(),
      },
    ],
    matches,
    predictions: [],
    auditLog: [],
  };
}

function loadDb() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = createInitialDb();
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const loaded = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  loaded.auditLog ||= [];
  loaded.predictions ||= [];
  loaded.matches.forEach((match) => {
    match.resultLocked ||= Boolean(match.final);
  });
  return loaded;
}

function saveDb() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function upsertPrediction(playerId, matchId, body) {
  const match = db.matches.find((item) => item.id === matchId);
  if (!match) throw httpError(404, "Partido no encontrado");
  if (!match.unlocked || match.final) throw httpError(409, "El partido no esta abierto");

  let prediction = db.predictions.find((item) => item.playerId === playerId && item.matchId === matchId);
  if (prediction?.locked) throw httpError(409, "Pronostico confirmado y bloqueado");
  if (!prediction) {
    prediction = { playerId, matchId, homeGoals: null, awayGoals: null, locked: false, createdAt: now() };
    db.predictions.push(prediction);
  }

  prediction.homeGoals = normalizeGoals(body.homeGoals);
  prediction.awayGoals = normalizeGoals(body.awayGoals);
  prediction.updatedAt = now();
}

function commitPlayerPredictions(playerId, matchIds) {
  const targetIds = Array.isArray(matchIds)
    ? new Set(matchIds)
    : new Set(db.matches.filter((match) => match.unlocked && !match.final).map((match) => match.id));
  db.predictions
    .filter((prediction) => prediction.playerId === playerId && targetIds.has(prediction.matchId))
    .filter((prediction) => prediction.homeGoals !== null && prediction.awayGoals !== null)
    .forEach((prediction) => {
      prediction.locked = true;
      prediction.lockedAt = now();
    });
  audit("predictions.commit", { playerId, count: targetIds.size });
}

function updateMatch(matchId, body) {
  const match = db.matches.find((item) => item.id === matchId);
  if (!match) throw httpError(404, "Partido no encontrado");
  if (match.resultLocked) throw httpError(409, "Resultado final bloqueado");

  if ("unlocked" in body) match.unlocked = Boolean(body.unlocked);
  if ("homeGoals" in body) match.homeGoals = normalizeGoals(body.homeGoals);
  if ("awayGoals" in body) match.awayGoals = normalizeGoals(body.awayGoals);
  if ("winner" in body) match.winner = String(body.winner || "");
  if ("final" in body) {
    if (body.final) {
      if (match.homeGoals === null || match.awayGoals === null) {
        throw httpError(400, "Carga el resultado antes de finalizar");
      }
      match.final = true;
      match.unlocked = true;
      match.resultLocked = true;
      audit("match.finalize", { matchId });
    } else {
      match.final = false;
    }
  }
}

function calculateLeaderboard() {
  return db.players
    .map((player) => {
      const scores = db.matches
        .filter((match) => match.final)
        .map((match) => {
          const prediction = db.predictions.find(
            (item) => item.playerId === player.id && item.matchId === match.id,
          );
          return scorePrediction(prediction, match);
        });
      return {
        id: player.id,
        name: player.name,
        points: scores.reduce((total, score) => total + score.points, 0),
        hits: scores.filter((score) => score.points > 0).length,
        played: scores.length,
      };
    })
    .sort((a, b) => b.points - a.points || b.hits - a.hits || a.name.localeCompare(b.name));
}

function scorePrediction(prediction, match) {
  if (
    !prediction ||
    prediction.homeGoals === null ||
    prediction.awayGoals === null ||
    match.homeGoals === null ||
    match.awayGoals === null
  ) {
    return { points: 0 };
  }

  const predictedDiff = prediction.homeGoals - prediction.awayGoals;
  const actualDiff = match.homeGoals - match.awayGoals;
  const predictedSign = Math.sign(predictedDiff);
  const actualSign = Math.sign(actualDiff);
  let points = 0;

  if (prediction.homeGoals === match.homeGoals && prediction.awayGoals === match.awayGoals) {
    points = 5;
  } else if (predictedSign === 0 && actualSign === 0) {
    points = 4;
  } else if (predictedSign === actualSign && predictedDiff === actualDiff) {
    points = 4;
  } else if (predictedSign === actualSign && actualSign !== 0) {
    points = 3;
  }

  if (match.stage !== "GR" && match.winner) {
    const predictedWinner = predictedSign > 0 ? "home" : predictedSign < 0 ? "away" : "";
    points += predictedWinner === match.winner ? 1 : -1;
  }

  return { points };
}

function buildSummary() {
  const leaderboard = calculateLeaderboard();
  return {
    totalPlayers: db.players.length,
    openMatches: db.matches.filter((match) => match.unlocked && !match.final).length,
    finishedMatches: db.matches.filter((match) => match.final).length,
    leaderPoints: leaderboard[0]?.points || 0,
  };
}

function publicPlayer(player) {
  return { id: player.id, name: player.name };
}

function publicPrediction(prediction) {
  return {
    homeGoals: prediction.homeGoals,
    awayGoals: prediction.awayGoals,
    locked: prediction.locked,
    lockedAt: prediction.lockedAt || null,
  };
}

function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(pin), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPin(pin, pinHash) {
  const [salt, storedHash] = String(pinHash || "").split(":");
  if (!salt || !storedHash) return false;
  const hash = crypto.pbkdf2Sync(String(pin), salt, 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
}

function createSession(payload) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { ...payload, createdAt: Date.now() });
  return token;
}

function getSession(req) {
  const token = getBearerToken(req);
  return token ? sessions.get(token) || null : null;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function requirePlayer(session) {
  if (session?.role !== "player") throw httpError(401, "Necesitas iniciar sesion como jugador");
}

function requireAdmin(session) {
  if (session?.role !== "admin") throw httpError(401, "Necesitas iniciar sesion como admin");
}

function normalizeGoals(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 20) {
    throw httpError(400, "Los goles deben ser enteros entre 0 y 20");
  }
  return number;
}

function generatePin() {
  return String(crypto.randomInt(100000, 1000000));
}

function audit(action, data) {
  db.auditLog.push({ action, data, at: now() });
}

function now() {
  return new Date().toISOString();
}

async function readBody(req) {
  if (!["POST", "PATCH", "PUT"].includes(req.method)) return {};
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  const firstSegment = relativePath.split(path.sep)[0];
  const ext = path.extname(filePath);
  const allowedExtensions = new Set([".html", ".css", ".js", ".webmanifest"]);
  if (
    !filePath.startsWith(PUBLIC_DIR) ||
    filePath === __filename ||
    firstSegment.startsWith(".") ||
    firstSegment === "data" ||
    !allowedExtensions.has(ext)
  ) {
    sendText(res, 404, "No encontrado");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, "No encontrado");
    return;
  }
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
  };
  res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
