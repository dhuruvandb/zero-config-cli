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
});
