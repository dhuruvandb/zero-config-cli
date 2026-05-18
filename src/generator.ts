// ---------------------------------------------------------------------------
// Generator — orchestrates template resolution, file copying, and Prisma swap
// Ported from zero-config/Backend/src/app.service.ts — generateCombinedTemplates()
// ---------------------------------------------------------------------------

import * as path from 'node:path';
import * as fs from 'node:fs';
import { ALLOWED_TEMPLATES, FRONTEND_KEYS, BACKEND_KEYS } from './registry.js';
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

    return {
        frontendPath: path.resolve(outputDir, frontendFolder),
        backendPath: path.resolve(outputDir, backendFolder),
        frontendFolder,
        backendFolder,
    };
}


