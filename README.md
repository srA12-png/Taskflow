# TaskFlow — Smart Task & Productivity Management System

TaskFlow is a full-stack task manager built with React (Vite), Express and SQLite.
It includes authentication, task and category management, analytics, and a
production Docker image for same-origin deployment.

> **Current status:** Core application features are implemented. Automated test
> coverage and hosted deployment verification remain in progress.

---

## Features

| Area | Status |
| --- | --- |
| Responsive app shell, persisted light / dark / system themes | ✅ |
| Register, login, logout, protected routes, HttpOnly cookie sessions | ✅ |
| SQLite schema, migrations, demo seed | ✅ |
| Task CRUD, categories, filtering, sorting, ownership checks | ✅ |
| Dashboard metrics, completion charts, priority distribution | ✅ |
| Calendar, task views, analytics, settings | ✅ |
| Automated frontend and backend test suites | ⏳ |
| Production deployment configuration | ✅ Render / Docker |

## Tech stack

- **Frontend:** React 19, Vite, JavaScript, Tailwind CSS v4, React Router, Lucide React, Recharts
- **Backend:** Node.js, Express
- **Database:** SQLite (`sqlite3` + `sqlite`) with foreign keys enabled
- **Auth:** JWT + bcryptjs (HttpOnly cookie strategy)
- **Validation:** Zod on the server
- **Testing:** Vitest, React Testing Library, Supertest

## Project structure

```
taskflow/
├─ client/                 # React + Vite frontend
│  ├─ public/
│  └─ src/
│     ├─ components/
│     │  ├─ layout/        # Sidebar, Header, AppLayout, PageContainer, AuthLayout
│     │  ├─ tasks/         # PriorityBadge, StatusBadge, CategoryBadge, FilterBar
│     │  └─ ui/            # Button, Field, Select, StatCard, ThemeToggle, …
│     ├─ context/          # Auth, tasks, theme and toast providers
│     ├─ pages/            # Dashboard, Tasks, Calendar, Analytics, Settings, auth
│     ├─ utils/            # cn, navigation, timezone-safe date helpers
│     ├─ App.jsx
│     ├─ main.jsx
│     └─ index.css         # Design tokens + Tailwind theme
├─ server/                 # Express API
│  └─ src/
│     ├─ app.js            # Middleware, health route, error handling
│     ├─ config/env.js     # Loads the repo-root .env
│     └─ server.js         # HTTP entry point
├─ .env.example
├─ Dockerfile              # Production image for Railway or Docker
└─ README.md
```

## Prerequisites

- Node.js 20.19+ (tested on Node 26.13.0)
- npm 10+
- Windows 11, macOS or Linux

## Installation (Windows 11)

```bash
git clone https://github.com/<your-username>/taskflow-smart-todo.git
cd taskflow-smart-todo

# Install root tooling, then both apps
npm run install:all
```

Or install each package directly:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Deploy link: https://taskflow-demo-siva.onrender.com

Separate terminals:

```bash
npm run dev:server   # Express on :5000
npm run dev:client   # Vite on :5173 (proxies /api -> :5000)
```

## Environment variables

Copy `.env.example` to `.env` at the repository root and fill in values.
The server reads `PORT`, `CLIENT_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`DATABASE_FILE` and `COOKIE_SECURE`. The frontend reads `VITE_API_BASE_URL`
(defaults to `/api`).

Never commit `.env` — it is ignored by git.

## Manual checks

1. `npm run dev` starts both processes without errors.
2. Register and sign in; confirm the session survives a page reload.
3. Create, edit, complete and delete a task; verify the dashboard updates.
4. Confirm analytics reflect actual tasks and show zero-data states when empty.
5. On Calendar, step through months and click dates; today is highlighted.
6. Unknown URLs render the 404 page.
7. `curl http://localhost:5000/api/health` returns `{"data":{"status":"ok",…}}`.

## Build

```bash
npm run build
```

Production output is written to `client/dist/`.

## Deploy a free demo to Render

The root `Dockerfile` builds the React client and serves it from Express alongside
the API. `render.yaml` configures one same-origin Render web service and generates
a JWT secret automatically.

1. In the Render Dashboard, create a **Blueprint** from the
   `srA12-png/Taskflow` GitHub repository.
2. Review and deploy the `taskflow-demo-siva` free web service from `render.yaml`.
   Render builds the root `Dockerfile` and assigns the service an HTTPS URL.
3. Open `https://<your-service>.onrender.com/api/health` and confirm it reports
   `status: "ok"`, then register an account and try the app.

**Demo limitation:** Render's free web services use an ephemeral filesystem and
spin down when idle. This demo stores SQLite at `/tmp/taskflow.db`, so accounts
and tasks can be lost when the service restarts, spins down, or redeploys. Free
services cannot attach persistent disks. Do not rely on this deployment for
important or production data; use a paid service with a persistent disk or move
the database to durable managed storage for that use case.

## Remaining work

- Add and run frontend and backend automated test suites.
- Complete a hosted deployment and verify production registration, login and task CRUD.

## License

MIT
