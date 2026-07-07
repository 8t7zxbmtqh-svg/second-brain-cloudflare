const dataKey = "second-brain:data";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    if (request.method === "OPTIONS") return json(null, 204);
    await ensureSchema(env);

    if (pathname === "/api/health") {
      return json({
        ok: true,
        runtime: "cloudflare-pages",
        storage: "d1",
        authEnabled: false
      });
    }

    if (pathname === "/api/session") {
      return json({ authenticated: true, authEnabled: false });
    }

    if (pathname === "/api/login") {
      return json({ authenticated: true, authEnabled: false });
    }

    if (pathname === "/api/logout") {
      return json({ authenticated: false, authEnabled: false });
    }

    if (pathname === "/api/items" && request.method === "GET") {
      return json(await readData(env));
    }

    if (pathname === "/api/items" && request.method === "POST") {
      const item = await request.json();
      const data = await readData(env);
      const now = new Date().toISOString();
      data.items.unshift({
        id: item.id || randomId(),
        title: String(item.title || "Senza titolo").slice(0, 160),
        body: String(item.body || ""),
        kind: ["task", "note", "person", "project"].includes(item.kind) ? item.kind : "note",
        priority: ["high", "normal", "low"].includes(item.priority) ? item.priority : "normal",
        due: item.due || "",
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        done: Boolean(item.done),
        source: item.source || "web-app",
        createdAt: item.createdAt || now,
        updatedAt: now
      });
      return json(await writeData(env, data), 201);
    }

    if (pathname.startsWith("/api/items/")) {
      const id = decodeURIComponent(pathname.replace("/api/items/", ""));
      const data = await readData(env);
      const index = data.items.findIndex(item => item.id === id);
      if (index === -1) return json({ error: "Elemento non trovato" }, 404);

      if (request.method === "PATCH") {
        const patch = await request.json();
        data.items[index] = { ...data.items[index], ...patch, id, updatedAt: new Date().toISOString() };
        return json(await writeData(env, data));
      }

      if (request.method === "DELETE") {
        data.items.splice(index, 1);
        return json(await writeData(env, data));
      }
    }

    if (pathname === "/api/import" && request.method === "POST") {
      const incoming = await request.json();
      const incomingItems = Array.isArray(incoming) ? incoming : incoming.items;
      if (!Array.isArray(incomingItems)) return json({ error: "Formato import non valido" }, 400);

      const data = await readData(env);
      const merged = [...incomingItems, ...data.items];
      const byId = new Map();
      for (const item of merged) byId.set(item.id || randomId(), item);
      return json(await writeData(env, { items: [...byId.values()] }));
    }

    return json({ error: "Endpoint non trovato" }, 404);
  } catch (error) {
    return json({ error: error.message || "Errore server" }, 500);
  }
}

async function ensureSchema(env) {
  assertDb(env);
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
}

async function readData(env) {
  assertDb(env);
  const row = await env.DB.prepare("SELECT value FROM app_state WHERE key = ?").bind(dataKey).first();
  if (!row) {
    const seed = { version: 1, updatedAt: new Date().toISOString(), items: [] };
    await writeData(env, seed);
    return seed;
  }
  const parsed = JSON.parse(row.value);
  return { version: 1, updatedAt: parsed.updatedAt || new Date().toISOString(), items: Array.isArray(parsed.items) ? parsed.items : [] };
}

async function writeData(env, data) {
  assertDb(env);
  const clean = {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: Array.isArray(data.items) ? data.items : []
  };
  await env.DB.prepare(`
    INSERT INTO app_state (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(dataKey, JSON.stringify(clean), clean.updatedAt).run();
  return clean;
}

function assertDb(env) {
  if (!env.DB) {
    throw new Error("Binding D1 mancante: crea un database D1 e collegalo a Pages con nome binding DB.");
  }
}

function json(payload, status = 200) {
  return new Response(payload == null ? "" : JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function randomId() {
  return "item-" + Date.now().toString(36) + "-" + crypto.randomUUID().slice(0, 8);
}
