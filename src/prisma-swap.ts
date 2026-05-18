// ---------------------------------------------------------------------------
// Prisma provider replacer
// Ported from zero-config/Backend/src/app.service.ts — replacePrismaProvider()
// ---------------------------------------------------------------------------

import type { TemplateFile } from './types.js';
import { PROVIDER_MAP } from './registry.js';

/**
 * Replace the Prisma datasource provider in all schema.prisma files.
 *
 * Targets only the `datasource db { ... }` block's provider line,
 * not the `generator client { ... }` block.
 *
 * Ported from the backend's `replacePrismaProvider()`.
 */
export function replacePrismaProvider(
    files: TemplateFile[],
    database: string | undefined,
): void {
    if (!database) return;

    const provider = PROVIDER_MAP[database];
    if (!provider) {
        console.warn(`[warn] Unknown database "${database}", skipping Prisma provider replacement`);
        return;
    }

    for (const file of files) {
        if (!file.path.endsWith('prisma/schema.prisma')) continue;

        const content = file.content.toString('utf-8');

        // Match: datasource db { ... provider = "current_provider" ... }
        const updated = content.replace(
            /(datasource db\s*\{[\s\S]*?provider\s*=\s*")[a-z0-9\-_]+(")/,
            `$1${provider}$2`,
        );

        if (updated !== content) {
            file.content = Buffer.from(updated, 'utf-8');
        }
    }
}

/**
 * Replace the test Prisma schema provider (schema.test.prisma) as well.
 * Some templates have a separate test database schema.
 */
export function replacePrismaTestProvider(
    files: TemplateFile[],
    database: string | undefined,
): void {
    if (!database) return;

    const provider = PROVIDER_MAP[database];
    if (!provider) return;

    for (const file of files) {
        if (!file.path.endsWith('prisma/schema.test.prisma')) continue;

        const content = file.content.toString('utf-8');
        const updated = content.replace(
            /(datasource db\s*\{[\s\S]*?provider\s*=\s*")[a-z0-9\-_]+(")/,
            `$1${provider}$2`,
        );

        if (updated !== content) {
            file.content = Buffer.from(updated, 'utf-8');
        }
    }
}
