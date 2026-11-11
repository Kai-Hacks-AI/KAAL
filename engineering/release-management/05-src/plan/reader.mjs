// A7 pr-reader: reads the pull request and builds the plan model from the tree. It judges nothing.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// Title, body, commits and changed files of a pull request. Anything else is unreadable input, not a guess.
export function readPullRequest(pr) {
  const ok = pr !== null && typeof pr === 'object' && typeof pr.title === 'string' && typeof pr.body === 'string' && Array.isArray(pr.commits) && Array.isArray(pr.files);
  if (!ok) return { unreadable: 'the pull request' };
  return {
    title: pr.title,
    body: pr.body,
    commits: pr.commits.map((commit) => ({ sha: commit.sha, message: commit.message })),
    files: pr.files.map((file) => ({ filename: file.filename, status: file.status })),
  };
}

const COLLECTION = { I: 'intents', F: 'requirements', N: 'requirements', A: 'architecture', D: 'defects', C: 'changes' };
const LINKS = ['parent', 'serves', 'addresses', 'implements', 'resolves', 'closes'];

function frontMatter(text) {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (match === null) return undefined;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const pair = /^([a-z]+):\s*(.*)$/.exec(line);
    if (pair === null) continue;
    const value = pair[2].trim();
    fields[pair[1]] = value.startsWith('[') ? value.slice(1, -1).split(',').map((part) => part.trim()).filter(Boolean) : value;
  }
  return fields;
}

// The id of the folder a file sits in: the nearest folder named <kind><n>-<slug> becomes <capability>/<kind><n>, else the capability.
function placeOf(path, capability) {
  const folders = path.split('/').slice(0, -1);
  for (let index = folders.length - 1; index >= 0; index -= 1) {
    const match = /^([A-Z])(\d+)-/.exec(folders[index]);
    if (match !== null) return `${capability}/${match[1]}${match[2]}`;
  }
  return capability;
}

// files: [{ path, text }] with paths relative to the capability folder.
export function readTree(files) {
  const plan = { intents: [], requirements: [], architecture: [], defects: [], gaps: [], changes: [], cases: [] };
  const caseFiles = [];
  let capability;
  for (const { path, text } of files) {
    if (path.endsWith('gap.md')) {
      const header = text.split('\n').find((line) => line.startsWith('|')) ?? '';
      const parentColumn = header.split('|').map((cell) => cell.trim()).indexOf('Parent');
      for (const line of text.split('\n')) {
        const cells = line.split('|').map((cell) => cell.trim());
        if (/^[a-z][a-z0-9-]*\/G\d+$/.test(cells[1] ?? '')) plan.gaps.push(parentColumn > 0 && cells[parentColumn] ? { id: cells[1], parent: cells[parentColumn] } : { id: cells[1] });
      }
    } else if (path.endsWith('.md')) {
      const fields = frontMatter(text);
      const match = fields?.id !== undefined ? /^([a-z][a-z0-9-]*)\/([A-Z])\d+$/.exec(fields.id) : null;
      if (match !== null && match !== undefined && COLLECTION[match[2]] !== undefined) {
        capability ??= match[1];
        const node = { id: fields.id };
        for (const link of LINKS) if (fields[link] !== undefined) node[link] = fields[link];
        plan[COLLECTION[match[2]]].push(node);
      }
    } else if (/\/T\d+\.(red|test)\.mjs$/.test(`/${path}`)) {
      caseFiles.push({ path, text });
    }
  }
  for (const { path, text } of caseFiles) {
    const id = /export const id = '([^']+)'/.exec(text)?.[1];
    const tests = /export const tests = \[([^\]]*)\]/.exec(text)?.[1];
    if (id === undefined || tests === undefined) continue;
    plan.cases.push({ id, tests: [...tests.matchAll(/'([^']+)'/g)].map((match) => match[1]), found: placeOf(path, capability ?? id.split('/')[0]) });
  }
  return plan;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? (entry.name === '05-src' || entry.name === 'node_modules' ? [] : walk(join(dir, entry.name))) : [join(dir, entry.name)]));
}

export function readTreeFromDisk(root) {
  return readTree(walk(root).map((file) => ({ path: relative(root, file).split(sep).join('/'), text: readFileSync(file, 'utf8') })));
}
