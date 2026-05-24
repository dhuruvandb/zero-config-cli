// ---------------------------------------------------------------------------
// Generator — orchestrates template resolution, file copying, and Prisma swap
// Ported from zero-config/Backend/src/app.service.ts — generateCombinedTemplates()
// ---------------------------------------------------------------------------

import * as path from 'node:path';
import * as fs from 'node:fs';
import crypto from 'node:crypto';
import { ALLOWED_TEMPLATES, FRONTEND_KEYS, BACKEND_KEYS, PROVIDER_MAP, templateData } from './registry.js';
import { FRONTEND_DOCKER_CONFIG, BACKEND_DOCKER_CONFIG, DATABASE_DOCKER_CONFIG } from './registry.js';
import type { DatabaseDockerConfig } from './registry.js';
import { resolveTemplateSource } from './resolver.js';
import { readLocalTemplateFolder, writeTemplateFiles } from './copier.js';
import { fetchZip, extractTemplateFolder } from './downloader.js';
import { replacePrismaProvider, replacePrismaTestProvider } from './prisma-swap.js';
import type { TemplateFile } from './types.js';

export interface GenerateOptions {
    /** Frontend template key (e.g. "react") */
    frontend: string;
    /** Backend template key (e.g. "express") */
    backend: string;
    /** Database ID (e.g. "postgresql") */
    database: string;
    /** Output directory — the parent where frontend/backend folders go */
    outputDir: string;
    /** Custom folder name for the frontend template (defaults to template key) */
    frontendFolderName?: string;
    /** Custom folder name for the backend template (defaults to template key) */
    backendFolderName?: string;
    /** Explicit templates path (local folder or GitHub zip URL) */
    templatesPath?: string;
}

export interface GenerateResult {
    frontendPath: string;
    backendPath: string;
    frontendFolder: string;
    backendFolder: string;
}

/**
 * Validate that the selected templates are allowed and correctly paired.
 */
function validateOptions(opts: GenerateOptions): void {
    if (!ALLOWED_TEMPLATES.has(opts.frontend)) {
        throw new Error(
            `Invalid frontend: "${opts.frontend}". Allowed: ${FRONTEND_KEYS.join(', ')}`,
        );
    }
    if (!ALLOWED_TEMPLATES.has(opts.backend)) {
        throw new Error(
            `Invalid backend: "${opts.backend}". Allowed: ${BACKEND_KEYS.join(', ')}`,
        );
    }
    if (!FRONTEND_KEYS.includes(opts.frontend)) {
        throw new Error(
            `"${opts.frontend}" is not a frontend template. Expected one of: ${FRONTEND_KEYS.join(', ')}`,
        );
    }
    if (!BACKEND_KEYS.includes(opts.backend)) {
        throw new Error(
            `"${opts.backend}" is not a backend template. Expected one of: ${BACKEND_KEYS.join(', ')}`,
        );
    }
}

/**
 * Generate a full-stack project:
 * 1. Resolve template source
 * 2. Copy/extract frontend + backend templates
 * 3. Swap Prisma provider in backend
 * 4. Write to output directory
 */
