# Second Brain AI - Cloudflare Worker

Webapp personale installabile su iPhone, iPad e Mac, con salvataggio su Cloudflare D1.

## Cosa contiene

- `worker.js`: Worker Cloudflare con API e asset statici.
- `public/`: interfaccia web installabile come app.
- `wrangler.toml`: configurazione Worker, Assets e D1.
- `schema.sql`: tabella D1 opzionale, la app la crea anche automaticamente.

## Impostazioni Cloudflare

Build command: lascia vuoto.

Deploy command:

```text
npx wrangler deploy
```

Non-production deploy command:

```text
npx wrangler deploy
```

Path:

```text
/
```

## Gmail AI

La webapp mostra e organizza elementi di tipo `Email AI`, ma la lettura reale di Gmail e la preparazione delle bozze devono restare nelle automazioni Codex autorizzate. Le email non vengono inviate automaticamente: Codex prepara bozze e l'utente conferma da Gmail.
