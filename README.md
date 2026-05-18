<div align="center">

# zero-config-cli ⚡

### **Generate production-ready full-stack projects from your terminal — zero config required.**

[![npm version](https://img.shields.io/npm/v/zero-config-cli?style=for-the-badge&logo=npm&color=cb3837)](https://www.npmjs.com/package/zero-config-cli)
[![npm downloads](https://img.shields.io/npm/dt/zero-config-cli?style=for-the-badge&logo=npm&color=37b24d)](https://www.npmjs.com/package/zero-config-cli)
[![license](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-339933?style=for-the-badge&logo=node.js)](package.json)

```
npx zero-config-cli my-project
```

</div>

---

## 🎯 The Problem

Every time you start a new project, you spend **45–90 minutes** doing the same thing:

- Scaffolding folders and config files
- Setting up TypeScript, ESLint, Prettier
- Wiring up authentication (JWT, bcrypt, token refresh)
- Configuring Prisma ORM with database connection
- Writing CRUD endpoints with owner verification
- Setting up test runners and writing initial tests
- Debugging import paths, CORS, and environment variables

**That's hours of your life you'll never get back.** And you do it every single time.

---

## 💡 The Solution

**Zero-Config CLI** generates a fully configured, production-ready full-stack project in **under 30 seconds**. Pick your stack, and start coding real features on day one — not configuring tools.

| Step | What happens                                                    |
| ---- | --------------------------------------------------------------- |
| 1    | Pick a frontend (React · Angular · Vue.js · Next.js)            |
| 2    | Name your frontend folder (or use the default)                  |
| 3    | Pick a backend (Express · NestJS · Fastify)                     |
| 4    | Name your backend folder (or use the default)                   |
| 5    | Pick a database (PostgreSQL · MySQL · SQLite · etc.)            |
| 6    | Done. You have a full-stack project with auth, CRUD, and tests. |

### What you get **instantly**:

✅ JWT authentication (access + refresh tokens with rotation)  
✅ Full CRUD operations with ownership verification  
✅ Prisma ORM with your chosen database provider pre-configured  
✅ bcrypt password hashing (10 rounds) with strong validation  
✅ Pre-written tests (auth flow, CRUD, edge cases, auth guards)  
✅ TypeScript, ESLint, environment variables, CORS — all wired up  
✅ Zero configuration files to touch before you start coding

---

## 🚀 Quick Start

```bash
# Interactive mode — guided prompts
npx zero-config-cli my-project

# Non-interactive mode — for scripts and CI
npx zero-config-cli my-project -f react -b express -d postgresql
```

After generation, the CLI can optionally run `npm install` for you — choose **both**, **backend only**, **frontend only**, or **skip**.

---

## 📋 Interactive Flow

```
$ npx zero-config-cli my-project

  ╭──────────────────────────────────────╮
  │  Zero-Config Starter Generator       │
  ╰──────────────────────────────────────╯

  ? Select a frontend framework:
    ⚛️  React v19       Port 5173 · Auth context, Protected routes
    🅰️  Angular v21     Port 4200 · Auth guards, Signals
    💚  Vue.js v3       Port 5173 · Pinia store, Composition API
    ▲   Next.js v16     Port 3000 · SQLite auth, Server Actions

  ? Enter folder name for frontend: (react)
  ❯ react

  ? Select a backend framework:
    🚀  Express v4.18   Port 5000 · Minimalist, unopinionated
    🐱  NestJS v11      Port 5000 · Modular architecture, Passport.js
    ⚡  Fastify v5      Port 5000 · High-performance, low overhead

  ? Enter folder name for backend: (express)
  ❯ express

  ? Select a database:
    🐘  PostgreSQL   Relational SQL database
    🐬  MySQL        Popular open-source RDBMS
    📁  SQLite       Embedded file-based database
    ...

  [⠋] Generating your project...
  [✔] Project generated successfully!

  ┌─────────────────────────────────────────────┐
  │  📁 my-project/                              │
  │     react/                                   │
  │     express/                                 │
  │  🗄️  Database: PostgreSQL                    │
  └─────────────────────────────────────────────┘

  ? Install dependencies:
  ❯ Yes (both frontend & backend)
    Backend only
    Frontend only
    Skip

  [⠋] Installing dependencies...
  [✔] Dependencies installed in Frontend & Backend

  ✨ Your stack is ready!

     ⚛️  Frontend: cd my-project/react && npm run dev   →  http://localhost:5173
     🚀  Backend:  cd my-project/express && npm run dev →  http://localhost:5000
     🐘  Database: PostgreSQL

     Happy coding! 🚀
```

---

## 🧩 Available Templates

### Frontend

| Icon | Template    | Stack                                                  | Start command   | Port |
| ---- | ----------- | ------------------------------------------------------ | --------------- | ---- |
| ⚛️   | **React**   | React 19 + Vite 7.2 + TypeScript 5.9 + Tailwind CSS    | `npm run dev`   | 5173 |
| 🅰️   | **Angular** | Angular 21 + SSR + Signals + Tailwind CSS 4.x          | `npm run start` | 4200 |
| 💚   | **Vue.js**  | Vue 3.5 + Pinia 3.0 + Vite 7.3 + Oxlint + Tailwind CSS | `npm run dev`   | 5173 |
| ▲    | **Next.js** | Next.js 16 + App Router + SQLite + Tailwind CSS 4      | `npm run dev`   | 3000 |

### Backend

| Icon | Template    | Stack                                                       | Start command       | Port |
| ---- | ----------- | ----------------------------------------------------------- | ------------------- | ---- |
| 🚀   | **Express** | Express 4.18 + Prisma 6 + JWT + bcrypt + Jest               | `npm run dev`       | 5000 |
| 🐱   | **NestJS**  | NestJS 11 + Passport.js + Prisma 6 + class-validator + Jest | `npm run start:dev` | 5000 |
| ⚡   | **Fastify** | Fastify 5 + @fastify/jwt + Prisma 6 + Swagger + Vitest      | `npm run dev`       | 5000 |

### Databases

| Icon | Database    | Prisma Provider |
| ---- | ----------- | --------------- |
| 🐘   | PostgreSQL  | `postgresql`    |
| 🐬   | MySQL       | `mysql`         |
| 🪶   | MariaDB     | `mysql`         |
| 🟦   | SQL Server  | `sqlserver`     |
| 📁   | SQLite      | `sqlite`        |
| 🪳   | CockroachDB | `cockroachdb`   |
| 🍃   | MongoDB     | `mongodb`       |

---

## ⚙️ CLI Options

### Command

```
npx zero-config-cli init [outputDir] [options]
```

`init` is the default command, so you can omit it:

```
npx zero-config-cli [outputDir] [options]
```

### Flags

| Flag                          | Description                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `-f, --frontend <name>`       | Frontend template (react, angular, vuejs, nextjs)                              |
| `-b, --backend <name>`        | Backend template (express, nestjs, fastify)                                    |
| `-d, --database <name>`       | Database (postgresql, mysql, mariadb, sqlserver, sqlite, cockroachdb, mongodb) |
| `--frontend-folder <name>`    | Custom folder name for frontend                                                |
| `--backend-folder <name>`     | Custom folder name for backend                                                 |
| `-t, --templates-path <path>` | Local path or GitHub zip URL for templates                                     |
| `--no-install`                | Skip npm install step                                                          |
| `-h, --help`                  | Display help                                                                   |
| `-V, --version`               | Show version                                                                   |

### Examples

```bash
# Interactive
npx zero-config-cli my-project

# Name your folders
npx zero-config-cli my-app --frontend-folder client --backend-folder server

# Non-interactive (CI-friendly)
npx zero-config-cli . -f nextjs -b fastify -d mongodb --no-install

# Use a local templates folder
npx zero-config-cli my-project -t ../zero-config-templates

# Use a GitHub zip directly
npx zero-config-cli my-project -t https://github.com/dhuruvandb/zero-config-templates/archive/main.zip
```

---

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    zero-config-cli                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  src/index.ts      ← Entry point (#!/usr/bin/env node)  │
│  src/cli.ts        ← Commander + @clack/prompts UI      │
│  src/registry.ts   ← Template metadata & DB mapping     │
│  src/resolver.ts   ← Auto-detect templates source       │
│  src/copier.ts     ← Recursive file copy engine         │
│  src/downloader.ts ← GitHub zip fetch + unzipper        │
│  src/prisma-swap.ts← Regex-based Prisma provider swap   │
│  src/generator.ts  ← Orchestrator (copy → swap → write)  │
│  src/installer.ts  ← npm install runner                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
 ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
 │  Templates   │  │  Your Project    │  │  npm Registry│
 │  (local or   │──▶  ./my-project/   │  │  (published) │
 │   GitHub)    │  │  ├─ frontend/    │  └──────────────┘
 └──────────────┘  │  └─ backend/     │
                   └──────────────────┘
```

### Template Source Resolution

The CLI resolves templates in this priority order:

1. **`--templates-path` flag** or `ZERO_CONFIG_TEMPLATES_PATH` env var
2. **Auto-detected sibling** `zero-config-templates/` folder
3. **GitHub fallback** — downloads from `github.com/dhuruvandb/zero-config-templates`

This means it works **offline** if you have the templates locally, or **online** via GitHub download.

---

## 📈 Impact & Time Saved

| Activity                                    | Manual setup | With Zero-Config CLI | Time saved         |
| ------------------------------------------- | ------------ | -------------------- | ------------------ |
| Scaffolding folders + configs               | 10 min       | 0                    | **10 min**         |
| TypeScript + ESLint setup                   | 15 min       | 0                    | **15 min**         |
| JWT auth (register, login, refresh, logout) | 30 min       | 0                    | **30 min**         |
| Prisma ORM + database connection            | 10 min       | 0                    | **10 min**         |
| CRUD endpoints with owner verification      | 20 min       | 0                    | **20 min**         |
| Test setup + writing initial tests          | 15 min       | 0                    | **15 min**         |
| CORS, env vars, security headers            | 10 min       | 0                    | **10 min**         |
| **Total per project**                       | **~110 min** | **~30 sec**          | **~109 min saved** |

**That's nearly 2 hours saved per project.** If you start 10 projects a year, that's **18 hours** — almost a full working week — returned to building actual features.

---

## 💪 What Makes This Different

There are plenty of project generators out there. Here's why `zero-config-cli` stands out:

| Feature                                               | Zero-Config CLI | `create-react-app` | `create-next-app` | `create-nx-workspace` |
| ----------------------------------------------------- | :-------------: | :----------------: | :---------------: | :-------------------: |
| **Full-stack** (frontend + backend)                   |       ✅        |         ❌         |        ❌         |          ❌           |
| **Database selection** (7 options)                    |       ✅        |         ❌         |        ❌         |          ❌           |
| **Multiple frontends** (React, Angular, Vue, Next.js) |       ✅        |         ❌         |        ❌         |          ❌           |
| **Multiple backends** (Express, NestJS, Fastify)      |       ✅        |         ❌         |        ❌         |          ❌           |
| **JWT auth out of the box**                           |       ✅        |         ❌         |        ❌         |          ❌           |
| **Prisma ORM pre-configured**                         |       ✅        |         ❌         |        ❌         |          ❌           |
| **Pre-written tests**                                 |       ✅        |         ❌         |        ❌         |          ❌           |
| **Custom folder names**                               |       ✅        |         ❌         |        ❌         |          ❌           |
| **Interactive prompts**                               |       ✅        |         ✅         |        ✅         |          ✅           |
| **Offline support**                                   |       ✅        |         ❌         |        ❌         |          ❌           |
| **No cloud costs**                                    |       ✅        |         ✅         |        ✅         |          ✅           |
| **Zero config to start coding**                       |       ✅        |         ❌         |        ❌         |          ❌           |

Most generators give you **one framework**. Zero-Config CLI gives you **any combination** of 4 frontends, 3 backends, and 7 databases — **28 distinct stack combinations** — all with auth, CRUD, and tests built in.

---

## 🗺️ The Zero-Config Ecosystem

This CLI is part of a larger ecosystem:

| Project                                                                      | Description                                                                                    |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [zero-config](https://github.com/dhuruvandb/zero-config)                     | 🌐 **Web app** — Visual generator at [zero-config.vercel.app](https://zero-config.vercel.app/) |
| [zero-config-cli](https://github.com/dhuruvandb/zero-config-cli)             | 💻 **You are here** — Terminal-based generator                                                 |
| [zero-config-templates](https://github.com/dhuruvandb/zero-config-templates) | 📦 **Boilerplate source** — All 7 templates with auth, CRUD, and tests                         |

---

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/dhuruvandb/zero-config-cli.git
cd zero-config-cli

# Install dependencies
npm install

# Run in development mode
npm run dev init ./test-project

# Run tests
npm test

# Build for production
npm run build
```

### Test Coverage

```
 ✓ __tests__/registry.test.ts    (14 tests)  — Template metadata validation
 ✓ __tests__/prisma-swap.test.ts (11 tests)  — Prisma provider regex swap

 Test Files  2 passed (2)
      Tests  25 passed (25)
```

---

## 📄 License

MIT © [@dhuruvandb](https://github.com/dhuruvandb)

---

<div align="center">

**Built with ❤️ to save you hours of boilerplate.**  
⭐ Star the repo if you find it useful!

</div>
