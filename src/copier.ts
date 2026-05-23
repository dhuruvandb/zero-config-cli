// ---------------------------------------------------------------------------
// Local template copier — walks a directory and returns all files as buffers
// Ported from zero-config/Backend/src/app.service.ts — readLocalTemplateFolder()
// ---------------------------------------------------------------------------

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TemplateFile } from './types.js';

/**
 * Recursively read a template directory and return all files with their paths.
 * Mirror of the backend's `readLocalTemplateFolder()`.
 */
export function readLocalTemplateFolder(
    templateName: string,
    basePath: string,
): TemplateFile[] {
    const templateDir = path.join(basePath, templateName);
    const files: TemplateFile[] = [];

    if (!fs.existsSync(templateDir)) {
        throw new Error(
            `Template "${templateName}" not found at: ${templateDir}. ` +
            'Make sure the templates path is correct.',
        );
    }

    walkDir(templateDir, '', files);
    return files;
}

function walkDir(dir: string, relativePrefix: string, files: TemplateFile[]): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        // Skip node_modules — they bloat generated projects and cause hangs
        if (entry.name === 'node_modules') continue;

        const fullPath = path.join(dir, entry.name);
        const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            walkDir(fullPath, relPath, files);
        } else if (entry.isFile()) {
            files.push({ path: relPath, content: fs.readFileSync(fullPath) });
        }
    }
}

/**
 * Write template files to a target output directory.
 * Creates directories as needed.
 */
export function writeTemplateFiles(
    files: TemplateFile[],
    outputDir: string,
): void {
    for (const file of files) {
        const absolutePath = path.resolve(outputDir, file.path);
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
        fs.writeFileSync(absolutePath, file.content);
    }
}
