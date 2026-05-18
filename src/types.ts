// ---------------------------------------------------------------------------
// Shared types for template file handling
// Ported from zero-config/Backend/src/app.service.ts (TemplateFile interface)
// ---------------------------------------------------------------------------

/** A single file extracted or read from a template. */
export interface TemplateFile {
    /** Relative path within the template (e.g. "package.json") */
    path: string;
    /** Raw file content */
    content: Buffer;
}
