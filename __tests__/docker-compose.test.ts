// ---------------------------------------------------------------------------
// Tests for docker-compose.yml generation
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import { generateDockerCompose, type ComposeOptions } from '../src/generator.js';

function makeOpts(overrides: Partial<ComposeOptions> = {}): ComposeOptions {
    return {
        frontend: 'react',
        backend: 'express',
        database: 'postgresql',
        frontendFolder: 'react',
        backendFolder: 'express',
        outputDir: '/tmp/test',
        ...overrides,
    };
}

describe('generateDockerCompose', () => {
    it('generates valid YAML with postgresql database service', () => {
        const yaml = generateDockerCompose(makeOpts());
        expect(yaml).toContain('services:');
        expect(yaml).toContain('postgresql-db:');
        expect(yaml).toContain('image: postgres:16-alpine');
        expect(yaml).toContain('backend:');
        expect(yaml).toContain('frontend:');
    });

    it('includes healthcheck for postgresql', () => {
        const yaml = generateDockerCompose(makeOpts());
        expect(yaml).toContain('pg_isready');
        expect(yaml).toContain('condition: service_healthy');
    });

    it('uses correct DATABASE_URL with container hostname', () => {
        const yaml = generateDockerCompose(makeOpts());
        expect(yaml).toContain('DATABASE_URL: "postgresql://postgres:postgres@postgresql-db:5432/myapp?schema=public"');
    });

    it('sets FRONTEND_URL to the frontend dev port', () => {
        const yaml = generateDockerCompose(makeOpts({ frontend: 'react' }));
        expect(yaml).toContain('FRONTEND_URL: "http://localhost:5173"');
    });

    it('maps frontend host port to container port', () => {
        const yaml = generateDockerCompose(makeOpts({ frontend: 'react' }));
        expect(yaml).toContain('"5173:80"');
    });

    it('maps angular frontend to port 4200', () => {
        const yaml = generateDockerCompose(makeOpts({ frontend: 'angular' }));
        expect(yaml).toContain('FRONTEND_URL: "http://localhost:4200"');
        expect(yaml).toContain('"4200:4000"');
    });

    it('maps nextjs frontend to port 3000', () => {
        const yaml = generateDockerCompose(makeOpts({ frontend: 'nextjs' }));
        expect(yaml).toContain('FRONTEND_URL: "http://localhost:3000"');
        expect(yaml).toContain('"3000:3000"');
    });

    it('maps backend to port 5000', () => {
        const yaml = generateDockerCompose(makeOpts());
        expect(yaml).toContain('"5000:5000"');
    });

    it('includes env_file for backend secrets', () => {
        const yaml = generateDockerCompose(makeOpts());
        expect(yaml).toContain('env_file: ./express/.env');
    });

    it('uses prisma db push command for all backends', () => {
        const yaml = generateDockerCompose(makeOpts({ backend: 'express' }));
        expect(yaml).toContain('./node_modules/.bin/prisma db push && node dist/index.js');

        const nestYaml = generateDockerCompose(makeOpts({ backend: 'nestjs' }));
        expect(nestYaml).toContain('./node_modules/.bin/prisma db push && node dist/main.js');

        const fastifyYaml = generateDockerCompose(makeOpts({ backend: 'fastify' }));
        expect(fastifyYaml).toContain('./node_modules/.bin/prisma db push && node dist/index.js');
    });

    it('includes volumes for database persistence', () => {
        const yaml = generateDockerCompose(makeOpts());
        expect(yaml).toContain('volumes:');
        expect(yaml).toContain('pgdata:');
    });

    it('uses depends_on with service_healthy for postgresql', () => {
        const yaml = generateDockerCompose(makeOpts());
        expect(yaml).toContain('depends_on:');
        expect(yaml).toContain('postgresql-db:');
        expect(yaml).toContain('condition: service_healthy');
    });

    it('generates correct mysql service', () => {
        const yaml = generateDockerCompose(makeOpts({ database: 'mysql' }));
        expect(yaml).toContain('mysql-db:');
        expect(yaml).toContain('image: mysql:8');
        expect(yaml).toContain('DATABASE_URL: "mysql://root:root@mysql-db:3306/myapp"');
        expect(yaml).toContain('mysqldata:');
    });

    it('generates correct mongodb service', () => {
        const yaml = generateDockerCompose(makeOpts({ database: 'mongodb' }));
        expect(yaml).toContain('mongodb-db:');
        expect(yaml).toContain('image: mongo:7');
        expect(yaml).toContain('DATABASE_URL: "mongodb://mongodb-db:27017/myapp"');
        expect(yaml).toContain('mongodata:');
    });

    it('generates correct mariadb service', () => {
        const yaml = generateDockerCompose(makeOpts({ database: 'mariadb' }));
        expect(yaml).toContain('mariadb-db:');
        expect(yaml).toContain('image: mariadb:11');
        expect(yaml).toContain('mariadbdata:');
    });

    it('generates correct cockroachdb service', () => {
        const yaml = generateDockerCompose(makeOpts({ database: 'cockroachdb' }));
        expect(yaml).toContain('cockroachdb-db:');
        expect(yaml).toContain('image: cockroachdb/cockroach:latest');
        expect(yaml).toContain('cockroachdata:');
    });

    it('generates correct sqlserver service', () => {
        const yaml = generateDockerCompose(makeOpts({ database: 'sqlserver' }));
        expect(yaml).toContain('sqlserver-db:');
        expect(yaml).toContain('image: mcr.microsoft.com/mssql/server:2022-latest');
        expect(yaml).toContain('sqldata:');
    });

    describe('SQLite', () => {
        it('does NOT include a database service', () => {
            const yaml = generateDockerCompose(makeOpts({ database: 'sqlite' }));
            expect(yaml).not.toContain('-db:');  // no postgresql-db, mysql-db, etc.
            expect(yaml).not.toContain('volumes:');  // no persistent volumes
        });

        it('uses file-based DATABASE_URL', () => {
            const yaml = generateDockerCompose(makeOpts({ database: 'sqlite' }));
            expect(yaml).toContain('DATABASE_URL: "file:./dev.db"');
        });

        it('still includes backend and frontend services', () => {
            const yaml = generateDockerCompose(makeOpts({ database: 'sqlite' }));
            expect(yaml).toContain('backend:');
            expect(yaml).toContain('frontend:');
        });
    });

    describe('custom folder names', () => {
        it('uses custom folder names in build paths', () => {
            const yaml = generateDockerCompose(makeOpts({
                frontendFolder: 'my-react-app',
                backendFolder: 'my-nest-api',
            }));
            expect(yaml).toContain('build: ./my-react-app');
            expect(yaml).toContain('build: ./my-nest-api');
            expect(yaml).toContain('env_file: ./my-nest-api/.env');
        });
    });

    describe('nextjs with backend', () => {
        it('generates valid compose with nextjs + express + postgresql', () => {
            const yaml = generateDockerCompose(makeOpts({
                frontend: 'nextjs',
                backend: 'express',
            }));
            expect(yaml).toContain('frontend:');
            expect(yaml).toContain('build: ./react'); // default folder name uses key
            expect(yaml).toContain('backend:');
        });
    });

    it('header comments show the correct stack', () => {
        const yaml = generateDockerCompose(makeOpts({
            frontend: 'react',
            backend: 'nestjs',
            database: 'postgresql',
        }));
        expect(yaml).toContain('Stack: react (frontend) + nestjs (backend) + postgresql');
    });

    it('all yaml output is parseable (basic structure check)', () => {
        const yaml = generateDockerCompose(makeOpts());
        // Check basic YAML-like structure
        const lines = yaml.split('\n').filter((l) => l.trim());
        expect(lines[0]).toMatch(/^#/); // starts with comment
        expect(yaml).toContain('services:');
        expect(yaml).toContain('restart: unless-stopped');
    });

    it('has correct header with stack info', () => {
        const yaml = generateDockerCompose(makeOpts({
            frontend: 'vuejs',
            backend: 'fastify',
            database: 'mongodb',
        }));
        expect(yaml).toContain('Stack: vuejs (frontend) + fastify (backend) + mongodb');
    });
});
