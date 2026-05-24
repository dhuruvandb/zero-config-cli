// ---------------------------------------------------------------------------
// Tests for the template registry
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import {
    templateData,
    ALL_TEMPLATE_KEYS,
    FRONTEND_KEYS,
    BACKEND_KEYS,
    databaseOptions,
    ALLOWED_TEMPLATES,
    FRONTEND_DOCKER_CONFIG,
    BACKEND_DOCKER_CONFIG,
    DATABASE_DOCKER_CONFIG,
    PROVIDER_MAP,
} from '../src/registry.js';

describe('registry', () => {
    it('has exactly 7 templates', () => {
        expect(ALL_TEMPLATE_KEYS).toHaveLength(7);
    });

    it('has 4 frontend templates', () => {
        expect(FRONTEND_KEYS).toHaveLength(4);
        expect(FRONTEND_KEYS).toEqual(['react', 'angular', 'vuejs', 'nextjs']);
    });

    it('has 3 backend templates', () => {
        expect(BACKEND_KEYS).toHaveLength(3);
        expect(BACKEND_KEYS).toEqual(['express', 'nestjs', 'fastify']);
    });

    it('every template key is in ALLOWED_TEMPLATES', () => {
        for (const key of ALL_TEMPLATE_KEYS) {
            expect(ALLOWED_TEMPLATES.has(key)).toBe(true);
        }
    });

    it('frontend templates have type "frontend"', () => {
        for (const key of FRONTEND_KEYS) {
            expect(templateData[key].type).toBe('frontend');
        }
    });

    it('backend templates have type "backend"', () => {
        for (const key of BACKEND_KEYS) {
            expect(templateData[key].type).toBe('backend');
        }
    });

    it('all backend templates have ORM fields', () => {
        for (const key of BACKEND_KEYS) {
            const t = templateData[key];
            expect(t).toHaveProperty('database');
            expect(t).toHaveProperty('databaseIcon');
            expect(t).toHaveProperty('orm');
        }
    });

    it('has 7 database options', () => {
        expect(databaseOptions).toHaveLength(7);
    });

    it('each database option has required fields', () => {
        for (const db of databaseOptions) {
            expect(db).toHaveProperty('id');
            expect(db).toHaveProperty('name');
            expect(db).toHaveProperty('icon');
            expect(db).toHaveProperty('description');
        }
    });

    it('React and Vue share Vite default port 5173', () => {
        // React and Vue both use Vite's default port — this is expected
        expect(templateData.react.port).toBe(5173);
        expect(templateData.vuejs.port).toBe(5173);
        expect(templateData.angular.port).toBe(4200);
        expect(templateData.nextjs.port).toBe(3000);
    });

    it('all templates have a devCommand', () => {
        for (const key of ALL_TEMPLATE_KEYS) {
            expect(templateData[key]).toHaveProperty('devCommand');
            expect(templateData[key].devCommand).toMatch(/^npm run /);
        }
    });

    it('Angular uses npm run start', () => {
        expect(templateData.angular.devCommand).toBe('npm run start');
    });

    it('NestJS uses npm run start:dev', () => {
        expect(templateData.nestjs.devCommand).toBe('npm run start:dev');
    });

    it('all backends have port 5000', () => {
        for (const key of BACKEND_KEYS) {
            expect(templateData[key].port).toBe(5000);
        }
    });

    // --- Docker config tests ---

    describe('FRONTEND_DOCKER_CONFIG', () => {
        it('has config for all 4 frontends', () => {
            for (const key of FRONTEND_KEYS) {
                expect(FRONTEND_DOCKER_CONFIG[key]).toBeDefined();
                expect(FRONTEND_DOCKER_CONFIG[key].containerPort).toBeGreaterThan(0);
            }
        });

        it('React and Vue use nginx on port 80', () => {
            expect(FRONTEND_DOCKER_CONFIG.react.containerPort).toBe(80);
            expect(FRONTEND_DOCKER_CONFIG.vuejs.containerPort).toBe(80);
        });

        it('Angular SSR uses port 4000', () => {
            expect(FRONTEND_DOCKER_CONFIG.angular.containerPort).toBe(4000);
        });

        it('Next.js standalone uses port 3000', () => {
            expect(FRONTEND_DOCKER_CONFIG.nextjs.containerPort).toBe(3000);
        });
    });

    describe('BACKEND_DOCKER_CONFIG', () => {
        it('has config for all 3 backends', () => {
            for (const key of BACKEND_KEYS) {
                expect(BACKEND_DOCKER_CONFIG[key]).toBeDefined();
                expect(BACKEND_DOCKER_CONFIG[key].containerPort).toBe(5000);
                expect(BACKEND_DOCKER_CONFIG[key].startCommand).toBeDefined();
            }
        });

        it('Express and Fastify use dist/index.js', () => {
            expect(BACKEND_DOCKER_CONFIG.express.startCommand).toBe('node dist/index.js');
            expect(BACKEND_DOCKER_CONFIG.fastify.startCommand).toBe('node dist/index.js');
        });

        it('NestJS uses dist/main.js', () => {
            expect(BACKEND_DOCKER_CONFIG.nestjs.startCommand).toBe('node dist/main.js');
        });
    });

    describe('DATABASE_DOCKER_CONFIG', () => {
        const dbIds = databaseOptions.map((d) => d.id);

        it('has config for all 7 databases', () => {
            for (const id of dbIds) {
                if (id === 'sqlite') {
                    // SQLite is file-based, no Docker service needed
                    expect(DATABASE_DOCKER_CONFIG[id]).toBeUndefined();
                } else {
                    expect(DATABASE_DOCKER_CONFIG[id]).toBeDefined();
                }
            }
        });

        it('each database config has all required fields', () => {
            for (const [id, config] of Object.entries(DATABASE_DOCKER_CONFIG)) {
                expect(config.image).toBeTruthy();
                expect(config.containerPort).toBeGreaterThan(0);
                expect(config.envVars).toBeDefined();
                expect(Object.keys(config.envVars).length).toBeGreaterThan(0);
                expect(config.healthcheck).toBeDefined();
                expect(config.healthcheck.test).toBeInstanceOf(Array);
                expect(config.healthcheck.interval).toBeTruthy();
                expect(config.healthcheck.retries).toBeGreaterThan(0);
                expect(config.volumeName).toBeTruthy();
                expect(config.dbUrlTemplate).toContain('{{HOST}}');
            }
        });

        it('PostgreSQL config is correct', () => {
            const pg = DATABASE_DOCKER_CONFIG.postgresql;
            expect(pg.image).toBe('postgres:16-alpine');
            expect(pg.containerPort).toBe(5432);
            expect(pg.envVars).toEqual({
                POSTGRES_USER: 'postgres',
                POSTGRES_PASSWORD: 'postgres',
                POSTGRES_DB: 'myapp',
            });
            expect(pg.dbUrlTemplate).toBe(
                'postgresql://postgres:postgres@{{HOST}}:5432/myapp?schema=public',
            );
        });

        it('MySQL config is correct', () => {
            const mysql = DATABASE_DOCKER_CONFIG.mysql;
            expect(mysql.image).toBe('mysql:8');
            expect(mysql.containerPort).toBe(3306);
            expect(mysql.dbUrlTemplate).toBe('mysql://root:root@{{HOST}}:3306/myapp');
        });

        it('MariaDB maps to mysql provider', () => {
            const mariadb = DATABASE_DOCKER_CONFIG.mariadb;
            expect(mariadb.image).toBe('mariadb:11');
            expect(mariadb.dbUrlTemplate).toContain('mysql://');
        });

        it('MongoDB config is correct', () => {
            const mongo = DATABASE_DOCKER_CONFIG.mongodb;
            expect(mongo.image).toBe('mongo:7');
            expect(mongo.containerPort).toBe(27017);
            expect(mongo.dbUrlTemplate).toBe('mongodb://{{HOST}}:27017/myapp');
        });

        it('SQL Server config is correct', () => {
            const mssql = DATABASE_DOCKER_CONFIG.sqlserver;
            expect(mssql.image).toBe('mcr.microsoft.com/mssql/server:2022-latest');
            expect(mssql.containerPort).toBe(1433);
        });

        it('CockroachDB config is correct', () => {
            const crdb = DATABASE_DOCKER_CONFIG.cockroachdb;
            expect(crdb.image).toBe('cockroachdb/cockroach:latest');
            expect(crdb.containerPort).toBe(26257);
        });

        it('dbUrlTemplate has {{HOST}} placeholder for all databases', () => {
            for (const config of Object.values(DATABASE_DOCKER_CONFIG)) {
                expect(config.dbUrlTemplate).toContain('{{HOST}}');
            }
        });

        it('all databases in PROVIDER_MAP have a Docker config (except sqlite)', () => {
            for (const [dbId, provider] of Object.entries(PROVIDER_MAP)) {
                if (dbId === 'sqlite') continue;
                expect(DATABASE_DOCKER_CONFIG[dbId]).toBeDefined();
                expect(provider).toBeTruthy();
            }
        });
    });
});
