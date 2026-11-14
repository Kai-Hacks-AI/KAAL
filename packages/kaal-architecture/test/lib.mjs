// Shared by the Target Cases: reads a file of this package. It reads no trial, no key and nothing under 00-changes.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const dir = join(dirname(fileURLToPath(import.meta.url)), '..');
export const read = (rel, what) => { const p = join(dir, rel); assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
export const SKILL = 'skills/kaal-architecture/SKILL.md';
