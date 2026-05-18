// ---------------------------------------------------------------------------
// GitHub zip downloader + extractor
// Ported from zero-config/Backend/src/app.service.ts — extractTemplateFolder()
// ---------------------------------------------------------------------------

import unzipper from 'unzipper';
import type { TemplateFile } from './types.js';

const FETCH_TIMEOUT = 30_000; // 30 seconds
const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_EXTRACTED_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * Fetch a zip archive from a URL with a timeout.
 */
export async function fetchZip(url: string): Promise<Buffer> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch templates from ${url} (HTTP ${response.status})`,
            );
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        if (buffer.length > MAX_ZIP_SIZE) {
            throw new Error('Template archive exceeds maximum size (50MB)');
        }

        return buffer;
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Extract a single template folder from a zip buffer.
 * Ported from the backend's `extractTemplateFolder()`.
 */
export async function extractTemplateFolder(
    zipBuffer: Buffer,
    templateName: string,
): Promise<TemplateFile[]> {
    let totalExtractedSize = 0;

    const directory = await unzipper.Open.buffer(zipBuffer);
    const repoPrefix = directory.files[0]?.path.split('/')[0] || '';
    const templatePath = `${repoPrefix}/${templateName}/`;

    const templateFiles = directory.files.filter((file) =>
        file.path.startsWith(templatePath),
    );

    if (templateFiles.length === 0) {
        throw new Error(
            `Template "${templateName}" not found in the archive. ` +
            'Make sure the template name is correct and the archive contains the expected folder.',
        );
    }

    const files: TemplateFile[] = [];

    for (const file of templateFiles) {
        if (file.type !== 'File') continue;

        const content = await file.buffer();

        totalExtractedSize += content.length;
        if (totalExtractedSize > MAX_EXTRACTED_SIZE) {
            throw new Error('Total extracted size exceeds maximum (100MB)');
        }

        const relativePath = file.path.replace(templatePath, '');

        // Prevent path traversal
        if (relativePath.includes('..') || relativePath.startsWith('/')) {
            continue;
        }

        files.push({ path: relativePath, content });
    }

    return files;
}

/**
 * Download templates from URL, then extract a specific template folder.
 */
export async function downloadAndExtract(
    url: string,
    templateName: string,
): Promise<TemplateFile[]> {
    const zipBuffer = await fetchZip(url);
    return extractTemplateFolder(zipBuffer, templateName);
}
