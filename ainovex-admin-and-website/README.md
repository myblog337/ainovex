# AINOVEX Website + Admin Panel

This source package contains the public AINOVEX website and the admin panel/API workspace that manages publishing.

## Included

- `ainovex-website/` — the supplied static website project and its content/assets.
- `admin-panel/` — the admin UI, API server, shared API/database packages, and workspace configuration.
- `docs/updated-github-publishing-requirements.txt` — the supplied publishing requirements.

Installed dependencies, build output, Git history, and credential values are not included. The website `.env.example` contains blank placeholders; add any required values privately.

## Website

Requires Node.js 20 or newer.

```sh
cd ainovex-website
npm ci
npm run dev
```

Build the static site with `npm run build`. The output is written to `dist/`.

## Admin panel

The admin UI and API use the pnpm workspace under `admin-panel/`. Use Node.js 24 and pnpm.

Configure these values with Replit Secrets or your hosting provider's environment-variable manager; do not commit them:

- `DATABASE_URL` — PostgreSQL connection string.
- `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` — server-side Clerk configuration.
- `VITE_CLERK_PUBLISHABLE_KEY` — the admin UI's Clerk publishable key.
- `AINOVEX_ADMIN_EMAILS` — comma-separated administrator email addresses; access requires a verified matching email.

The API also needs `PORT`. The admin Vite app needs `PORT` and `BASE_PATH` (use `/` for a root-mounted local app). After setting `DATABASE_URL`, apply the database schema:

```sh
cd admin-panel
pnpm install
pnpm --filter @workspace/db run push
```

Then start the API and admin UI in separate terminals with the appropriate environment values:

```sh
PORT=8080 pnpm --filter @workspace/api-server run dev
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/ainovex-admin run dev
```

In this Replit workspace, use the configured artifact workflows and path routing. On another host, configure routing so admin API requests reach the API server.

GitHub credentials are entered in the admin panel for each publishing operation. Do not add a GitHub PAT to environment files or this source package.
