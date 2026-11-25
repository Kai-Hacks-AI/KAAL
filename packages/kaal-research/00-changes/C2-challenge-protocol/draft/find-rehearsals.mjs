import { readFileSync } from 'node:fs';
import { parse } from './parse.mjs';
const ID = /^[a-z][a-z0-9-]*\/RH[1-9]\d*$/;
const VERDICTS = ['favourable', 'unfavourable', 'inconclusive'];
// Handed { path, text } files; searches no folder. A file that is not a rehearsal is ignored; one that says it is and does not fit is refused.
export function findRehearsals(files) {
  const rehearsals = []; const refused = [];
  for (const { path, text } of files) {
    const doc = parse(text);
    if (!doc || doc.front.kind !== 'rehearsal') continue;
    const f = doc.front;
    if (!ID.test(f.id || '')) { refused.push({ path, reason: 'id' }); continue; }
    if (!VERDICTS.includes(f.verdict)) { refused.push({ path, reason: 'verdict' }); continue; }
    if (!f.question) { refused.push({ path, reason: 'question' }); continue; }
    rehearsals.push({ id: f.id, verdict: f.verdict, about: f['verdict-about'], question: f.question, technique: f.technique ?? null, challenges: f.challenges ?? null, path });
  }
  return { rehearsals, refused };
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const r = findRehearsals(process.argv.slice(2).map((p) => ({ path: p, text: readFileSync(p, 'utf8') })));
  console.log(JSON.stringify(r));
  process.exit(r.refused.length ? 2 : 0);
}
