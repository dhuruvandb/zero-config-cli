// ---------------------------------------------------------------------------
// Template source resolver
// Ported from zero-config/Backend/src/app.service.ts — resolveTemplateSource()
// ---------------------------------------------------------------------------

import * as fs from 'node:fs';
import * as path from 'node:path';

export type SourceType = 'local' | 'url';

export interface ResolvedSource {
    type: SourceType;
    path: string;
}

/**
 * Resolve where templates live:
 * 1. If `TEMPLATES_PATH` env var is set, use it (local path or URL)
 * 2. Auto-detect sibling `zero-config-templates/` folder relative to CWD
 * 3. Fall back to the GitHub zip URL
 *
 * Ported from the backend's `resolveTemplateSource()`.
 */
export function resolveTemplateSource(templatesPath?: string): ResolvedSource {
    const envPath = templatesPath || process.env.ZERO_CONFIG_TEMPLATES_PATH || '';

    if (envPath) {
        return {
            type: envPath.startsWith('http://') || envPath.startsWith('https://') ? 'url' : 'local',
            path: envPath,
        };
    }

    // Auto-detect: check CWD, then parent, then grandparent
    const candidates = [
        path.resolve(process.cwd(), 'zero-config-templates'),
        path.resolve(process.cwd(), '..', 'zero-config-templates'),
        path.resolve(process.cwd(), '..', '..', 'zero-config-templates'),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return { type: 'local', path: candidate };
        }
    }

    // Fallback — GitHub default branch zip
    return {
        type: 'url',
        path: 'https://github.com/dhuruvandb/zero-config-templates/archive/refs/heads/main.zip',
    };
}
