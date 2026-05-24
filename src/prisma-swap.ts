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
 * Also handles MongoDB-specific schema transformations (e.g. @map("_id")).
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

        let content = file.content.toString('utf-8');

        // Replace datasource provider
        content = content.replace(
            /(datasource db\s*\{[\s\S]*?provider\s*=\s*")[a-z0-9\-_]+(")/,
            `$1${provider}$2`,
        );

        // MongoDB-specific: id fields need @map("_id") and auto() instead of cuid()/uuid()
        if (database === 'mongodb') {
            content = content.replace(
                /id\s+String\s+@id\s+@default\((cuid|uuid)\(\)\)/g,
                'id  String   @id @default(auto()) @map("_id") @db.ObjectId',
            );
        }

        if (content !== file.content.toString('utf-8')) {
            file.content = Buffer.from(content, 'utf-8');
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

        let content = file.content.toString('utf-8');

        // Replace datasource provider
        content = content.replace(
            /(datasource db\s*\{[\s\S]*?provider\s*=\s*")[a-z0-9\-_]+(")/,
            `$1${provider}$2`,
        );

        // MongoDB-specific: id fields need @map("_id") and auto() instead of cuid()/uuid()
        if (database === 'mongodb') {
            content = content.replace(
                /id\s+String\s+@id\s+@default\((cuid|uuid)\(\)\)/g,
                'id  String   @id @default(auto()) @map("_id") @db.ObjectId',
            );
        }

        if (content !== file.content.toString('utf-8')) {
            file.content = Buffer.from(content, 'utf-8');
        }
    }
}
