# TaskFlow — Smart Task & Productivity Management System

TaskFlow is a full-stack task manager built with React (Vite), Express and SQLite.
It is being built in verifiable phases: the UI shell ships first, then authentication,
the REST API, task management, analytics and finally tests/documentation.

> **Current status: Phase 1 complete — UI shell only.**
> Dashboard numbers, task lists and charts are intentionally empty and labelled as
> placeholders. Authentication and the task API are **not** implemented yet.

---

## Features (planned, delivered by phase)

| Area | Status |
| --- | --- |
| Responsive app shell: collapsible sidebar, mobile drawer, sticky header | ✅ Phase 1 |
| Light / dark / system theme with persistence | ✅ Phase 1 |
| Dashboard, Tasks, Today, Upcoming, Completed, Important, Calendar, Analytics, Settings routes | ✅ Phase 1 |
| Functional month calendar (local timezone) | ✅ Phase 1 |
| Register / login / logout with bcrypt + JWT in HttpOnly cookies | ⏳ Phase 2 |
| SQLite schema, migrations, demo seed | ⏳ Phase 2 |
| Task CRUD, categories, filters, sorting, ownership checks | ⏳ Phase 3–4 |
| Live dashboard metrics, Recharts analytics | ⏳ Phase 5 |
| Vitest + React Testing Library + Supertest suites | ⏳ Phase 6 |
| Deployment configuration and final docs | ⏳ Phase 7 |

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
│     ├─ context/          # ThemeContext (auth context lands in Phase 2)
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

## Running locally

Run both the API and the frontend with one command:

```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- API health check: <http://localhost:5000/api/health>

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

## Phase 1 manual test checklist

1. `npm run dev` starts both processes without errors.
2. `/` redirects to `/dashboard`; greeting and date match your local timezone.
3. Collapse the sidebar with the bottom button, reload, and confirm it stays collapsed.
4. Resize below 1024px: sidebar becomes a drawer, Escape and the overlay both close it.
5. Toggle the theme in the header; reload and confirm the choice persists.
6. In Settings choose Light / System / Dark and confirm the whole UI follows.
7. On Calendar, step through months and click dates; today is highlighted.
8. Unknown URLs (e.g. `/does-not-exist`) render the 404 page.
9. `curl http://localhost:5000/api/health` returns `{"data":{"status":"ok",…}}`.
10. Every placeholder is visibly labelled with its phase — no invented numbers.

## Build

```bash
npm run build
```

Production output is written to `client/dist/`.

## Roadmap

1. **Phase 2** — SQLite schema + migrations, seed script, register/login/logout, JWT in HttpOnly cookies, protected routes.
2. **Phase 3** — Tasks, categories and analytics REST endpoints with validation, pagination and ownership checks.
3. **Phase 4** — Connect the UI to the API: CRUD, filters, search, Kanban, toasts and confirmations.
4. **Phase 5** — Live dashboard metrics, Recharts analytics, calendar markers, profile/password settings.
5. **Phase 6** — Vitest/RTL/Supertest suites, accessibility pass, bug fixes.
6. **Phase 7** — Final README (screenshots, API reference, deployment), release checklist.

## License

MIT
