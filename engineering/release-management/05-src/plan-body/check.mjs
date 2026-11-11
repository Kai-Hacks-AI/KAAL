// A16 body-contract: checks the body of a PLAN pull request against release/F3.
// Exactly four level-2 chapters in order (Change, From, To, Because), and nothing else as a heading.
// The Change chapter is one line `<id> <name>: <short description>`, and the description repeats none of the other chapters.
const CHAPTERS = ['Change', 'From', 'To', 'Because'];
const CHANGE_LINE = /^(\S+\/C\d+) (.+?): (.+)$/;

const normalise = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Chapters of the body: the headings in order and the text under each level-2 heading.
// HTML comments (the hints of the template) and fenced code are not read as headings.
function read(body) {
  const lines = body.replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const headings = [];
  const text = new Map();
  let fenced = false;
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
    }
  }
  return { headings, chapter: (name) => (text.get(name) ?? []).join('\n').trim() };
}

export function checkPlanBody(body) {
  const problems = [];
  if (typeof body !== 'string') return { ok: false, problems: ['the body is not text'] };
  const { headings, chapter } = read(body);
  if (JSON.stringify(headings) !== JSON.stringify(CHAPTERS.map((name) => `## ${name}`))) {
    problems.push(`the body must have exactly the chapters ${CHAPTERS.join(', ')} in this order and no other heading (found: ${headings.join(', ') || 'none'})`);
    return { ok: false, problems };
  }
  for (const name of CHAPTERS) if (chapter(name) === '') problems.push(`the chapter ${name} is empty`);
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
