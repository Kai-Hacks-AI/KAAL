// The shared set-up of the Cases of engineering/F103: the callers that pass the stations.
import { join } from 'node:path';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
export const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const dir = join(root, 'packages/kaal-engineering/13-source/controls');
export const STATION_NAMES = ['Developing', 'Collecting', 'Integrating', 'Hotfixing', 'Wiring', 'Promoting', 'Publishing'];
export const entry = (name) => { const p = join(dir, name); return existsSync(p) ? readFileSync(p, 'utf8') : null; };
export const files = () => (existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.mjs')) : []);
