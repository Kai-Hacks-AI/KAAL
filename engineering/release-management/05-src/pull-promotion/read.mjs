// Reads, from the host, the file state of each declared collector: its delta against main, the tree at its head, its history, the text
// of its ACT candidates and the executions of Test Cases at its exact head. Pull requests are not read: they are transport.
// Read-only: every call is a plain GET of the host's REST API. `get(path)` returns the parsed answer of one GET and `getText(path)` its text;
// the command supplies both (see run.mjs). A list the host cut, or a record it could not give, fails the gatherer naming it: never a guess.
const PAGE = 100;
const MAX_PAGES = 5;
const MAX_COMMITS = 250;
const MAX_FILES = 300;
const MAX_ACT_TEXTS = 30;
const STATUS = { added: 'added', removed: 'removed', renamed: 'modified', modified: 'modified', changed: 'modified', copied: 'added', unchanged: 'modified' };
const MARKS = { '✔': 'success', '✖': 'failure', '√': 'success', '×': 'failure' };
// A Case is reported by the host's test runner under its scoped id (scope/T<n>) with a mark, after the log's own time stamp.
const CASE_LINE = /^(\d{4}-\d\d-\d\dT[\d:.]+Z)\s+\s*(✔|✖|√|×)\s+([a-z][a-z-]*\/T\d+)\b/u;

async function pages(get, path, pick) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = pick(await get(`${path}${path.includes('?') ? '&' : '?'}per_page=${PAGE}&page=${page}`));
    out.push(...batch);
    if (batch.length < PAGE) return out;
  }
  throw new Error(`could not read all of ${path.split('?')[0]}: more than ${PAGE * MAX_PAGES} entries`);
}

// The paths that differ between main and the collector: what the collector would bring, as the host's comparison reports them.
export function deltaOf(files) {
  return files.flatMap((f) => {
    const out = [{ path: f.filename, status: STATUS[f.status] ?? 'modified' }];
    if (f.status === 'renamed' && f.previous_filename) out.push({ path: f.previous_filename, status: 'removed' });
    return out;
  });
}

// The history is the first-parent line of the head, followed while a commit is one of the collector's own commits (those the host lists
// since the merge base), oldest first. A commit of main's history ends the line, so a collector that merged main is read the same as one
// that did not. A SYNC pull request leaves a merge commit on the line whose second parent is the branch's own merge of main: those side
// commits are accepted only as merges of main that grow from the line, and they bring no evidence. Order is ancestry, never the order the
// host listed the commits. A history that is not one complete line (plus such SYNC branches) is not read.
export function historyOf(commits, mergeBase, head = commits.at(-1)?.sha) {
  const fail = (why) => { throw new Error(`could not order the history: ${why}`); };
  const short = (id) => String(id).slice(0, 8);
  if (!commits.length) return []; // nothing of the collector's own: the head is in main's history
  const byId = new Map(commits.map((c) => [c.sha, c]));
  if (!byId.has(head)) fail(`the head ${short(head)} is not among the collector's commits`);
  const parentsOf = (id) => {
    const parents = byId.get(id).parents;
    if (!Array.isArray(parents) || !parents.length || !parents[0]?.sha) fail(`${short(id)} has no parents`);
    return parents.map((p) => p.sha);
  };
  const line = [];
  for (let id = head; byId.has(id);) {
    if (line.includes(id)) fail(`${short(id)} is its own ancestor`);
    line.push(id);
    id = parentsOf(id)[0];
  }
  const onLine = new Set(line);
  const side = new Set();
  for (const id of line) {
    for (const second of parentsOf(id).slice(1)) {
      for (let x = second; byId.has(x) && !onLine.has(x);) {
        if (side.has(x)) break;
        const [first, ...others] = parentsOf(x);
        if (!others.length || others.some((o) => byId.has(o))) fail(`${short(x)} is on a branch merged at ${short(id)} but is not a merge of main`);
        side.add(x);
        x = first;
        if (!byId.has(x) && !onLine.has(x)) fail(`the branch merged at ${short(id)} does not grow from the first-parent line`);
      }
    }
  }
  const off = commits.find((c) => !onLine.has(c.sha) && !side.has(c.sha));
  if (off) fail(`${short(off.sha)} is not on the first-parent line of ${short(head)}`);
  return line.reverse();
}

