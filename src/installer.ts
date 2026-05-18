// ---------------------------------------------------------------------------
// npm install runner — installs dependencies in generated project folders
// ---------------------------------------------------------------------------

import { execSync } from 'node:child_process';

export type InstallScope = 'both' | 'backend' | 'frontend' | 'skip';

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

        try {
            execSync('npm install', {
                cwd: task.path,
                stdio: 'pipe',
                timeout: 120_000, // 2 minutes per folder
            });
            installed.push(task.label);
        } catch {
            failed.push(task.label);
        }
    }

    return { installed, failed };
}
