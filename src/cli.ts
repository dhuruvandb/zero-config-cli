// ---------------------------------------------------------------------------
// CLI interface — Commander setup + interactive prompts via @clack/prompts
// ---------------------------------------------------------------------------

import { Command } from 'commander';
import { intro, outro, select, text, spinner, note, cancel, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import { templateData, FRONTEND_KEYS, BACKEND_KEYS, databaseOptions } from './registry.js';
import { generateProject } from './generator.js';
import { installDependencies, type InstallScope } from './installer.js';
import type { GenerateResult } from './generator.js';

const PKG = { version: '1.0.0', name: 'zero-config-cli' } as const;

/** Prompt user to select a frontend framework. */
async function promptFrontend(): Promise<string> {
    const choices = FRONTEND_KEYS.map((key) => {
        const t = templateData[key];
        return {
            value: key,
            label: `${t.icon}  ${t.name} ${t.version}`,
            hint: `Port ${t.port} · ${t.description}`,
        };
    });

    const result = await select({
        message: 'Select a frontend framework:',
        options: choices,
    });

    if (isCancel(result)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    return result as string;
}

/** Ask user for a custom folder name, with a default fallback. */
async function promptFolderName(defaultName: string, label: string): Promise<string> {
    const result = await text({
        message: `Enter folder name for ${label}:`,
        placeholder: defaultName,
        defaultValue: defaultName,
        validate: (value) => {
            if (!value || value.trim().length === 0) return 'Folder name cannot be empty';
            if (!/^[a-zA-Z0-9\-_]+$/.test(value.trim())) {
                return 'Folder name must only contain letters, numbers, hyphens, and underscores';
            }
        },
    });

    if (isCancel(result)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    return (result as string).trim() || defaultName;
}

/** Prompt user to select a backend framework. */
async function promptBackend(): Promise<string> {
    const choices = BACKEND_KEYS.map((key) => {
        const t = templateData[key];
        return {
            value: key,
            label: `${t.icon}  ${t.name} ${t.version}`,
            hint: `Port ${t.port} · ${t.description}`,
        };
    });

    const result = await select({
        message: 'Select a backend framework:',
        options: choices,
    });

    if (isCancel(result)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    return result as string;
}

/** Prompt user to select a database. */
async function promptDatabase(): Promise<string> {
    const choices = databaseOptions.map((db) => ({
        value: db.id,
        label: `${db.icon}  ${db.name}`,
        hint: db.description,
    }));

    const result = await select({
        message: 'Select a database:',
        options: choices,
    });

    if (isCancel(result)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    return result as string;
}

/** Prompt user for npm install scope. */
async function promptInstallScope(): Promise<InstallScope> {
    const result = await select({
        message: 'Install dependencies?',
        options: [
            { value: 'both', label: 'Yes (both frontend & backend)', hint: 'Recommended' },
            { value: 'backend', label: 'Backend only' },
            { value: 'frontend', label: 'Frontend only' },
            { value: 'skip', label: 'Skip' },
        ],
        initialValue: 'both',
    });

    if (isCancel(result)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    return result as InstallScope;
}

// ---------------------------------------------------------------------------
// Main interactive flow
// ---------------------------------------------------------------------------

async function runInteractive(outputDir: string, options: Record<string, any>): Promise<void> {
    intro(pc.bold(pc.cyan('Zero-Config Starter Generator')));

    // Step 1: Frontend
    const frontend = options.frontend || (await promptFrontend());
    const frontendFolder = options.frontendFolder || (await promptFolderName(frontend, 'frontend'));

    // Step 2: Backend
    const backend = options.backend || (await promptBackend());
    const backendFolder = options.backendFolder || (await promptFolderName(backend, 'backend'));

    // Step 3: Database
    const database = options.database || (await promptDatabase());

    // Generate
    const genSpinner = spinner();
    genSpinner.start('Generating your project...');

    try {
        const result: GenerateResult = await generateProject({
            frontend,
            backend,
            database,
            outputDir,
            frontendFolderName: frontendFolder,
            backendFolderName: backendFolder,
            templatesPath: options.templatesPath,
        });

        genSpinner.stop('Project generated successfully!');

        note(
            `📁  ${pc.bold(outputDir)}/\n` +
            `   ${result.frontendFolder}/\n` +
            `   ${result.backendFolder}/\n` +
            `🗄️  Database: ${databaseOptions.find((d) => d.id === database)?.name || database}`,
            'Generated Structure',
        );

        // Step 4: npm install (skip with --no-install flag)
        const installScope: InstallScope =
            options.install === false ? 'skip' : await promptInstallScope();

        if (installScope !== 'skip') {
            console.log(`  ${pc.cyan('Installing dependencies...')}`);

            const { installed, failed } = await installDependencies(
                installScope,
                result.frontendPath,
                result.backendPath,
            );

            if (failed.length > 0 && installed.length === 0) {
                console.log(`  ${pc.red(`✖ Installation failed in ${failed.join(' & ')}`)}`);
            } else if (failed.length > 0) {
                console.log(`  ${pc.green(`✔ Installed in ${installed.join(' & ')}`)}  ${pc.red(`✖ Failed in ${failed.join(' & ')}`)}`);
            } else if (installed.length > 0) {
                console.log(`  ${pc.green(`✔ Dependencies installed in ${installed.join(' & ')}`)}`);
            }
        }

        // Final message
        const fe = templateData[frontend];
        const be = templateData[backend];
        const db = databaseOptions.find((d) => d.id === database)!;

        outro(
            `${pc.green('✨')}  Your stack is ready!\n\n` +
            `   ${fe.icon}  Frontend: ${pc.cyan(`cd ${outputDir}/${result.frontendFolder} && ${fe.devCommand}`)}   →  ${pc.underline(`http://localhost:${fe.port}`)}\n` +
            `   ${be.icon}  Backend:  ${pc.cyan(`cd ${outputDir}/${result.backendFolder} && ${be.devCommand}`)}   →  ${pc.underline(`http://localhost:${be.port}`)}\n` +
            `   ${db.icon}  Database: ${db.name}\n\n` +
            `   ${pc.dim('Happy coding! 🚀')}`,
        );
    } catch (err) {
        genSpinner.stop('Generation failed');
        const message = err instanceof Error ? err.message : 'Unknown error';
        cancel(`${pc.red('Error:')} ${message}`);
        process.exit(1);
    }
}

// ---------------------------------------------------------------------------
// Non-interactive / flag-based mode
// ---------------------------------------------------------------------------

async function runNonInteractive(outputDir: string, options: Record<string, any>): Promise<void> {
    if (!options.frontend || !options.backend || !options.database) {
        console.error(
            pc.red('Error:') +
            ' In non-interactive mode you must provide --frontend, --backend, and --database flags.\n' +
            `  Example: npx zero-config my-project -f react -b express -d postgresql`,
        );
        process.exit(1);
    }

    const frontendFolder = options.frontendFolder || options.frontend;
    const backendFolder = options.backendFolder || options.backend;

    try {
        const result = await generateProject({
            frontend: options.frontend,
            backend: options.backend,
            database: options.database,
            outputDir,
            frontendFolderName: frontendFolder,
            backendFolderName: backendFolder,
            templatesPath: options.templatesPath,
        });

        console.log(pc.green('✅  Project generated successfully!'));
        console.log(`   ${outputDir}/${result.frontendFolder}/`);
        console.log(`   ${outputDir}/${result.backendFolder}/`);

        if (options.install !== false) {
            console.log(pc.cyan('\nInstalling dependencies...'));

            const { installed, failed } = await installDependencies(
                'both',
                result.frontendPath,
                result.backendPath,
            );

            if (failed.length > 0 && installed.length === 0) {
                console.log(pc.red(`✖ Installation failed in ${failed.join(' & ')}`));
            } else if (failed.length > 0) {
                console.log(pc.green(`✔ Installed in ${installed.join(' & ')}`) + '  ' + pc.red(`✖ Failed in ${failed.join(' & ')}`));
            } else if (installed.length > 0) {
                console.log(pc.green(`✔ Dependencies installed in ${installed.join(' & ')}`));
            }
        }

        const fe = templateData[options.frontend];
        const be = templateData[options.backend];
        console.log(`\n${pc.bold('Next steps:')}`);
        console.log(`   ${fe.icon}  Frontend: cd ${outputDir}/${result.frontendFolder} && ${fe.devCommand}`);
        console.log(`   ${be.icon}  Backend:  cd ${outputDir}/${result.backendFolder} && ${be.devCommand}`);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(pc.red('Error:'), message);
        process.exit(1);
    }
}

// ---------------------------------------------------------------------------
// Commander setup
// ---------------------------------------------------------------------------

export function createCLI(): Command {
    const program = new Command();

    program
        .name('zero-config')
        .description('Generate production-ready full-stack starter projects with zero config')
        .version(PKG.version);

    program
        .command('init', { isDefault: true })
        .description('Generate a new full-stack starter project')
        .argument('[outputDir]', 'Output directory name', 'my-project')
        .option('-f, --frontend <name>', 'Frontend template (react, angular, vuejs, nextjs)')
        .option('-b, --backend <name>', 'Backend template (express, nestjs, fastify)')
        .option('-d, --database <name>', 'Database (postgresql, mysql, mariadb, sqlserver, sqlite, cockroachdb, mongodb)')
        .option('--frontend-folder <name>', 'Custom folder name for frontend')
        .option('--backend-folder <name>', 'Custom folder name for backend')
        .option('--no-install', 'Skip npm install step')
        .option('-t, --templates-path <path>', 'Path to templates folder or GitHub zip URL')
        .action(async (outputDir, options) => {
            const isInteractive = !options.frontend && !options.backend && !options.database;

            if (isInteractive) {
                await runInteractive(outputDir, options);
            } else {
                await runNonInteractive(outputDir, options);
            }
        });

    return program;
}
