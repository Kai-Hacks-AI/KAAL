// The final step of work merged into an integration branch, read from the event alone (release/C93). Pure: no network, no branch code.
import { readLocations, wirableTarget } from '../delivery/locations.mjs';
const CLASSES = [
  ['KAAL', /^kaal\/[a-z0-9-]+\/[a-z0-9-]+$/],
  ['HOTFIX', /^hotfix\/[a-z0-9-]+$/],
  ['WIRE', /^wire\/[a-z0-9-]+$/],
];
const chapters = (body) => [...String(body ?? '').matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
// A WIRE copy is positively identified: the chapters Source, Target and Verification, and a Target that names one file under a wirable delivery location (release/A67).
export function wireTarget(body, locations) {
  const c = chapters(body);
  if (!['Source', 'Target', 'Verification'].every((n) => c.includes(n))) return null;
  const p = /^## Target[ \t]*\n+[^\n`]*`([^`\n]+)`/m.exec(String(body))?.[1];
  return p && wirableTarget(p, locations) ? p : null;
}
export function stepOf(body) {
  const c = chapters(body);
  if (c.includes('From')) return 'PLAN';
  if (c.includes('Implement')) return 'DO';
  if (c.includes('Defect')) return 'HOTFIX';
  if (['Source', 'Target', 'Verification'].every((n) => c.includes(n))) return 'WIRE';
  if (c.includes('Records') && c.length === 2 && c[0] === 'Change') return 'ACT';
  if (c.includes('Reason') && !c.includes('Records')) return 'SYNC';
  return 'unknown';
}
export function decideFinal(event, read = readLocations) {
  const { merged, base, mergeSha, body } = event ?? {};
  const skip = (reason, detail = '') => ({ action: 'skip', reason, detail });
  if (merged !== true) return skip('not-merged');
  const cls = CLASSES.find(([, re]) => re.test(String(base)));
  if (!cls) return skip('not-an-integration-branch', String(base));
  if (!/^[0-9a-f]{40}$/.test(String(mergeSha))) return skip('no-revision');
  const step = stepOf(body);
  if (step !== { KAAL: 'ACT', HOTFIX: 'HOTFIX', WIRE: 'WIRE' }[cls[0]]) return skip('not-a-final-step', `${cls[0]}: ${step}`);
  const why = `The final step of this Change merged into ${base}. This draft was raised by the Dispatcher; it is picked when the seat is free.`;
  if (cls[0] === 'WIRE') {
    let known;
    try { known = read(); } catch { return skip('no-delivery-declaration'); }
    const target = wireTarget(body, known);
    if (!target) return skip('malformed-wire', 'the Target is not one file under a wirable delivery location');
    const ids = [...new Set(String(body).split(/^## /m)[0].match(/\b[a-z0-9-]+\/C\d+\b/g) ?? [])];
    if (!ids.length) return skip('no-change-id');
    return { action: 'raise', head: base, base: 'main', revision: mergeSha, class: 'WIRE', step, title: `PROMOTION: WIRE ${target}`, body: `## Change\n\n${ids.join(', ')}: WIRE ${target}\n\n## Why now\n\n${why}\n` };
  }
  const line = /^## Change[ \t]*\n+([^\n#][^\n]*)/m.exec(String(body))?.[1]?.trim();
  if (!line) return skip('no-change-line');
  return {
    action: 'raise', head: base, base: 'main', revision: mergeSha, class: cls[0], step,
    title: `PROMOTION: ${line}`,
    body: `## Change\n\n${line}: ${step}\n\n## Why now\n\n${why}\n`,
  };
}
