// A33 check-pr-envelope: judges the envelope of a pull request (release/F17). It reads no git or GitHub.
// Run by hand: node envelope.mjs <facts file>, a JSON file with title, body, base, head, commits, registry and optionally fallback.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkPlanBody } from './check.mjs';

const PROVENANCE = /https?:\/\/|\]\(|\p{Extended_Pictographic}|\b(generated (with|by)|co-authored-by|claude-session|claude code|requested by)\b/iu;
const METADATA = /attribution|claude|session|thread|requested by|generated|co-authored|https?:\/\/|[{}]/i;
const TITLE = /^([A-Z][A-Z0-9_]*): (\S.*)$/;
const CHANGE_ID = /\b[\w-]+\/[A-Z]\d+\b/;

// Rows keyed by TYPE, for what headings cannot give. A TYPE without a row is reported as not judged.
const ROUTE = {
  PLAN: (f) => f.base.startsWith('kaal/'), DO: (f) => f.base.startsWith('kaal/'), ACT: (f) => f.base.startsWith('kaal/'), SYNC: (f) => f.base.startsWith('kaal/'),
  PROMOTION: (f) => f.base === 'main' && f.head.startsWith('kaal/'),
};
const IDENTITY = new Set(['PLAN', 'DO', 'ACT']);
const SHAPE = new Set(['PLAN']);

function sharedBodyRules(body) {
  const problems = [];
  if (typeof body !== 'string') return ['the body is not text'];
  const first = body.search(/^#{1,6}\s/m);
  for (const comment of body.matchAll(/<!--[\s\S]*?-->/g)) {
    if (/KAAL-PR-template/.test(comment[0])) problems.push('the body holds a KAAL-PR-template declaration, which is template metadata and not part of a body');
    else if (first === -1 || comment.index < first) problems.push('an HTML comment sits before the first chapter');
    else if (METADATA.test(comment[0])) problems.push('an HTML comment carries attribution or metadata');
  }
  const text = body.replace(/<!--[\s\S]*?-->/g, '');
  const lines = text.split('\n');
  const chapters = new Map();
  let current;
  let before = '';
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      if (heading[1] !== '##') problems.push(`the heading "${line.trim()}" is not a level-2 chapter`);
      else { current = heading[2]; chapters.set(current, []); }
    } else if (current !== undefined) chapters.get(current).push(line);
    else before += line;
  }
  const names = [...chapters.keys()];
  if (before.trim() !== '') problems.push('the body has text before the first chapter');
  if (names[0] !== 'Change') problems.push('the first chapter of the body must be Change');
  else if (chapters.get('Change').join('\n').trim() === '') problems.push('the Change chapter is empty');
  for (const [name, content] of chapters) {
    const joined = content.join('\n');
    if (PROVENANCE.test(joined)) problems.push(`the chapter ${name} carries a link, an emoji or attribution wording`);
    if (/^\s*([-*_]{3,})\s*$/m.test(joined)) problems.push(`the chapter ${name} carries a rule or footer`);
  }
  return problems;
}

export function verifyEnvelope(facts, registry = {}, options = {}) {
  const problems = [];
  const notJudged = [];
  const title = TITLE.exec(facts.title ?? '');
  if (!title) problems.push('the title must be `<TYPE>: <description>` with an upper-case TYPE and a description');
  else if (CHANGE_ID.test(title[2]) || PROVENANCE.test(title[2])) problems.push('the title carries a Change id, a link, an emoji or attribution wording');
  const type = title?.[1];
  problems.push(...sharedBodyRules(facts.body));
  const headings = typeof facts.body === 'string' ? [...facts.body.replace(/<!--[\s\S]*?-->/g, '').matchAll(/^##\s+(.*?)\s*#*\s*$/gm)].map((m) => m[1]) : [];
  if (type) {
    if (registry[type]) {
      if (JSON.stringify(headings) !== JSON.stringify(registry[type])) problems.push(`the chapters of a ${type} body must be ${registry[type].join(', ')} in this order (found: ${headings.join(', ') || 'none'})`);
      if (SHAPE.has(type) && typeof facts.body === 'string') problems.push(...checkPlanBody(facts.body).problems);
      else notJudged.push(`the Change chapter shape of ${type} has no row and is not judged`);
    } else {
      notJudged.push(`the TYPE ${type} is unsupported: no declared template, so its chapters are not judged`);
      if (options.fallback) notJudged.push(`the fallback ${options.fallback.path} was not used to validate it`);
    }
    if (ROUTE[type]) { if (!ROUTE[type](facts)) problems.push(`the route of a ${type} (base ${facts.base}, head ${facts.head}) does not fit its TYPE`); }
    else notJudged.push(`the route of ${type} has no row and is not judged`);
    if (IDENTITY.has(type)) {
      const id = /^\S+/.exec(headings.length && typeof facts.body === 'string' ? facts.body.replace(/<!--[\s\S]*?-->/g, '').split(/^##\s+Change\s*$/m)[1]?.trim() ?? '' : '')?.[0];
      for (const commit of facts.commits ?? []) {
        const trailers = [...commit.message.matchAll(/^Driven-by:\s*(\S+)\s*$/gim)].map((m) => m[1]);
        if (trailers.length !== 1) problems.push(`a commit has ${trailers.length} Driven-by trailers; it must have exactly one`);
        else if (trailers[0] !== id) problems.push(`a commit is driven by ${trailers[0]} but the Change chapter names ${id ?? 'no id'}`);
      }
    } else notJudged.push(`the Change identity of ${type} is not judged`);
  }
  const unique = [...new Set(problems)];
  return { ok: unique.length === 0, problems: unique, notJudged, complete: notJudged.length === 0 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node envelope.mjs <facts file>'); process.exit(2); }
  const facts = JSON.parse(readFileSync(file, 'utf8'));
  const { ok, problems, notJudged } = verifyEnvelope(facts, facts.registry, { fallback: facts.fallback });
  console.log(ok ? 'PASS: the envelope is clean' : `FAIL:\n${problems.map((p) => `- ${p}`).join('\n')}`);
  if (notJudged.length) console.log(`Not judged:\n${notJudged.map((n) => `- ${n}`).join('\n')}`);
  process.exit(ok ? 0 : 1);
}