export async function generateProject(opts: GenerateOptions): Promise<GenerateResult> {
    validateOptions(opts);

    const source = resolveTemplateSource(opts.templatesPath);
    const frontendFolder = opts.frontendFolderName || opts.frontend;
    const backendFolder = opts.backendFolderName || opts.backend;

    // Create output directory
    const outputDir = path.resolve(process.cwd(), opts.outputDir);
    fs.mkdirSync(outputDir, { recursive: true });

    // --- Resolve templates ---
    let frontendFiles: TemplateFile[];
    let backendFiles: TemplateFile[];

    if (source.type === 'local') {
        frontendFiles = readLocalTemplateFolder(opts.frontend, source.path);
        backendFiles = readLocalTemplateFolder(opts.backend, source.path);
    } else {
        // Download once, extract both templates from the same zip
        let zipBuffer: Buffer;
        try {
            zipBuffer = await fetchZip(source.path);
        } catch (err) {
            throw new Error(
                `Could not download templates from ${source.path}. ` +
                'Check your internet connection or set ZERO_CONFIG_TEMPLATES_PATH to a local folder.',
            );
        }

        try {
            [frontendFiles, backendFiles] = await Promise.all([
                extractTemplateFolder(zipBuffer, opts.frontend),
                extractTemplateFolder(zipBuffer, opts.backend),
            ]);
        } catch (err) {
            throw new Error(
                `Failed to extract templates from the archive: ${err instanceof Error ? err.message : 'Unknown error'}`,
            );
        }
    }

    // --- Swap Prisma provider in backend ---
    replacePrismaProvider(backendFiles, opts.database);
    replacePrismaTestProvider(backendFiles, opts.database);

    // --- Prefix paths with folder names ---
    for (const file of frontendFiles) {
        file.path = `${frontendFolder}/${file.path}`;
    }
    for (const file of backendFiles) {
        file.path = `${backendFolder}/${file.path}`;
    }

    // --- Write to disk ---
    const allFiles = [...frontendFiles, ...backendFiles];
    writeTemplateFiles(allFiles, outputDir);

    // --- Generate .env file with development defaults ---
    const dbProvider = PROVIDER_MAP[opts.database] || 'postgresql';
    const defaultDbUrls: Record<string, string> = {
        postgresql: 'postgresql://postgres:postgres@localhost:5432/myapp?schema=public',
        mysql: 'mysql://root:root@localhost:3306/myapp',
        sqlserver: 'sqlserver://localhost:1433;database=myapp;user=sa;password=your_password',
        sqlite: 'file:./dev.db',
        cockroachdb: 'postgresql://root@localhost:26257/myapp?schema=public',
        mongodb: 'mongodb://localhost:27017/myapp',
    };
    const dbUrl = defaultDbUrls[dbProvider] || `file:./dev.db`;

    const accessSecret = crypto.randomBytes(32).toString('hex');
    const refreshSecret = crypto.randomBytes(32).toString('hex');

    const envContent = [
        `# Database Connection (Prisma)`,
        `DATABASE_URL="${dbUrl}"`,
        ``,
        `# Server Configuration`,
        `PORT=5000`,
        `FRONTEND_URL=http://localhost:5173`,
        ``,
        `# JWT Secrets (auto-generated — replace in production)`,
        `ACCESS_TOKEN_SECRET=${accessSecret}`,
        `REFRESH_TOKEN_SECRET=${refreshSecret}`,
        ``,
        `# JWT Expiry`,
        `ACCESS_TOKEN_EXPIRY=15m`,
        `REFRESH_TOKEN_EXPIRY=7d`,
        ``,
    ].join('\n');

    fs.writeFileSync(path.resolve(outputDir, backendFolder, '.env'), envContent, 'utf-8');

    // --- Generate docker-compose.yml at project root ---
    const composeContent = generateDockerCompose({
        frontend: opts.frontend,
        backend: opts.backend,
        database: opts.database,
        frontendFolder,
        backendFolder,
        outputDir,
    });
    fs.writeFileSync(path.resolve(outputDir, 'docker-compose.yml'), composeContent, 'utf-8');

    return {
        frontendPath: path.resolve(outputDir, frontendFolder),
        backendPath: path.resolve(outputDir, backendFolder),
        frontendFolder,
        backendFolder,
    };
}


// ---------------------------------------------------------------------------
// Docker Compose generator
// ---------------------------------------------------------------------------

interface ComposeOptions {
    frontend: string;
    backend: string;
    database: string;
    frontendFolder: string;
    backendFolder: string;
    outputDir: string;
}

