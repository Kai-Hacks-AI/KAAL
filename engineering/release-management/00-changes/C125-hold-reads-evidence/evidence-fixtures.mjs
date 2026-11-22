// Fixtures of the Cases of release/C125: the evidence file of Testing's `observe` as data, and the facts of a collector. Not a Case.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
export const RM = fileURLToPath(import.meta.url).split('/00-changes/')[0];
export const use = (rel) => import(pathToFileURL(join(RM, '05-src/phase', rel)).href);
export const GREEN2 = [{ id: 'x/T1', parked: false }, { id: 'x/T2', parked: false }];
export const changes = [{ id: 'x/C1', applicable: GREEN2 }];
export const retros = [{ reflects: ['x/C1'] }];
// Every field can be given as undefined on purpose: only an absent key takes its default.
export const evidenceOf = (o = {}) => { const g = (k, d) => (k in o ? o[k] : d); return { observed: g('observed', { 'x/T1': 'GREEN', 'x/T2': 'GREEN' }), evidence: { revision: g('revision', 'abc'), expectedRevision: g('expectedRevision', 'abc'), catalog: { complete: g('complete', true), findings: g('findings', []), unobservable: g('unobservable', []) } } }; };
