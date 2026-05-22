// ---------------------------------------------------------------------------
// npm install runner — installs dependencies in generated project folders
// Shows real-time npm progress so users know it's working.
// ---------------------------------------------------------------------------

import { spawn } from 'node:child_process';
import pc from 'picocolors';

export type InstallScope = 'both' | 'backend' | 'frontend' | 'skip';

/** Visual width of the section header banners (including the box-drawing corners). */
const BANNER_WIDTH = 58;

/**
 * Build a centered banner line with dashes on both sides of the label.
 *
 * @param plainText  The label text *without* ANSI colour codes (used for measuring width).
 * @param coloredText The label text *with* ANSI colour codes (used for display).
 *
 * Example: ┌─────────── Frontend dependencies ───────────┐
 */
function bannerLine(cornerLeft: string, cornerRight: string, plainText: string, coloredText: string): string {
    const inner = BANNER_WIDTH - 2; // space between corners
    if (plainText.length >= inner) return cornerLeft + coloredText.slice(0, inner) + cornerRight;

    const leftDashes = Math.floor((inner - plainText.length) / 2);
    const rightDashes = inner - plainText.length - leftDashes;
    return cornerLeft + '─'.repeat(leftDashes) + coloredText + '─'.repeat(rightDashes) + cornerRight;
}

/**
 * Print a coloured banner header before installing a folder.
 */
function printHeader(label: string): void {
    const text = ` ${label} dependencies `;
    console.log(`\n  ${pc.cyan(bannerLine('┌', '┐', text, text))}`);
}

/**
 * Print a coloured banner footer after installing a folder.
 */
function printFooter(label: string, success: boolean): void {
    const statusText = success ? '✔ done' : '✖ failed';
    const statusColored = success ? pc.green(statusText) : pc.red(statusText);
    const plainText = ` ${label} ${statusText} `;
    const coloredText = ` ${label} ${statusColored} `;
    console.log(`  ${pc.cyan(bannerLine('└', '┘', plainText, coloredText))}\n`);
}

/**
 * Install dependencies in a single directory, streaming npm output to the user.
 */
function installInFolder(label: string, dir: string): Promise<boolean> {
    return new Promise((resolve) => {
        printHeader(label);

        const child = spawn('npm', ['install'], {
            cwd: dir,
            stdio: 'inherit',
            shell: process.platform === 'win32',
        });

        const timer = setTimeout(() => {
            console.log(`  ${pc.yellow('⚠')}  ${label} install is taking longer than expected — still working...`);
        }, 30_000);

        child.on('close', (code) => {
            clearTimeout(timer);
            const success = code === 0;
            printFooter(label, success);
            resolve(success);
        });

        child.on('error', () => {
            clearTimeout(timer);
            printFooter(label, false);
            resolve(false);
        });
    });
}

/**
 * Run npm install in one or both generated project directories.
 * Returns a summary of what was installed.
 */
export async function installDependencies(
    scope: InstallScope,
    frontendPath: string,
    backendPath: string,
): Promise<{ installed: string[]; failed: string[] }> {
    const installed: string[] = [];
    const failed: string[] = [];

    const tasks: { label: string; path: string; shouldRun: boolean }[] = [
        { label: 'Frontend', path: frontendPath, shouldRun: scope === 'both' || scope === 'frontend' },
        { label: 'Backend', path: backendPath, shouldRun: scope === 'both' || scope === 'backend' },
    ];

    for (const task of tasks) {
        if (!task.shouldRun) continue;

        const ok = await installInFolder(task.label, task.path);
        if (ok) {
            installed.push(task.label);
        } else {
            failed.push(task.label);
        }
    }

    return { installed, failed };
}