// The newest execution of each Case, per job, then one record per Case at this head: a failure of any job's newest run counts.
export function executionsOf(runs, head) {
  const perJob = new Map();
  for (const { job, text } of runs) {
    for (const line of text.split('\n')) {
      const m = CASE_LINE.exec(line.replace(/\u001b\[[0-9;]*m/g, ''));
      if (!m) continue;
      const key = `${job}\u0000${m[3]}`;
      const seen = perJob.get(key);
      if (!seen || m[1] >= seen.at) perJob.set(key, { case: m[3], head, conclusion: MARKS[m[2]], at: m[1] });
    }
  }
  const byCase = new Map();
  for (const e of perJob.values()) {
    const held = byCase.get(e.case);
    if (!held || (e.conclusion === 'failure' && held.conclusion !== 'failure') || (e.conclusion === held.conclusion && e.at > held.at)) byCase.set(e.case, e);
  }
  return [...byCase.values()];
}

export async function readFacts(repoName, declaration, get, getText, warn = () => {}) {
  const ev = declaration.evidence ?? {};
  const actFiles = [ev.act?.files].flat().filter((p) => typeof p === 'string').map((p) => new RegExp(p));
  const facts = { collectors: [] };
  for (const { name, scope } of declaration.collectors ?? []) {
    const scopes = Array.isArray(scope) ? scope.filter((p) => typeof p === 'string').map((p) => new RegExp(p)) : [];
    const inScope = (path) => !scopes.length || scopes.some((re) => re.test(path));
    let branch;
    try { branch = await get(`repos/${repoName}/branches/${name}`); } catch (error) {
      if (/HTTP 404/.test(error.message)) continue; // the host has no such collector: the capability reports it as not judged
      throw error;
    }
    const head = branch.commit.sha;
    try {
      const compare = await get(`repos/${repoName}/compare/main...${head}`);
      if (compare.files?.length >= MAX_FILES) throw new Error(`could not read all of the delta of ${name}: ${compare.files.length} files or more`);
      if (compare.total_commits > MAX_COMMITS || compare.commits.length < compare.total_commits) throw new Error(`could not read all of the history of ${name}: ${compare.total_commits} commits`);
      const delta = deltaOf(compare.files ?? []);

      const tree = await get(`repos/${repoName}/git/trees/${head}?recursive=1`);
      if (tree.truncated) throw new Error(`could not read all of the tree of ${name}: the host cut it`);

      const order = historyOf(compare.commits, compare.merge_base_commit.sha, head);
      // A merge is a SYNC only when every parent besides the first is a commit of main (proved with the host: main contains it) or a side
      // commit of such a merge. A merge of anything else (a development branch, the collector's own earlier commit) is the collector's own
      // work: its files are read like any commit, and a branch with work in it already failed closed in historyOf.
      const listed = new Set(compare.commits.map((c) => c.sha));
      const onLine = new Set(order);
      const main = new Set();
      const sync = new Set();
      for (const c of compare.commits) {
        const others = (c.parents ?? []).slice(1).map((p) => p.sha);
        for (const o of others) if (!listed.has(o)) main.add(o);
        if (onLine.has(c.sha) && others.length && others.every((o) => !listed.has(o) || (!onLine.has(o)))) sync.add(c.sha);
      }
      for (const m of main) {
        const against = await get(`repos/${repoName}/compare/main...${m}`);
        if (!['behind', 'identical'].includes(against.status)) throw new Error(`could not read the history of ${name}: ${m.slice(0, 8)} is merged as main but main does not contain it`);
      }
      const history = [];
      for (const id of order) {
        if (sync.has(id)) { history.push({ id, paths: [] }); continue; } // a SYNC: what it merged belongs to main, so it is not read as evidence
        const commit = await get(`repos/${repoName}/commits/${id}`);
        if ((commit.files?.length ?? 0) >= MAX_FILES) throw new Error(`could not read all of the files of commit ${id.slice(0, 8)} in ${name}`);
        history.push({ id, paths: deltaOf(commit.files ?? []).map((f) => f.path) });
      }

      const texts = {};
      const candidates = delta.filter((f) => f.status !== 'removed' && inScope(f.path) && actFiles.some((re) => re.test(f.path)));
      if (candidates.length > MAX_ACT_TEXTS) throw new Error(`could not read the ACT candidates of ${name}: ${candidates.length} files`);
      for (const f of candidates) {
        const file = await get(`repos/${repoName}/contents/${f.path.split('/').map(encodeURIComponent).join('/')}?ref=${head}`);
        if (file.encoding !== 'base64') throw new Error(`could not read ${f.path} of ${name}: the host gave no text`);
        texts[f.path] = Buffer.from(file.content, 'base64').toString('utf8');
      }

      const checks = await pages(get, `repos/${repoName}/commits/${head}/check-runs`, (r) => r.check_runs ?? []);
      const runs = [];
      for (const run of checks.filter((c) => c.status === 'completed' && c.app?.slug === 'github-actions')) {
        const job = run.id;
        try { runs.push({ job, text: await getText(`repos/${repoName}/actions/jobs/${job}/logs`) }); } catch (error) {
          if (!/HTTP 410|HTTP 404/.test(error.message)) throw error; // the host no longer keeps this log: its Cases are simply not reported
        }
      }
      facts.collectors.push({ name, at: head, delta, tree: tree.tree.filter((e) => e.type === 'blob').map((e) => e.path), history, texts, executions: executionsOf(runs, head) });
    } catch (error) {
      // What could not be read stays unread: the collector is reported without its file state, which the capability does not judge.
      if (!/^could not/.test(error.message)) throw error;
      warn(error.message);
      facts.collectors.push({ name, at: head });
    }
  }
  return facts;
}
