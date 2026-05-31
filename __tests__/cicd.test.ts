// ---------------------------------------------------------------------------
// Tests for CI/CD workflow generation
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import { generateCicdWorkflow } from '../src/generator.js';

describe('generateCicdWorkflow', () => {
    it('generates valid YAML with correct workflow name', () => {
        const yaml = generateCicdWorkflow('react', 'express');
        expect(yaml).toContain('name: Build and Test');
    });

    it('has push and pull_request triggers on main', () => {
        const yaml = generateCicdWorkflow('react', 'express');
        expect(yaml).toContain('push:');
        expect(yaml).toContain('pull_request:');
        expect(yaml).toContain('branches: [main]');
    });

    it('contains all three jobs', () => {
        const yaml = generateCicdWorkflow('react', 'express');
        expect(yaml).toContain('test-frontend:');
        expect(yaml).toContain('test-backend:');
        expect(yaml).toContain('docker:');
    });

    it('does NOT include lint steps', () => {
        const yaml = generateCicdWorkflow('react', 'express');
        expect(yaml).not.toContain('npm run lint');
        expect(yaml).not.toContain('Lint');
    });

    describe('frontend job', () => {
        it('uses actions/checkout and actions/setup-node', () => {
            const yaml = generateCicdWorkflow('react', 'express');
            expect(yaml).toContain('actions/checkout@v4');
            expect(yaml).toContain('actions/setup-node@v4');
            expect(yaml).toContain('node-version: "22"');
        });

        it('runs install, build, and test', () => {
            const yaml = generateCicdWorkflow('react', 'express');
            expect(yaml).toContain('npm ci');
            expect(yaml).toContain('npm run build');
            expect(yaml).toContain('npm test');
        });

        it('uses correct working-directory', () => {
            const yaml = generateCicdWorkflow('my-react', 'express');
            expect(yaml).toContain('working-directory: ./my-react');
        });
    });

    describe('backend job', () => {
        it('runs install, prisma validate, build, and test', () => {
            const yaml = generateCicdWorkflow('react', 'express');
            expect(yaml).toContain('npm ci');
            expect(yaml).toContain('npx prisma validate');
            expect(yaml).toContain('npm run build');
            expect(yaml).toContain('npm test');
        });

        it('uses correct working-directory', () => {
            const yaml = generateCicdWorkflow('react', 'my-nest-api');
            expect(yaml).toContain('working-directory: ./my-nest-api');
        });
    });

    describe('docker job', () => {
        it('depends on both test-frontend and test-backend', () => {
            const yaml = generateCicdWorkflow('react', 'express');
            expect(yaml).toContain('needs: [test-frontend, test-backend]');
        });

        it('builds both frontend and backend images', () => {
            const yaml = generateCicdWorkflow('react', 'express');
            expect(yaml).toContain('docker build -t frontend .');
            expect(yaml).toContain('docker build -t backend .');
        });

        it('uses correct working-directory for both images', () => {
            const yaml = generateCicdWorkflow('my-app', 'my-api');
            expect(yaml).toContain('working-directory: ./my-app');
            expect(yaml).toContain('working-directory: ./my-api');
        });
    });

    describe('custom folder names', () => {
        it('uses custom frontend folder name throughout', () => {
            const yaml = generateCicdWorkflow('frontend-app', 'backend-api');
            const matches = yaml.match(/working-directory: \.\/frontend-app/g);
            expect(matches).toHaveLength(4); // install, build, test, docker
        });

        it('uses custom backend folder name throughout', () => {
            const yaml = generateCicdWorkflow('frontend-app', 'backend-api');
            const matches = yaml.match(/working-directory: \.\/backend-api/g);
            expect(matches).toHaveLength(5); // install, validate, build, test, docker
        });
    });

    it('all YAML output is parseable (basic structure check)', () => {
        const yaml = generateCicdWorkflow('react', 'express');
        const lines = yaml.split('\n').filter((l) => l.trim());
        expect(lines[0]).toContain('name:');
        expect(yaml).toContain('jobs:');
        expect(yaml).toContain('steps:');
        expect(yaml).toContain('runs-on: ubuntu-latest');
    });
});
