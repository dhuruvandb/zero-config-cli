// ---------------------------------------------------------------------------
// Registry — single source of truth for all templates, databases, and mappings
// Ported from zero-config/frontend/app/data/templates.ts and
//            zero-config/frontend/app/types/templates.ts
// ---------------------------------------------------------------------------

// --- Types ----------------------------------------------------------------

export type TemplateType = 'frontend' | 'backend';

export interface FrontendTemplate {
    name: string;
    fullName: string;
    icon: string;
    type: 'frontend';
    version: string;
    port: number;
    description: string;
    technologies: string;
    devCommand: string;
}

export interface BackendTemplate {
    name: string;
    fullName: string;
    icon: string;
    type: 'backend';
    version: string;
    port: number;
    description: string;
    technologies: string;
    devCommand: string;
    database: string;
    databaseIcon: string;
    orm: string;
}

export type Template = FrontendTemplate | BackendTemplate;

export interface DatabaseOption {
    id: string;
    name: string;
    icon: string;
    description: string;
    defaultOrm: string;
}

// --- Template Data --------------------------------------------------------

export const templateData: Record<string, Template> = {
    react: {
        name: 'React',
        fullName: 'React + Vite',
        icon: '⚛️',
        type: 'frontend',
        version: 'v19',
        port: 5173,
        description: 'Auth context, Protected routes, Token refresh',
        technologies: 'React 19, Vite 7.2, React Router v6, TypeScript 5.9, Tailwind CSS',
        devCommand: 'npm run dev',
    },
    angular: {
        name: 'Angular',
        fullName: 'Angular + SSR',
        icon: '🅰️',
        type: 'frontend',
        version: 'v21',
        port: 4200,
        description: 'Auth guards, Signals, Tailwind CSS 4',
        technologies: 'Angular 21, SSR, Signals, Tailwind CSS 4.x, Vitest, RxJS',
        devCommand: 'npm run start',
    },
    vuejs: {
        name: 'Vue.js',
        fullName: 'Vue.js + Vite',
        icon: '💚',
        type: 'frontend',
        version: 'v3',
        port: 5173,
        description: 'Pinia store, Composition API, Oxlint',
        technologies: 'Vue 3.5, Pinia 3.0, Vue Router 4.6, Vite 7.3, Oxlint, Tailwind CSS',
        devCommand: 'npm run dev',
    },
    nextjs: {
        name: 'Next.js',
        fullName: 'Next.js App Router',
        icon: '▲',
        type: 'frontend',
        version: 'v16',
        port: 3000,
        description: 'SQLite auth, Server Actions, Full CRUD',
        technologies: 'Next.js 16, SQLite, Server Actions, Tailwind CSS 4',
        devCommand: 'npm run dev',
    },
    express: {
        name: 'Express',
        fullName: 'Express.js',
        icon: '🚀',
        type: 'backend',
        version: 'v4.18',
        port: 5000,
        description: 'Minimalist, unopinionated, Auto-migration',
        technologies: 'Express 4.18, Prisma 6, JWT, bcrypt, express-validator',
        devCommand: 'npm run dev',
        database: 'PostgreSQL',
        databaseIcon: '🐘',
        orm: 'Prisma',
    },
    nestjs: {
        name: 'NestJS',
        fullName: 'NestJS',
        icon: '🐱',
        type: 'backend',
        version: 'v11',
        port: 5000,
        description: 'Modular architecture, Passport.js',
        technologies: 'NestJS 11, Prisma 6.2, Passport.js, JWT, class-validator',
        devCommand: 'npm run start:dev',
        database: 'PostgreSQL',
        databaseIcon: '🐘',
        orm: 'Prisma',
    },
    fastify: {
        name: 'Fastify',
        fullName: 'Fastify',
        icon: '⚡',
        type: 'backend',
        version: 'v5',
        port: 5000,
        description: 'High-performance, low overhead',
        technologies: 'Fastify 5, Prisma, JWT, Swagger, TypeScript',
        devCommand: 'npm run dev',
        database: 'PostgreSQL',
        databaseIcon: '🐘',
        orm: 'Prisma',
    },
};

// --- Lists ----------------------------------------------------------------

export const ALL_TEMPLATE_KEYS = Object.keys(templateData);

export const FRONTEND_KEYS = Object.entries(templateData)
    .filter(([, t]) => t.type === 'frontend')
    .map(([key]) => key);

export const BACKEND_KEYS = Object.entries(templateData)
    .filter(([, t]) => t.type === 'backend')
    .map(([key]) => key);

// --- Database Options -----------------------------------------------------

export const databaseOptions: DatabaseOption[] = [
    { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', description: 'Relational SQL database', defaultOrm: 'Prisma' },
    { id: 'mysql', name: 'MySQL', icon: '🐬', description: 'Popular open-source RDBMS', defaultOrm: 'Prisma' },
    { id: 'mariadb', name: 'MariaDB', icon: '🪶', description: 'MySQL-compatible fork', defaultOrm: 'Prisma' },
    { id: 'sqlserver', name: 'SQL Server', icon: '🟦', description: 'Microsoft enterprise database', defaultOrm: 'Prisma' },
    { id: 'sqlite', name: 'SQLite', icon: '📁', description: 'Embedded file-based database', defaultOrm: 'Prisma' },
    { id: 'cockroachdb', name: 'CockroachDB', icon: '🪳', description: 'Cloud-native distributed SQL', defaultOrm: 'Prisma' },
    { id: 'mongodb', name: 'MongoDB', icon: '🍃', description: 'NoSQL document database', defaultOrm: 'Prisma' },
];

// --- Provider Map ---------------------------------------------------------
// Maps user-facing database IDs to Prisma provider strings.
// Ported from zero-config/Backend/src/app.service.ts

export const PROVIDER_MAP: Record<string, string> = {
    postgresql: 'postgresql',
    mysql: 'mysql',
    mariadb: 'mysql',
    sqlserver: 'sqlserver',
    sqlite: 'sqlite',
    cockroachdb: 'cockroachdb',
    mongodb: 'mongodb',
};

// --- Allowed Template Whitelist -------------------------------------------
// Ported from zero-config/Backend/src/app.service.ts

export const ALLOWED_TEMPLATES: ReadonlySet<string> = new Set(ALL_TEMPLATE_KEYS);
