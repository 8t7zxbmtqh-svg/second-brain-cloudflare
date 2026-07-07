# Assistente IA Personale - Cloudflare

Questa versione e pronta per **Cloudflare Pages + D1**.

## Cosa contiene

- `public/`: web app installabile su iPhone, iPad e Mac.
- `functions/api/[[path]].js`: API Cloudflare Pages Functions.
- `schema.sql`: tabella D1.
- `wrangler.toml`: esempio di configurazione.

## Deploy consigliato

Usa Cloudflare Pages collegato a un repository GitHub. Il caricamento diretto puo servire per siti statici, ma per Functions + D1 e molto piu affidabile usare Git.

## Impostazioni Cloudflare Pages

Build command:

```text
npm install
```

Build output directory:

```text
public
```

Root directory:

```text
/
```

## Database D1

1. Vai su Cloudflare Dashboard.
2. Apri **Workers & Pages**.
3. Apri **D1 SQL Database**.
4. Crea un database chiamato:

```text
second-brain-db
```

5. Apri il progetto Pages.
6. Vai in **Settings > Functions > D1 database bindings**.
7. Aggiungi un binding:

```text
Variable name: DB
Database: second-brain-db
```

La Function crea automaticamente la tabella al primo uso. Se vuoi inizializzarla manualmente, usa `schema.sql`.

## Test

Dopo il deploy apri:

```text
https://TUO-PROGETTO.pages.dev/api/health
```

Dovresti vedere:

```json
{"ok":true,"runtime":"cloudflare-pages","storage":"d1","authEnabled":false}
```

Poi apri:

```text
https://TUO-PROGETTO.pages.dev
```
