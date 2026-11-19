const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "ouvido-musical.db"));
const sessoes = new Map();

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS scores (
    user_id INTEGER PRIMARY KEY,
    scores_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const calculated = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(calculated, "hex"));
}

const admin = db.prepare("SELECT id FROM users WHERE username = ?").get("adm");
if (!admin) {
  db.prepare(
    "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)"
  ).run("adm", hashPassword("adm123"));
}

function sendJson(res, status, dados) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(dados));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Corpo da requisicao excede o limite."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function handleApi(req, res, url) {
  if (url === "/api/register" && req.method === "POST") {
    const dados = await readJson(req);
    const username = String(dados.username || "").trim();
    const password = String(dados.password || "");
    if (!username || !password) {
      return sendJson(res, 400, { error: "Informe usuario e senha." });
    }
    if (username.length > 50) {
      return sendJson(res, 400, { error: "Usuario deve ter no maximo 50 caracteres." });
    }
    try {
      const result = db.prepare(
        "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 0)"
      ).run(username, hashPassword(password));
      db.prepare(
        "INSERT INTO scores (user_id, scores_json) VALUES (?, '{}')"
      ).run(result.lastInsertRowid);
      return sendJson(res, 201, { usuario: username });
    } catch (error) {
      if (String(error).includes("UNIQUE")) {
        return sendJson(res, 409, { error: "Esse usuario ja existe." });
      }
      throw error;
    }
  }

  if (url === "/api/login" && req.method === "POST") {
    const dados = await readJson(req);
    const username = String(dados.username || "").trim();
    const password = String(dados.password || "");
    const user = db.prepare(
      "SELECT id, username, password_hash, is_admin FROM users WHERE username = ?"
    ).get(username);
    if (!user || !checkPassword(password, user.password_hash)) {
      return sendJson(res, 401, { error: "Usuario ou senha invalidos." });
    }
    const score = db.prepare(
      "SELECT scores_json FROM scores WHERE user_id = ?"
    ).get(user.id);
    const token = crypto.randomBytes(32).toString("hex");
    sessoes.set(token, user.id);
    return sendJson(res, 200, {
      token,
      usuario: user.username,
      isAdmin: Boolean(user.is_admin),
      placares: score ? JSON.parse(score.scores_json) : {},
    });
  }

  const matchScores = url.match(/^\/api\/users\/([^/]+)\/scores$/);
  if (matchScores && req.method === "PUT") {
    const username = decodeURIComponent(matchScores[1]);
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token || !sessoes.has(token)) {
      return sendJson(res, 401, { error: "Sessao expirada. Entre novamente." });
    }
    const dados = await readJson(req);
    const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (!user) return sendJson(res, 404, { error: "Usuario nao encontrado." });
    if (sessoes.get(token) !== user.id) {
      return sendJson(res, 403, { error: "Voce nao pode alterar este usuario." });
    }

    db.prepare(`
      INSERT INTO scores (user_id, scores_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        scores_json = excluded.scores_json,
        updated_at = CURRENT_TIMESTAMP
    `).run(user.id, JSON.stringify(dados.placares || {}));
    return sendJson(res, 200, { ok: true });
  }

  return false;
}

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

http
  .createServer(async (req, res) => {
    const url = req.url.split("?")[0];
    if (url.startsWith("/api/")) {
      try {
        const handled = await handleApi(req, res, url);
        if (handled !== false) return;
      } catch (error) {
        console.error(error);
        if (!res.headersSent) sendJson(res, 500, { error: "Erro interno do servidor." });
        return;
      }
    }
    const nome = url === "/" ? "/index.html" : url;
    const arquivo = path.join(__dirname, path.normalize(nome));

    if (!arquivo.startsWith(__dirname)) {
      res.writeHead(403);
      return res.end("Acesso negado");
    }

    fs.readFile(arquivo, (erro, dados) => {
      if (erro) {
        res.writeHead(404);
        return res.end("Arquivo não encontrado");
      }
      res.writeHead(200, {
        "Content-Type": tipos[path.extname(arquivo)] || "application/octet-stream",
      });
      res.end(dados);
    });
  })
  .listen(8080, () => console.log("App em http://localhost:8080"));
