// A16 body-contract: checks the body of a PLAN pull request against release/F3.
// Exactly four level-2 chapters in order (Change, From, To, Because), nothing before the first and nothing but one paragraph in each.
// The Change chapter is one line `<id> <name>: <short description>`, and the description repeats none of the other chapters.
import { CUE } from './cue.mjs';

const CHAPTERS = ['Change', 'From', 'To', 'Because'];
const CHANGE_LINE = /^(\S+\/C\d+) (.+?): (.+)$/;

// "Short": at most this many characters per chapter, and no link, URL or attribution wording, so a footer cannot ride along inside a paragraph.
export const MAX_CHAPTER_LENGTH = 200;
const PROVENANCE = /https?:\/\/|\]\(|\p{Extended_Pictographic}|\b(generated (with|by)|co-authored-by|claude-session|requested by)\b/iu;

const normalise = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Removes HTML comments until none is left, so that a comment nested in another cannot rebuild one.
// A body that needs more than one pass hides text inside nested comments and is not accepted.
function withoutComments(body) {
  let text = body;
  let passes = 0;
  for (let previous = ''; previous !== text; ) {
    previous = text;
    text = text.replace(/<!--[\s\S]*?--!?>/g, '');
    if (previous !== text) passes += 1;
  }
  return { text, nested: passes > 1 };
}

// Chapters of the body: the headings in order and the text under each level-2 heading.
// HTML comments (the hints of the template) and fenced code are not read as headings.
function read(body) {
  const lines = body.split('\n');
  const headings = [];
  const text = new Map();
  let fenced = false;
  const before = [];
  let current;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const heading = !fenced && /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      headings.push(`${heading[1]} ${heading[2]}`);
      current = heading[1] === '##' ? heading[2] : undefined;
      if (current !== undefined && !text.has(current)) text.set(current, []);
    } else if (current !== undefined) {
      text.get(current).push(line);
    } else if (headings.length === 0) {
      before.push(line);
    }
  }
  return { headings, before: before.join('\n').trim(), chapter: (name) => (text.get(name) ?? []).join('\n').trim() };
}

export function checkPlanBody(body) {
  const problems = [];
  if (typeof body !== 'string') return { ok: false, problems: ['the body is not text'] };
  const stripped = withoutComments(body);
  if (stripped.nested || stripped.text.includes('<!--')) return { ok: false, problems: ['an HTML comment is nested or not closed'] };
  const { headings, before, chapter } = read(stripped.text);
  if (JSON.stringify(headings) !== JSON.stringify(CHAPTERS.map((name) => `## ${name}`))) {
    problems.push(`the body must have exactly the chapters ${CHAPTERS.join(', ')} in this order and no other heading (found: ${headings.join(', ') || 'none'})`);
    return { ok: false, problems };
  }
  if (before !== '' && before !== CUE) problems.push('the body has text before the first chapter');
  for (const name of CHAPTERS) {
    const text = chapter(name);
    if (text === '') problems.push(`the chapter ${name} is empty`);
    else if (text.length > MAX_CHAPTER_LENGTH) problems.push(`the chapter ${name} is longer than ${MAX_CHAPTER_LENGTH} characters`);
    else if (PROVENANCE.test(text)) problems.push(`the chapter ${name} carries a link, an emoji or attribution wording`);
    else if (/\n\s*\n/.test(text) || /^\s*([-*_]{3,}|[-*+]\s|\d+[.)]\s|>)/m.test(text)) problems.push(`the chapter ${name} must be one short paragraph, with no footer, rule, list or quote`);
  }
  const change = CHANGE_LINE.exec(chapter('Change'));
  if (!change) {
    if (chapter('Change') !== '') problems.push('the Change chapter must be one line `<id> <name>: <short description>` with an id such as release/C3, a name and a description');
  } else {
    const description = normalise(change[3]);
    for (const name of ['From', 'To', 'Because']) {
      const other = normalise(chapter(name));
      if (other !== '' && (description.includes(other) || other.includes(description))) problems.push(`the description of the Change repeats the chapter ${name}`);
    }
  }
  return { ok: problems.length === 0, problems };
}
