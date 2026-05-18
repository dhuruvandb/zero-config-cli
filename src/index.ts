#!/usr/bin/env node

// ---------------------------------------------------------------------------
// Entry point for the zero-config CLI.
// Bootstraps Commander and parses command-line arguments.
// ---------------------------------------------------------------------------

import { createCLI } from './cli.js';

const program = createCLI();

program.parse(process.argv);