function generateDockerCompose(opts: ComposeOptions): string {
    const feDocker = FRONTEND_DOCKER_CONFIG[opts.frontend];
    const beDocker = BACKEND_DOCKER_CONFIG[opts.backend];
    const feInfo = templateData[opts.frontend];
    const beInfo = templateData[opts.backend];

    // --- Database service ---
    const dbLines: string[] = [];
    const volumeLines: string[] = [];
    let dbServiceName = '';
    let dockerDbUrl = '';

    if (opts.database !== 'sqlite') {
        const dbConfig: DatabaseDockerConfig | undefined = DATABASE_DOCKER_CONFIG[opts.database];
        if (dbConfig) {
            dbServiceName = `${opts.database}-db`;
            dockerDbUrl = dbConfig.dbUrlTemplate.replace('{{HOST}}', dbServiceName);

            const envEntries = Object.entries(dbConfig.envVars)
                .map(([k, v]) => `      ${k}: "${v}"`)
                .join('\n');

            dbLines.push(`  ${dbServiceName}:`);
            dbLines.push(`    image: ${dbConfig.image}`);
            dbLines.push(`    restart: unless-stopped`);
            dbLines.push(`    ports:`);
            dbLines.push(`      - "${dbConfig.containerPort}:${dbConfig.containerPort}"`);
            dbLines.push(`    environment:`);
            dbLines.push(envEntries);
            dbLines.push(`    healthcheck:`);
            dbLines.push(`      test: ${JSON.stringify(dbConfig.healthcheck.test)}`);
            dbLines.push(`      interval: ${dbConfig.healthcheck.interval}`);
            dbLines.push(`      retries: ${dbConfig.healthcheck.retries}`);
            dbLines.push(`    volumes:`);
            dbLines.push(`      - ${dbConfig.volumeName}:/var/lib/${opts.database}/data`);

            volumeLines.push(`  ${dbConfig.volumeName}:`);
        }
    }

    // --- Backend service ---
    const feHostPort = feInfo?.port ?? feDocker?.containerPort ?? 3000;
    const beHostPort = beInfo?.port ?? beDocker?.containerPort ?? 5000;
    const feUrl = `http://localhost:${feHostPort}`;

    const backendLines: string[] = [];
    backendLines.push(`  backend:`);
    backendLines.push(`    build: ./${opts.backendFolder}`);
    backendLines.push(`    restart: unless-stopped`);
    backendLines.push(`    env_file: ./${opts.backendFolder}/.env`);
    backendLines.push(`    ports:`);
    backendLines.push(`      - "${beHostPort}:${beDocker?.containerPort ?? 5000}"`);
    backendLines.push(`    environment:`);
    if (dbServiceName && dockerDbUrl) {
        backendLines.push(`      DATABASE_URL: "${dockerDbUrl}"`);
    } else if (opts.database === 'sqlite') {
        backendLines.push(`      DATABASE_URL: "file:./dev.db"`);
    }
    backendLines.push(`      PORT: "${beDocker?.containerPort ?? 5000}"`);
    backendLines.push(`      FRONTEND_URL: "${feUrl}"`);
    backendLines.push(`    command: sh -c "./node_modules/.bin/prisma db push && ${beDocker?.startCommand ?? 'node dist/index.js'}"`);
    if (dbServiceName) {
        backendLines.push(`    depends_on:`);
        backendLines.push(`      ${dbServiceName}:`);
        backendLines.push(`        condition: service_healthy`);
    }

    // --- Frontend service ---
    const frontendLines: string[] = [];
    frontendLines.push(`  frontend:`);
    frontendLines.push(`    build: ./${opts.frontendFolder}`);
    frontendLines.push(`    restart: unless-stopped`);
    frontendLines.push(`    ports:`);
    frontendLines.push(`      - "${feHostPort}:${feDocker?.containerPort ?? 80}"`);
    frontendLines.push(`    depends_on:`);
    frontendLines.push(`      - backend`);

    // --- Assemble ---
    const lines: string[] = [
        '# =============================================================================',
        `# docker-compose.yml — auto-generated by zero-config-cli`,
        `# Stack: ${opts.frontend} (frontend) + ${opts.backend} (backend) + ${opts.database}`,
        '# =============================================================================',
        '',
        'services:',
        ...dbLines,
        ...backendLines,
        '',
        ...frontendLines,
    ];

    if (volumeLines.length > 0) {
        lines.push('');
        lines.push('volumes:');
        lines.push(...volumeLines);
    }

    lines.push('');

    return lines.join('\n');
}


