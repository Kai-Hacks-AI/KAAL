// A33 check-pr-envelope: judges the envelope of a pull request (release/F17). It reads no git or GitHub.
// Run by hand: node envelope.mjs <facts file>, a JSON file with title, body, base, head, commits, and registry.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkPlanBody } from './check.mjs';
import { stripComments } from './comments.mjs';
import { CUE } from './cue.mjs';

export { CUE };

const PROVENANCE = /https?:\/\/|\]\(|\p{Extended_Pictographic}|\b(generated (with|by)|co-authored-by|claude-session|claude code|requested by)\b/iu;
const METADATA = /attribution|claude|session|thread|requested by|generated|co-authored|https?:\/\/|[{}]/i;
const TITLE = /^([A-Z][A-Z0-9_]*): (\S.*)$/;
const CHANGE_ID = /\b[\w-]+\/[A-Z]\d+\b/;

// Rows keyed by TYPE, for what headings cannot give. A TYPE without a row is reported as not judged.
const ROUTE = {
  PLAN: (f) => f.base.startsWith('kaal/'), DO: (f) => f.base.startsWith('kaal/'), ACT: (f) => f.base.startsWith('kaal/'), SYNC: (f) => f.base.startsWith('kaal/'),
  PROMOTION: (f) => f.base === 'main' && f.head.startsWith('kaal/'),
  HOTFIX: (f) => typeof f.head === 'string' && /^hotfix\/\S/.test(f.head),
};
// What a route row leaves unjudged on purpose, reported on every result of that TYPE.
const ROUTE_HINT = { HOTFIX: 'a HOTFIX takes a head under hotfix/' };
const ROUTE_UNJUDGED = { HOTFIX: 'the base of a HOTFIX is not judged: the Hotfix delivery path, a separate Change, decides it' };
// What the envelope cannot show about a HOTFIX, reported on every HOTFIX result.
const HOTFIX_UNJUDGED = [
  'whether a HOTFIX corrects only its defect is not judged: the diff, the Case and the review decide it',
  'whether the Defect and the Urgency of a HOTFIX are true is not judged: the review decides it',
];
// The whole line: a Change id, one space, and a name of words (letters, digits and _ . ' ( ) / & + -) joined by single spaces.
// No colon or description, no markup, no control or invisible characters.
const HOTFIX_CHANGE = /^[\w-]+\/[A-Z]\d+ [\p{L}\p{N}](?:[\p{L}\p{N}_.'()/&+-]| (?! ))*$/u;
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
  const text = stripComments(body);
  const lines = text.split('\n');
  const seen = [];
  const chapters = new Map();
  let current;
  const before = [];
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      if (heading[1] !== '##') problems.push(`the heading "${line.trim()}" is not a level-2 chapter`);
      else {
        current = heading[2];
        if (seen.includes(current)) problems.push(`the chapter ${current} appears more than once`);
        seen.push(current);
        chapters.set(current, chapters.get(current) ?? []);
      }
    } else if (current !== undefined) chapters.get(current).push(line);
    else before.push(line);
  }
  const names = [...chapters.keys()];
  // Only the Change envelope cue, as its exact line, may stand before the first chapter.
  const early = before.map((line) => line.trim()).filter((line) => line !== '');
  if (early.length > 0 && !(early.length === 1 && early[0] === CUE)) problems.push('the body has text before the first chapter');
  if (names[0] !== 'Change') problems.push('the first chapter of the body must be Change');
  else if (chapters.get('Change').join('\n').trim() === '') problems.push('the Change chapter is empty');
  for (const [name, content] of chapters) {
    const joined = content.join('\n');
    if (PROVENANCE.test(joined)) problems.push(`the chapter ${name} carries a link, an emoji or attribution wording`);
    if (/^\s*([-*_]{3,})\s*$/m.test(joined)) problems.push(`the chapter ${name} carries a rule or footer`);
  }
  return problems;
}

function chapterTexts(body) {
  const texts = new Map();
  let current;
  for (const line of stripComments(body).split('\n')) {
    const heading = /^##\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) { current = heading[1]; texts.set(current, texts.get(current) ?? []); } else if (current !== undefined) texts.get(current).push(line);
  }
  return texts;
}

