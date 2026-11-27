// The one place the controls callers read. Hosting reads files, kinds and Git revisions; the controls functions take
// {path, text} entries and judge them. No file system, process, path or operating system module is imported here.
import { list, read, readFile, kind, readRevision } from '@kaihacksai/kaal-hosting';

const SKIP = ['node_modules', '.git'];
const utf8 = (bytes) => Buffer.from(bytes).toString('utf8');
// A path as the controls scripts printed it: the directory as given, then the path inside it, `/`-separated.
const under = (dir, rel) => { const base = dir.replace(/[\\/]+$/, ''); return base === '' || base === '.' ? rel : `${base}/${rel}`; };

// The files of a directory with an extension in `extensions`, as {path, text}. A name in SKIP is neither entered nor read.
export async function filesOf(dir, extensions = ['md', 'mjs', 'json'], { except = [] } = {}) {
  const wanted = new RegExp(`\\.(${extensions.join('|')})$`);
  const listed = (await list(dir, { skip: SKIP, links: 'skip' })).filter((e) => e.kind === 'file' && wanted.test(e.path) && !except.includes(e.path.split('/').pop()));
  const out = [];
  for (const e of listed) out.push({ path: under(dir, e.path), text: utf8(await readFile(`${dir.replace(/[\\/]+$/, '')}/${e.path}`)) });
  return out;
}

// The text of the records file as a list. One object is a list of one. (Controls exports this as parseRecords(text) once
// its C160 is on main; then this line is deleted and the import is theirs.)
export const parseRecords = (text) => { const v = JSON.parse(text); return Array.isArray(v) ? v : [v]; };

// Records from a file, or from every `.json` file directly in a directory, in name order.
export async function recordsOf(path) {
  if ((await kind(path)) !== 'directory') return parseRecords(utf8(await readFile(path)));
  const names = (await list(path)).filter((e) => e.kind === 'file' && e.path.endsWith('.json') && !e.path.includes('/')).map((e) => e.path).sort();
  const out = [];
  for (const n of names) out.push(...parseRecords(utf8(await readFile(`${path.replace(/[\\/]+$/, '')}/${n}`))));
  return out;
}

// A JSON file, or an error that carries the reason the judge answers UNKNOWN with.
export async function jsonOf(path) {
  if (!path) return undefined;
  let text;
  try { text = utf8(await readFile(path)); } catch { throw Object.assign(new Error(path), { reason: 'unreadable-input' }); }
  try { return JSON.parse(text); } catch { throw Object.assign(new Error(path), { reason: 'malformed-input' }); }
}

// The files of a revision of a repository, as {path, text}.
export async function entriesAt(repo, ref) {
  const files = await readRevision(repo, ref);
  return Object.keys(files).sort().filter((p) => /\.(md|mjs|json)$/.test(p) && !/(^|\/)package-lock\.json$/.test(p)).map((p) => ({ path: p, text: utf8(files[p]) }));
}

export { read };
