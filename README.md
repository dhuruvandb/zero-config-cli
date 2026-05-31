<div align="center">

# zero-config-cli ⚡

### **Generate production-ready full-stack projects from your terminal — zero config required.**

[![npm version](https://img.shields.io/npm/v/zero-config-cli?style=for-the-badge&logo=npm&color=cb3837)](https://www.npmjs.com/package/zero-config-cli)
[![npm downloads](https://img.shields.io/npm/dt/zero-config-cli?style=for-the-badge&logo=npm&color=37b24d)](https://www.npmjs.com/package/zero-config-cli)
[![license](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-339933?style=for-the-badge&logo=node.js)](package.json)
[![website](https://img.shields.io/badge/website-zero--config.vercel.app-2ec4b6?style=for-the-badge&logo=vercel)](https://zero-config.vercel.app)

```
npx zero-config-cli my-project
```

🌐 **Live site:** [zero-config.vercel.app](https://zero-config.vercel.app)

</div>

---

## 🎯 The Problem

Every new project starts the same way: **45–90 minutes** of scaffolding folders, wiring auth, configuring Prisma, setting up tests, debugging CORS, and writing boilerplate CRUD.

**That's hours of your life. Every single time.**

---

## ⚡ The Solution

**Zero-Config CLI** generates a fully configured, production-ready full-stack project in **under 30 seconds**.

| Step | What you get                                                     |
| ---- | ---------------------------------------------------------------- |
| 1    | Pick a frontend (React · Angular · Vue.js · Next.js)             |
| 2    | Pick a backend (Express · NestJS · Fastify)                      |
| 3    | Pick a database (PostgreSQL · MySQL · SQLite · etc.)             |
| 4    | **Done.** Full-stack project with auth, CRUD, tests, and Docker. |

### What ships with every project

✅ JWT auth (access + refresh token rotation)  
✅ Full CRUD with ownership verification  
✅ Prisma ORM pre-configured for your database  
✅ bcrypt password hashing with strong validation  
✅ Pre-written tests (auth, CRUD, edge cases)  
✅ Production Dockerfiles + auto-generated `docker-compose.yml`  
✅ **CI/CD pipeline** — `.github/workflows/build-and-test.yml` with parallel frontend/backend testing, Prisma validation, and Docker image builds  
✅ TypeScript, CORS, env vars — all wired up

**84 stack combinations.** One command.

---

## 🚀 Quick Start

```bash
# Interactive — guided prompts
npx zero-config-cli my-project

# Non-interactive — scripts & CI
npx zero-config-cli my-project -f react -b express -d postgresql

# One-command deploy
cd my-project && docker compose up -d
```

---

## 🧩 Templates

### Frontend

| Icon | Name    | Stack                            | Port |
| ---- | ------- | -------------------------------- | ---- |
| ⚛️   | React   | React 19 + Vite 7 + Tailwind CSS | 5173 |
| 🅰️   | Angular | Angular 21 + SSR + Signals       | 4200 |
| 💚   | Vue.js  | Vue 3.5 + Pinia + Vite 7         | 5173 |
| ▲    | Next.js | Next.js 16 + App Router + SQLite | 3000 |

### Backend

| Icon | Name    | Stack                                       | Port |
| ---- | ------- | ------------------------------------------- | ---- |
| 🚀   | Express | Express 4.18 + Prisma + JWT + Jest          | 5000 |
| 🐱   | NestJS  | NestJS 11 + Passport + Prisma + Jest        | 5000 |
| ⚡   | Fastify | Fastify 5 + JWT + Prisma + Swagger + Vitest | 5000 |

### Databases: PostgreSQL · MySQL · MariaDB · SQL Server · SQLite · CockroachDB · MongoDB

---

## ⚙️ CLI Options

```
npx zero-config-cli [outputDir] [options]
```

| Flag                          | Description                                                         |
| ----------------------------- | ------------------------------------------------------------------- |
| `-f, --frontend <name>`       | react, angular, vuejs, nextjs                                       |
| `-b, --backend <name>`        | express, nestjs, fastify                                            |
| `-d, --database <name>`       | postgresql, mysql, mariadb, sqlserver, sqlite, cockroachdb, mongodb |
| `--frontend-folder <name>`    | Custom frontend folder name                                         |
| `--backend-folder <name>`     | Custom backend folder name                                          |
| `-t, --templates-path <path>` | Local path or GitHub zip URL                                        |
| `--no-install`                | Skip npm install                                                    |

### Examples

```bash
npx zero-config-cli my-app --frontend-folder client --backend-folder server
npx zero-config-cli . -f nextjs -b fastify -d mongodb --no-install
npx zero-config-cli my-project -t ../zero-config-templates
```

---

## 🛠️ Development

```bash
git clone https://github.com/dhuruvandb/zero-config-cli.git
cd zero-config-cli
npm install
npm run dev init ./test-project
npm test
```

### Test Coverage

```
 ✓ __tests__/registry.test.ts        (31 tests)
 ✓ __tests__/prisma-swap.test.ts     (14 tests)
 ✓ __tests__/docker-compose.test.ts  (25 tests)
 ✓ __tests__/cicd.test.ts            (15 tests)  ← CI/CD workflow generation

 Test Files  4 passed (4)
      Tests  85 passed (85)
```

---

## 📄 License

MIT © [@dhuruvandb](https://github.com/dhuruvandb)

---

<div align="center">

**Built with ❤️ to save you hours of boilerplate.**  
⭐ [Star on GitHub](https://github.com/dhuruvandb/zero-config-cli)

</div>
