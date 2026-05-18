// ---------------------------------------------------------------------------
// Tests for Prisma provider swapping logic
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import { replacePrismaProvider } from '../src/prisma-swap.js';
import type { TemplateFile } from '../src/types.js';

function makePrismaSchema(provider: string): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

function makeTemplateFile(path: string, content: string): TemplateFile {
    return { path, content: Buffer.from(content, 'utf-8') };
}

describe('replacePrismaProvider', () => {
    it('replaces postgresql → postgresql (no-op)', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'postgresql');
        const result = files[0].content.toString('utf-8');
        expect(result).toContain('provider = "postgresql"');
    });

    it('replaces postgresql → mysql', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'mysql');
        const result = files[0].content.toString('utf-8');
        expect(result).toContain('provider = "mysql"');
        expect(result).not.toContain('provider = "postgresql"');
    });

    it('replaces postgresql → sqlite', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'sqlite');
        const result = files[0].content.toString('utf-8');
        expect(result).toContain('provider = "sqlite"');
    });

    it('replaces postgresql → mongodb', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'mongodb');
        const result = files[0].content.toString('utf-8');
        expect(result).toContain('provider = "mongodb"');
    });

    it('replaces postgresql → sqlserver', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'sqlserver');
        const result = files[0].content.toString('utf-8');
        expect(result).toContain('provider = "sqlserver"');
    });

    it('replaces postgresql → cockroachdb', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'cockroachdb');
        const result = files[0].content.toString('utf-8');
        expect(result).toContain('provider = "cockroachdb"');
    });

    it('maps mariadb → mysql provider', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'mariadb');
        const result = files[0].content.toString('utf-8');
        expect(result).toContain('provider = "mysql"');
    });

    it('does NOT replace the generator provider line', () => {
        const files = [makeTemplateFile('prisma/schema.prisma', makePrismaSchema('postgresql'))];
        replacePrismaProvider(files, 'sqlite');
        const result = files[0].content.toString('utf-8');
        // generator block should still have prisma-client-js
        expect(result).toContain('provider = "prisma-client-js"');
    });

    it('does nothing when database is undefined', () => {
        const original = makePrismaSchema('postgresql');
        const files = [makeTemplateFile('prisma/schema.prisma', original)];
        replacePrismaProvider(files, undefined);
        expect(files[0].content.toString('utf-8')).toBe(original);
    });

    it('does nothing for unknown database', () => {
        const original = makePrismaSchema('postgresql');
        const files = [makeTemplateFile('prisma/schema.prisma', original)];
        replacePrismaProvider(files, 'invalid-db');
        expect(files[0].content.toString('utf-8')).toBe(original);
    });

    it('does not modify non-prisma files', () => {
        const files = [
            makeTemplateFile('package.json', JSON.stringify({ name: 'test' })),
            makeTemplateFile('.env', 'DATABASE_URL=...'),
        ];
        const originalPkg = files[0].content.toString('utf-8');
        const originalEnv = files[1].content.toString('utf-8');
        replacePrismaProvider(files, 'mysql');
        expect(files[0].content.toString('utf-8')).toBe(originalPkg);
        expect(files[1].content.toString('utf-8')).toBe(originalEnv);
    });
});
