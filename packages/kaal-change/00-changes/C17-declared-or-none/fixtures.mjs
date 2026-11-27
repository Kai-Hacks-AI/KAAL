// Shared by the parked Cases of change/C17. Not a Case.
import { createHash } from 'node:crypto';
export const pinOf = (text) => createHash('sha256').update(text, 'utf8').digest('hex');
export const record = (identity, extra = '') => `---\nid: ${identity}\ntitle: ${identity.split('/')[1]}\n${extra}---\n# ${identity}\n`;
export const entry = (change, pin, because = 'cannot work without it on main') =>
  `  - change: ${change}\n    pin: ${pin}\n    because: ${because}\n`;
export const succeeds = (...entries) => `succeeds:\n${entries.join('')}`;
export const rec = (identity, text) => ({ identity, text });
export const lib = (name) => import(`../../lib/${name}.mjs`);
export const kinds = (r) => r.findings.map((f) => f.kind).sort();