// What a HOTFIX envelope can show: its chapters hold content and its Change is one line, id then name (release/F16).
function hotfixBodyRules(body) {
  const problems = [];
  if (typeof body !== 'string') return problems;
  const texts = chapterTexts(body);
  for (const name of ['Defect', 'Urgency', 'Approach']) {
    if (texts.has(name) && texts.get(name).join('\n').trim() === '') problems.push(`the ${name} chapter of a HOTFIX is empty`);
  }
  if (texts.has('Change')) {
    const lines = texts.get('Change').map((l) => l.trim()).filter((l) => l !== '');
    if (lines.length > 0 && !(lines.length === 1 && HOTFIX_CHANGE.test(lines[0]))) problems.push('the Change chapter of a HOTFIX must be one line, `<id> <name>`');
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
  const headings = typeof facts.body === 'string' ? [...stripComments(facts.body).matchAll(/^##\s+(.*?)\s*#*\s*$/gm)].map((m) => m[1]) : [];
  if (type) {
    if (registry[type]) {
      if (JSON.stringify(headings) !== JSON.stringify(registry[type])) problems.push(`the chapters of a ${type} body must be ${registry[type].join(', ')} in this order (found: ${headings.join(', ') || 'none'})`);
      if (SHAPE.has(type) && typeof facts.body === 'string') problems.push(...checkPlanBody(facts.body).problems);
      else if (type !== 'HOTFIX') notJudged.push(`the Change chapter shape of ${type} has no row and is not judged`);
    } else {
      notJudged.push(`the TYPE ${type} is unsupported: no declared template, so its chapters are not judged`);
    }
    if (type === 'HOTFIX') {
      problems.push(...hotfixBodyRules(facts.body));
      notJudged.push(...HOTFIX_UNJUDGED);
    } else if (typeof facts.head === 'string' && facts.head.startsWith('hotfix/')) {
      problems.push(`a pull request from the head ${facts.head} must be a HOTFIX: a hotfix/ head takes the TYPE HOTFIX, not ${type}`);
    }
    if (ROUTE[type]) {
      if (!ROUTE[type](facts)) problems.push(`the route of a ${type} (base ${facts.base}, head ${facts.head}) does not fit its TYPE${ROUTE_HINT[type] ? `: ${ROUTE_HINT[type]}` : ''}`);
      if (ROUTE_UNJUDGED[type]) notJudged.push(ROUTE_UNJUDGED[type]);
    }
    else notJudged.push(`the route of ${type} has no row and is not judged`);
    if (IDENTITY.has(type)) {
      const id = /^\S+/.exec(headings.length && typeof facts.body === 'string' ? stripComments(facts.body).split(/^##\s+Change\s*$/m)[1]?.trim() ?? '' : '')?.[0];
      if (!Array.isArray(facts.commits)) notJudged.push(`the Change identity of ${type} is not verified: no commit evidence was supplied`);
      else if (facts.commits.length === 0) problems.push(`the Change identity of ${type} cannot be verified: the pull request lists no commits`);
      for (const commit of Array.isArray(facts.commits) ? facts.commits : []) {
        const trailers = [...commit.message.matchAll(/^Driven-by:\s*(\S+)\s*$/gim)].map((m) => m[1]);
        if (trailers.length !== 1) problems.push(`a commit has ${trailers.length} Driven-by trailers; it must have exactly one`);
        else if (trailers[0] !== id) problems.push(`a commit is driven by ${trailers[0]} but the Change chapter names ${id ?? 'no id'}`);
      }
    } else notJudged.push(`the Change identity of ${type} is not judged`);
  }
  const unique = [...new Set(problems)];
  // `ok` is local validation only: no rule found a fault. The verdict is the only result a consumer may rely on;
  // UNKNOWN never passes.
  const verdict = unique.length > 0 ? 'FAIL' : notJudged.length > 0 ? 'UNKNOWN' : 'PASS';
  return { ok: unique.length === 0, verdict, problems: unique, notJudged, complete: notJudged.length === 0 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node envelope.mjs <facts file>'); process.exit(2); }
  const facts = JSON.parse(readFileSync(file, 'utf8'));
  const { verdict, problems, notJudged } = verifyEnvelope(facts, facts.registry);
  console.log({ PASS: 'PASS: the envelope is clean and everything was judged', FAIL: 'FAIL: the envelope has findings', UNKNOWN: 'UNKNOWN: no finding, but something was not judged; this is not a pass' }[verdict]);
  if (problems.length) console.log(`Findings:\n${problems.map((p) => `- ${p}`).join('\n')}`);
  if (notJudged.length) console.log(`Not judged:\n${notJudged.map((n) => `- ${n}`).join('\n')}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 3 }[verdict]);
}
