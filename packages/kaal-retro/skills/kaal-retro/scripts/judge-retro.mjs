#!/usr/bin/env node
// Judges the form of one 4L retro, never its truth: the sections and their order, the fields each lens needs and no
// others, an address on Lacked only, findable yes or no, one subject in one entry, and a Learned that is never empty.
// A retro opens with a non-empty `Account of:` line, whatever it says. A format it does not know is `unjudged`, never `well-formed`.
//
//   node judge-retro.mjs <file>     prints { result, problems } as JSON; exit 0 well-formed, 1 malformed, 2 unjudged
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { frontmatter } from './find-retros.mjs';

const SECTIONS = ['Liked', 'Learned', 'Lacked', 'Longed For'];
const FIELDS = {
  Liked: ['subject', 'keeps'],
  Learned: ['subject', 'source', 'searched'],
  Lacked: ['subject', 'decision-point', 'cost', 'findable', 'address'],
  'Longed For': ['subject', 'worked-anyway'],
};
const NEED = { Liked: ['keeps'], Learned: [], Lacked: ['decision-point', 'cost', 'findable', 'address'], 'Longed For': ['worked-anyway'] };

export function judgeRetro(text) {
  const t = text.replace(/\r\n/g, '\n');
  const f = frontmatter(t) ?? {};
  if (f.format !== '4L') return { result: 'unjudged', problems: [] };
  const body = t.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^Decisions:.*$/gm, '');
  const problems = [];
  const add = (section, rule, extra = {}) => problems.push({ section, rule, ...extra });
  const first = body.split('\n').find((l) => l.trim());
  if (!/^Account of:[ \t]*\S/.test(first ?? '')) add('retro', 'account-of');
  const heads = [...body.matchAll(/^## (.+)$/gm)];
  if (heads.map((h) => h[1]).join('|') !== SECTIONS.join('|')) add('retro', 'sections-in-order');
  const seen = new Map();
  heads.forEach((h, i) => {
    const section = h[1];
    if (!FIELDS[section]) return;
    const chunk = body.slice(h.index + h[0].length, heads[i + 1]?.index ?? body.length).trim();
    if (chunk === 'None raised.') { if (section === 'Learned') add(section, 'may-not-be-empty'); return; }
    const entries = chunk.split(/^- /m).slice(1).map((e) => Object.fromEntries(e.split('\n').filter((l) => l.trim()).map((l) => { const j = l.indexOf(':'); return [l.slice(0, j).trim(), l.slice(j + 1).trim()]; })));
    if (!entries.length) add(section, 'no-entries');
    for (const e of entries) {
      for (const k of Object.keys(e)) if (!FIELDS[section].includes(k)) add(section, k === 'address' ? 'address-outside-lacked' : 'unknown-field', { field: k });
      for (const k of NEED[section]) if (!e[k]) add(section, `missing-${k}`);
      if (section === 'Learned' && !e.source && !e.searched) add(section, 'missing-source');
      if (section === 'Lacked' && e.findable && !['yes', 'no'].includes(e.findable)) add(section, 'findable-yes-or-no');
      if (!e.subject) add(section, 'missing-subject');
      else {
        const key = e.subject.toLowerCase().trim();
        if (seen.has(key)) add(section, 'subject-in-two-entries', { subject: e.subject, also: seen.get(key) });
        seen.set(key, section);
      }
    }
  });
  return { result: problems.length ? 'malformed' : 'well-formed', problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const file = process.argv[2];
  if (!file) { console.error('usage: judge-retro.mjs <file>'); process.exit(2); }
  const r = judgeRetro(readFileSync(file, 'utf8'));
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.result === 'well-formed' ? 0 : r.result === 'malformed' ? 1 : 2);
}
