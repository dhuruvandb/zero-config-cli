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

// ---------------------------------------------------------------------------
// Docker configuration for all stack components
// ---------------------------------------------------------------------------

export interface DockerContainerConfig {
    /** Internal port the container listens on (matches EXPOSE in Dockerfile) */
    containerPort: number;
    /** Start command for the container (the CMD from Dockerfile). Only needed for backends. */
    startCommand?: string;
}

/** Docker config for each frontend template (keyed by template key). */
export const FRONTEND_DOCKER_CONFIG: Record<string, DockerContainerConfig> = {
    react: { containerPort: 80 },    // nginx
    angular: { containerPort: 80 },  // nginx
    vuejs: { containerPort: 80 },    // nginx
    nextjs: { containerPort: 3000 },  // Next.js standalone
};

/** Docker config for each backend template (keyed by template key). */
export const BACKEND_DOCKER_CONFIG: Record<string, DockerContainerConfig> = {
    express: { containerPort: 5000, startCommand: 'node dist/index.js' },
    nestjs: { containerPort: 5000, startCommand: 'node dist/main.js' },
    fastify: { containerPort: 5000, startCommand: 'node dist/index.js' },
};

export interface DatabaseDockerConfig {
    image: string;
    containerPort: number;
    envVars: Record<string, string>;
    healthcheck: { test: string[]; interval: string; retries: number };
    volumeName: string;
    /** Optional container command override (e.g. for replica set setup) */
    command?: string;
    /** Prisma DATABASE_URL template; use {{HOST}} as placeholder for container hostname */
    dbUrlTemplate: string;
}

/** Docker config for each database (keyed by database id). */
export const DATABASE_DOCKER_CONFIG: Record<string, DatabaseDockerConfig> = {
    postgresql: {
        image: 'postgres:16-alpine',
        containerPort: 5432,
        envVars: { POSTGRES_USER: 'postgres', POSTGRES_PASSWORD: 'postgres', POSTGRES_DB: 'myapp' },
        healthcheck: { test: ['CMD-SHELL', 'pg_isready -U postgres'], interval: '5s', retries: 5 },
        volumeName: 'pgdata',
        dbUrlTemplate: 'postgresql://postgres:postgres@{{HOST}}:5432/myapp?schema=public',
    },
    mysql: {
        image: 'mysql:8',
        containerPort: 3306,
        envVars: { MYSQL_ROOT_PASSWORD: 'root', MYSQL_DATABASE: 'myapp' },
        healthcheck: { test: ['CMD-SHELL', 'mysqladmin ping -h localhost -uroot -proot'], interval: '5s', retries: 5 },
        volumeName: 'mysqldata',
        dbUrlTemplate: 'mysql://root:root@{{HOST}}:3306/myapp',
    },
    mariadb: {
        image: 'mariadb:11',
        containerPort: 3306,
        envVars: { MARIADB_ROOT_PASSWORD: 'root', MARIADB_DATABASE: 'myapp' },
        healthcheck: { test: ['CMD-SHELL', 'mysqladmin ping -h localhost -uroot -proot'], interval: '5s', retries: 5 },
        volumeName: 'mariadbdata',
        dbUrlTemplate: 'mysql://root:root@{{HOST}}:3306/myapp',
    },
    sqlserver: {
        image: 'mcr.microsoft.com/mssql/server:2022-latest',
        containerPort: 1433,
        envVars: { ACCEPT_EULA: 'Y', MSSQL_SA_PASSWORD: 'your_password', MSSQL_PID: 'Express' },
        healthcheck: { test: ['CMD-SHELL', '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P your_password -C -Q "SELECT 1" || exit 1'], interval: '10s', retries: 10 },
        volumeName: 'sqldata',
        dbUrlTemplate: 'sqlserver://{{HOST}}:1433;database=myapp;user=sa;password=your_password;trustServerCertificate=true',
    },
    cockroachdb: {
        image: 'cockroachdb/cockroach:latest',
        containerPort: 26257,
        envVars: { COCKROACH_DATABASE: 'myapp' },
        healthcheck: { test: ['CMD-SHELL', 'cockroach node status --insecure --host=localhost || exit 1'], interval: '5s', retries: 5 },
        volumeName: 'cockroachdata',
        dbUrlTemplate: 'postgresql://root@{{HOST}}:26257/myapp?schema=public',
    },
    mongodb: {
        image: 'mongo:7',
        containerPort: 27017,
        envVars: { MONGO_INITDB_DATABASE: 'myapp' },
        command: 'mongod --replSet rs0 --bind_ip_all',
        healthcheck: {
            test: ['CMD-SHELL', 'mongosh --quiet --eval "try { rs.status().ok } catch(e) { rs.initiate({_id:\\"rs0\\\", members:[{_id:0, host:\\"localhost:27017\\"}]}).ok }" || exit 1'],
            interval: '5s',
            retries: 30,
        },
        volumeName: 'mongodata',
        dbUrlTemplate: 'mongodb://{{HOST}}:27017/myapp?replicaSet=rs0&directConnection=true',
    },
};

// --- Allowed Template Whitelist -------------------------------------------
// Ported from zero-config/Backend/src/app.service.ts

export const ALLOWED_TEMPLATES: ReadonlySet<string> = new Set(ALL_TEMPLATE_KEYS);
