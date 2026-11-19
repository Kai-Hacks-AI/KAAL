# C94 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of CTL21.md

`````
---
id: release/CTL21
title: verify Hotfix
description: It reveals whether a Hotfix brings one Defect and a reproducing Case, and whether running that Case on main and on the Hotfix shows the correction.
type: detective
status: designed
has: [release/I10]
---
# release/CTL21 verify Hotfix

A detective control. A Hotfix brings its own Defect and its own reproducing Case: main is GREEN, so a RED Case is not on main to be found. `verify Hotfix` reads a Hotfix pull request, its head and the default branch, and judges two things apart. **Trace validity** is structural and is read as Git data from the head: the Defect chapter names exactly one KAAL Defect, the Defect has a record on the head that names its reproducing Cases, and each Case exists on the head. Where the record and the Case came from, the Hotfix or earlier, is no finding. **Correction evidence** is the proof: the same Case, taken from the head, is run against the code without the Hotfix (the default branch) and against the Hotfix's head, by the Run of Cases (testing/C63), and the two runs are compared. The Case must be RED on the default branch and GREEN on the head, for every reproducing Case the Defect records. The first commit of a Hotfix is RED on its head and a later commit may be GREEN: the head at hand is judged, and every push is judged again. Missing evidence, a run that could not be made or a run bound to another revision is UNKNOWN.

It says FAIL with the broken link when the trace is broken, when a Case is still RED on the head, or when it is GREEN on the default branch (it shows no issue there), and UNKNOWN otherwise. It never says PASS: even RED then GREEN does not show that the Case corresponds to the Defect, that the correction is minimal, that the diff holds no unrelated work or that the Case is honest, and these are always listed as not judged. A diff across several capability roots is listed for the reviewer to justify, never failed. It judges no route, base or admission, which belong to the envelope check (release/CTL11) and the Hotfix delivery path. The verdict is the report, not the job result: the job succeeds when a report was produced and fails only when none could be, and the verdict is in the report, the job summary and annotations.

It runs on a plain `pull_request` into a `hotfix/` base, with no token and no secret, once wired in the Integrating station. Two jobs on two machines: the first runs the Cases (code of the pull request, as any CI job does) and its output is only data; the second starts clean, runs the judge of the base and never a file of the pull request. Making it a required check is another control with its own Owner decision.

It has one Intent, release/I10.
`````

## Draft of F71.md

`````
---
id: release/F71
title: verify-hotfix
kind: functional
serves: [release/I10]
---
# release/F71 verify-hotfix

A pull request check reads a Hotfix, its head and the default branch, and judges apart the trace and the proof of its correction. A Hotfix brings its own Defect and Case. The trace is valid when the Defect chapter names exactly one KAAL Defect `<capability>/D<n>`, the Defect is recorded on the head with at least one reproducing Case, each such Case exists on the head, and the diff is not empty; each broken link is a finding. Whether the record and the Case are new or earlier is not judged. The proof is a comparison of two runs of the same Case, the head's own file, made by the Run of Cases: on the default branch (for which the Case file is copied over its tree) and on the head. A Defect may record several reproducing Cases and every one of them is read: the correction is verified only when each is RED on the default branch and GREEN on the head. RED on the default branch is expected and never a finding; a Case still RED on the head, or GREEN on the default branch, is a finding for that Case, however many others are verified. A run that cannot be made (the Case does not load, its tree cannot be prepared, a timeout), a Case with no attributed test, or a run bound to another revision than the one read, leaves the correction UNKNOWN, never RED. The first commit of a Hotfix is RED on its head and a later commit may be GREEN: the head at hand is judged. A diff across more than one capability root is listed for the reviewer to justify and never fails. The verdict is FAIL with a finding and UNKNOWN without one: it is never PASS, and it always lists what stays unjudged: that the Case corresponds to the Defect, that the correction is minimal, that the diff holds no unrelated work and that the Case is honest. The check runs on `pull_request` with no token and no secret. The Cases are code of the pull request and are run in their own job; the judge runs in a clean job, from the base's own copy, reads the head and the default branch as Git data and the two runs as data, and reads the body from the event, never from script text. An unreadable ref or an absent judge is UNKNOWN or a failed step, never a pass. The verdict is the report and not the execution result: when a report is produced the job succeeds whatever the verdict, and it fails only when no report could be produced; the verdict is in the report, in the job summary and in annotations, so a reviewer tells an executed report from a broken check. Requiring the check, which would have to read the verdict and not the job result, is a separate control with its own Owner decision.
`````

## Draft of A66.md

`````
---
id: release/A66
title: verify-hotfix
addresses: [release/F71]
---
# release/A66 verify-hotfix

One module `05-src/hotfix/verify-hotfix.mjs` with a pure judge `judgeHotfixTrace(facts)`, a reader of the facts as Git data (`readFacts`, `defectsOf`), a reader of the Run of Cases (`caseResult`, `evidenceFrom`), the two actions of the Run (`overlay`, `runAt`) and a command line with three commands. `cases` prints the head's Case files of the Defect. `run --on baseline|head` copies those files over the baseline tree (the head's are already there), runs them with `kaal-testing run --root <tree>` (testing/F138 to F145) and writes `{ rev, report }`; a run that cannot be made writes no file. The judge command (`--base`, `--baseline`, `--head`, `--body-file`, `--baseline-run`, `--head-run`) prints a report whose first word is the verdict, FAIL or UNKNOWN and never PASS, and exits 0 when a report was produced, whatever the verdict, and 2 when it could not be (a missing argument); on GitHub Actions it also writes the report to the job summary and each finding as an annotation. The reader takes the Defect references from the Defect chapter of the body, the paths from `git diff` of the pull request's own base and the head, a Defect record from `<home>/06-defects/D<n>-*.md` on the head (`<home>` is `packages/kaal-<capability>` or `engineering/<capability>`, the JSON `tests` list is its reproducing Cases) and the files of a Case from its identity in a `.mjs` or `.ts` file on the head. The result of a Case in a run is read from the tests the Run attributes to it by their leading `<namespace>/T<n>` (testing/F141): RED if one is RED, GREEN if all are GREEN, otherwise UNKNOWN, and nothing if none. A run counts only when its recorded revision is the one the judge resolved for that side. The baseline is the default branch. One workflow source `05-src/wiring/workflows/verify-hotfix.yml` (on `pull_request` into `hotfix/**`, read-only, no secret) has two jobs: `run Hotfix Cases` prepares the base's Run of Cases, runs the Cases on the two trees and uploads the two runs; `verify Hotfix`, a clean job that needs it, checks out the base commit with no stored credential, fetches the head from `refs/pull/<number>/head`, downloads the runs as data, writes the body from the environment to a file and never into script text, and runs the base's judge. Each tree is prepared with `npm ci --ignore-scripts`; a Case that needs more reads UNKNOWN. The module is the judge release/CTL21 declares. Its registration in the Integrating station is a later WIRE, and requiring the check is the Owner's later decision.
`````

## Draft of F16-sentence.md

`````
One Hotfix corrects one identified Defect and brings that Defect and the Case that reproduces it. Whether running the Case on the default branch and on the Hotfix shows the correction is judged by release/CTL21 (release/F71) and not here. The interface guides the author and states no verification.
`````

## Draft of verify-hotfix.mjs

`````
// verify Hotfix (release/CTL21): does a HOTFIX bring one Defect and a reproducing Case, and does the Case show the
// correction? A Hotfix brings its own Defect record and Case: they are read from the Hotfix's head, not from the base.
// Two judgments are kept apart. Trace validity is structural and is read as Git data: the Defect chapter names one
// Defect, its record on the head names reproducing Cases, and each Case exists on the head. Correction evidence is the
// proof: the SAME Case, taken from the head, is run against the code without the Hotfix (the baseline, the default
// branch) and against the Hotfix's head, and the two runs are compared: RED on the baseline and GREEN on the head, for
// EVERY reproducing Case. The first commit of a Hotfix is RED on its head and a later commit may be GREEN: the head at
// hand is judged. The runs are made by the Run of Cases (kaal-testing run) and this module only reads them.
// It never answers PASS: the Case-to-Defect correspondence, minimality, unrelated work and the honesty of the Case are
// for the reviewer and are always listed as not judged. The verdict is the report; the exit status only says whether a
// report was produced (see the command line).
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const NOT_JUDGED = [
  'whether the Case corresponds to the Defect is not judged: the review decides it',
  'whether the correction is minimal is not judged: the diff and the review decide it',
  'whether the diff holds no unrelated work is not judged: the diff and the review decide it',
  'whether the Case is honest is not judged: it is code of the pull request and can tell the two trees apart; the review decides it',
];

const rootOf = (path) => {
  const parts = String(path).split('/');
  return (parts[0] === 'packages' || parts[0] === 'engineering') && parts[1] ? `${parts[0]}/${parts[1]}` : parts[0];
};

// Evidence is usable only when it is bound to the revision it is read for.
const part = (evidence, key, rev) => {
  const p = evidence?.[key];
  if (!p || (p.result !== 'RED' && p.result !== 'GREEN')) return undefined;
  return p.rev === rev ? p : undefined;
};

export function judgeHotfixTrace(facts) {
  const { defects = [], paths = [], baseRev, headRev, lookupDefect, caseExists, caseEvidence } = facts ?? {};
  const findings = [];
  const attention = [];
  const notJudged = [...NOT_JUDGED];

  if (paths.length === 0) findings.push('the diff is empty: a HOTFIX changes something');
  if (defects.length === 0) findings.push('the HOTFIX names no Defect: a HOTFIX corrects one identified Defect');
  if (defects.length > 1) findings.push(`the HOTFIX names ${defects.length} Defects: a HOTFIX corrects one Defect`);

  let caseIds = [];
  if (defects.length === 1) {
    const recorded = lookupDefect?.(defects[0]);
    if (!recorded) findings.push(`the Defect ${defects[0]} is not recorded`);
    else if (!Array.isArray(recorded.cases) || recorded.cases.length === 0) {
      findings.push(`the Defect ${defects[0]} names no reproducing Case`);
    } else {
      caseIds = recorded.cases;
      for (const c of caseIds) {
        if (!caseExists?.(c)) findings.push(`the reproducing Case ${c} of ${defects[0]} does not exist`);
      }
    }
  }
  const trace = findings.length === 0 ? 'VALID' : 'BROKEN';

  const roots = [...new Set(paths.map(rootOf))];
  if (roots.length > 1) attention.push(`the diff spans ${roots.length} capability roots (${roots.join(', ')}): the HOTFIX justifies why one Defect needs them`);

  // Correction evidence, read for every reproducing Case. RED at the baseline is expected; GREEN at the head alone
  // proves nothing. The correction is VERIFIED only when every Case is VERIFIED; one NOT VERIFIED is a finding for
  // that Case; a Case without usable evidence leaves the correction UNKNOWN.
  const cases = [];
  let correction = 'UNKNOWN';
  if (trace === 'VALID') {
    for (const caseId of caseIds) {
      const evidence = caseEvidence?.(caseId);
      const base = part(evidence, 'baseline', baseRev);
      const head = part(evidence, 'head', headRev);
      let state = 'UNKNOWN';
      if (head?.result === 'RED') {
        state = 'NOT VERIFIED';
        findings.push(`the Case ${caseId} is still RED on the corrected head: the correction is not verified`);
      } else if (base?.result === 'GREEN') {
        state = 'NOT VERIFIED';
        findings.push(`the Case ${caseId} is GREEN at the baseline: it did not reproduce the defect`);
      } else if (base?.result === 'RED' && head?.result === 'GREEN') {
        state = 'VERIFIED';
      } else {
        notJudged.push(`the correction evidence of ${caseId} is missing or bound to another revision: RED at the baseline and GREEN at the corrected head are not both read`);
      }
      cases.push({ id: caseId, correction: state });
    }
    if (cases.some((c) => c.correction === 'NOT VERIFIED')) correction = 'NOT VERIFIED';
    else if (cases.every((c) => c.correction === 'VERIFIED')) correction = 'VERIFIED';
  } else {
    notJudged.push('the correction evidence is not read: the trace is broken');
  }

  return { verdict: findings.length > 0 ? 'FAIL' : 'UNKNOWN', trace, correction, cases, findings, attention, notJudged };
}

// The KAAL Defect identities of the Defect chapter of a HOTFIX body: `<capability>/D<n>`.
export function defectsOf(body) {
  const text = String(body ?? '').replace(/<!--[\s\S]*?-->/g, '');
  const chapter = text.split(/^##\s+Defect\s*$/m)[1]?.split(/^##\s+/m)[0] ?? '';
  return [...new Set(chapter.match(/\b[a-z][a-z0-9-]*\/D\d+\b/g) ?? [])];
}

// Facts as Git data. The Defect record and the Cases are the Hotfix's own and are read from its head; the baseline
// is the default branch, the code without the Hotfix. `paths` are the Hotfix's own diff against its pull request base.
export function readFacts({ root = '.', base, head, baseline, body }) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  const rev = (r) => git('rev-parse', '--verify', '--quiet', `${r}^{commit}`).trim();
  const baseRev = rev(baseline ?? base);
  const headRev = rev(head);
  const paths = git('diff', '--name-only', `${rev(base)}...${headRev}`).split('\n').filter(Boolean);
  const lookupDefect = (id) => {
    const [cap, d] = id.split('/');
    for (const home of [`packages/kaal-${cap}`, `engineering/${cap}`]) {
      let names = '';
      try { names = git('ls-tree', '--name-only', headRev, `${home}/06-defects/`); } catch { continue; }
      const file = names.split('\n').find((n) => new RegExp(`/${d}-[^/]*\\.md$`).test(n));
      if (!file) continue;
      const json = /```json\n([\s\S]*?)\n```/.exec(git('show', `${headRev}:${file}`))?.[1];
      try {
        const record = JSON.parse(json);
        return record.id === id ? { cases: Array.isArray(record.tests) ? record.tests : [] } : undefined;
      } catch { return undefined; }
    }
    return undefined;
  };
  const caseFiles = (id) => {
    try { return git('grep', '-l', '-E', `${id.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}([^0-9]|$)`, headRev, '--', '*.mjs', '*.ts').split('\n').filter(Boolean).map((l) => l.slice(headRev.length + 1)); } catch { return []; }
  };
  const caseExists = (id) => caseFiles(id).length > 0;
  return { baseRev, headRev, paths, defects: defectsOf(body), lookupDefect, caseExists, caseFiles };
}

// The result of one Case in one run report of the Run of Cases (kaal-testing/run-report@1): the tests attributed to
// the Case by their leading `<namespace>/T<n>`. RED when one is RED, GREEN when all are GREEN, UNKNOWN when one is not
// observed to end, and nothing when no test is attributed (the Case did not run).
export function caseResult(report, id) {
  if (report?.schema !== 'kaal-testing/run-report@1' || !Array.isArray(report.tests)) return undefined;
  const m = /^([a-z][a-z0-9-]*)\/T(\d+)$/.exec(id);
  if (!m) return undefined;
  const own = report.tests.filter((t) => t.case && t.case.namespace === m[1] && t.case.number === Number(m[2]));
  if (own.length === 0) return undefined;
  if (own.some((t) => t.actual === 'RED')) return 'RED';
  return own.every((t) => t.actual === 'GREEN') ? 'GREEN' : 'UNKNOWN';
}

// The Run record of the judge: for each Case the result of the same Case on the baseline and on the head, bound to the
// revision each run was made on. A run file is `{ rev, report }`; a run made on another revision is not read.
export function evidenceFrom({ baselineRun, headRun }) {
  return (id) => ({
    baseline: baselineRun?.report ? { rev: baselineRun.rev, result: caseResult(baselineRun.report, id) } : undefined,
    head: headRun?.report ? { rev: headRun.rev, result: caseResult(headRun.report, id) } : undefined,
  });
}

// One run of the Case files on one tree, by the Run of Cases, written as `{ rev, report }`. The Case files are the
// head's: for the baseline they are copied over the baseline tree, so the same Case is run against the code without
// the Hotfix. A run that cannot be made writes no file.
export function runAt({ runner, tree, rev, files, out, timeoutMs = 600000 }) {
  const stdout = execFileSync(process.execPath, [runner, 'run', '--root', tree, ...files], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: timeoutMs });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify({ rev, report: JSON.parse(stdout) }));
}

export function overlay({ root, head, tree, files }) {
  for (const f of files) {
    const text = execFileSync('git', ['-C', root, 'show', `${head}:${f}`], { maxBuffer: 64 * 1024 * 1024 });
    mkdirSync(dirname(join(tree, f)), { recursive: true });
    writeFileSync(join(tree, f), text);
  }
}

// The command line. Two commands.
//   cases  --head <rev> --body-file <file> [--root <dir>]   prints the head's Case files of the Defect, one per line
//   run    --on baseline|head --baseline <rev> --head <rev> --body-file <file> --tree <dir> --runner <file> --out <file> [--root <dir>]
//          runs the head's Case files on <dir> by the Run of Cases (for the baseline they are first copied over <dir>) and
//          writes `{ rev, report }` to --out; a run that cannot be made writes no file and the judge reads that as UNKNOWN
//   (none) --base <rev> --baseline <rev> --head <rev> --body-file <file> [--root <dir>] [--baseline-run <file>] [--head-run <file>]
// The verdict is the report and never an exit status: exit 0 means a report was produced, whatever the verdict (FAIL or
// UNKNOWN is its first word); exit 2 means no report could be produced (a missing argument). `--base` is the pull
// request's own base, for its diff; `--baseline` is the default branch, the code without the Hotfix. A run file is
// `{ rev, report }` of the Run of Cases; without both runs the correction is UNKNOWN.
// On GitHub Actions the report is also written to the job summary and its findings are annotations, so a reviewer
// sees the verdict at the check without it being the job result.
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  const root = arg('--root') || '.';
  const read = (file) => { try { return file ? JSON.parse(readFileSync(file, 'utf8')) : undefined; } catch { return undefined; } };
  if (process.argv[2] === 'cases') {
    if (!arg('--head') || !arg('--body-file')) { console.error('usage: verify-hotfix.mjs cases --head <rev> --body-file <file> [--root <dir>]'); process.exit(2); }
    try {
      const facts = readFacts({ root, base: arg('--head'), head: arg('--head'), body: readFileSync(arg('--body-file'), 'utf8') });
      const cases = facts.defects.length === 1 ? facts.lookupDefect(facts.defects[0])?.cases ?? [] : [];
      console.log([...new Set(cases.flatMap((c) => facts.caseFiles(c)))].join('\n'));
    } catch { /* no files: the judge reports UNKNOWN */ }
    process.exit(0);
  }
  if (process.argv[2] === 'run') {
    const on = arg('--on');
    for (const k of ['--head', '--baseline', '--body-file', '--tree', '--runner', '--out']) if (!arg(k)) { console.error(`usage: verify-hotfix.mjs run --on baseline|head ... (${k} is missing)`); process.exit(2); }
    if (on !== 'baseline' && on !== 'head') { console.error('--on is baseline or head'); process.exit(2); }
    try {
      const facts = readFacts({ root, base: arg('--head'), baseline: arg('--baseline'), head: arg('--head'), body: readFileSync(arg('--body-file'), 'utf8') });
      const cases = facts.defects.length === 1 ? facts.lookupDefect(facts.defects[0])?.cases ?? [] : [];
      const files = [...new Set(cases.flatMap((c) => facts.caseFiles(c)))];
      if (files.length > 0) {
        if (on === 'baseline') overlay({ root, head: facts.headRev, tree: arg('--tree'), files });
        runAt({ runner: arg('--runner'), tree: arg('--tree'), rev: on === 'baseline' ? facts.baseRev : facts.headRev, files, out: arg('--out') });
      }
    } catch (e) { console.error(`no run was made: ${String(e.message).split('\n')[0]}`); }
    process.exit(0);
  }
  if (!arg('--base') || !arg('--head') || !arg('--body-file')) {
    console.error('usage: verify-hotfix.mjs --base <rev> --baseline <rev> --head <rev> --body-file <file> [--root <dir>] [--baseline-run <file>] [--head-run <file>]');
    process.exit(2);
  }
  let r;
  try {
    const facts = readFacts({ root, base: arg('--base'), baseline: arg('--baseline'), head: arg('--head'), body: readFileSync(arg('--body-file'), 'utf8') });
    const bound = (run, rev) => (run && run.rev === rev ? run : undefined);
    const evidence = evidenceFrom({ baselineRun: bound(read(arg('--baseline-run')), facts.baseRev), headRun: bound(read(arg('--head-run')), facts.headRev) });
    r = judgeHotfixTrace({ ...facts, caseEvidence: evidence });
  } catch (e) {
    r = { verdict: 'UNKNOWN', trace: 'UNREAD', correction: 'UNKNOWN', cases: [], findings: [], attention: [], notJudged: [`a fact could not be read: ${String(e.message).split('\n')[0]}`] };
  }
  const lines = [`${r.verdict}: trace ${r.trace}, correction ${r.correction}`, ...r.cases.map((c) => `case ${c.id}: ${c.correction}`), ...r.findings.map((f) => `finding: ${f}`), ...r.attention.map((a) => `attention: ${a}`), ...r.notJudged.map((n) => `not judged: ${n}`)];
  console.log(lines.join('\n'));
  if (process.env.GITHUB_ACTIONS === 'true') {
    for (const f of r.findings) console.log(`::error title=verify Hotfix::${f}`);
    if (r.verdict === 'UNKNOWN') console.log(`::warning title=verify Hotfix::UNKNOWN: ${r.notJudged.join('; ')}`);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## verify Hotfix: ${r.verdict}\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n\nThe job result says that this report was produced. The verdict is above and is never PASS.\n`);
  }
  process.exit(0);
}
`````

## Draft of verify-hotfix.yml

`````
name: verify Hotfix
# release/CTL21. A detective check on plain pull_request: no token, no secret, no privileged trigger.
# Two jobs on two machines. `run Hotfix Cases` runs the Hotfix's Cases on two trees by the Run of Cases (kaal-testing run),
# as the repository's own CI runs its tests on a plain pull_request: read-only token, no secret. That is code of the pull request
# running, so its output is only data. `verify Hotfix` starts clean, checks out the base, the trusted judge, reads the pull request
# as Git data and the two runs as data, and judges. The body is data in a file, never script text.
# The job result says whether the report was produced. The verdict (FAIL or UNKNOWN, never PASS) is in the report, the job summary and the annotations.
on:
  pull_request:
    branches: ['hotfix/**']
permissions:
  contents: read
jobs:
  run-hotfix-cases:
    name: run Hotfix Cases
    runs-on: ubuntu-latest
    env:
      PR_NUMBER: ${{ github.event.pull_request.number }}
      PR_BODY: ${{ github.event.pull_request.body }}
      DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}
    steps:
      - name: Check out the base, the trusted Run of Cases
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          ref: ${{ github.event.pull_request.base.sha }}
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1
        with:
          node-version: 24
      - name: Fetch the proposed head and the default branch as Git data
        run: |
          git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"
          git fetch --no-tags origin "+refs/heads/${DEFAULT_BRANCH}:refs/remotes/origin/${DEFAULT_BRANCH}"
      - name: Prepare the Run of Cases of the base
        run: |
          npm ci --ignore-scripts
          npm run build -w kaal-core -w @kaihacksai/kaal-hosting
      - name: Run the Hotfix's Cases on the baseline and on the head
        run: |
          J=engineering/release-management/05-src/hotfix/verify-hotfix.mjs
          test -f "$J" || { echo "no run: the judge is absent on the base"; exit 0; }
          mkdir -p "$RUNNER_TEMP/runs"
          printf '%s' "$PR_BODY" > "$RUNNER_TEMP/body.md"
          git worktree add --detach "$RUNNER_TEMP/baseline" "refs/remotes/origin/${DEFAULT_BRANCH}"
          git worktree add --detach "$RUNNER_TEMP/head" refs/remotes/pull/head
          for T in baseline head; do (cd "$RUNNER_TEMP/$T" && npm ci --ignore-scripts) || true; done
          for T in baseline head; do
            node "$J" run --on "$T" --baseline "refs/remotes/origin/${DEFAULT_BRANCH}" --head refs/remotes/pull/head --body-file "$RUNNER_TEMP/body.md" --tree "$RUNNER_TEMP/$T" --runner "$PWD/packages/kaal-testing/bin/kaal-testing.mjs" --out "$RUNNER_TEMP/runs/$T.json"
          done
      - uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9
        with:
          name: hotfix-runs
          path: ${{ runner.temp }}/runs
          if-no-files-found: ignore
  verify-hotfix:
    name: verify Hotfix
    needs: run-hotfix-cases
    if: ${{ !cancelled() }}
    runs-on: ubuntu-latest
    env:
      BASE_SHA: ${{ github.event.pull_request.base.sha }}
      PR_NUMBER: ${{ github.event.pull_request.number }}
      PR_BODY: ${{ github.event.pull_request.body }}
      DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}
    steps:
      - name: Check out the base, the trusted judge
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          ref: ${{ github.event.pull_request.base.sha }}
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1
        with:
          node-version: 24
      - name: Fetch the proposed head and the default branch as Git data
        run: |
          git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"
          git fetch --no-tags origin "+refs/heads/${DEFAULT_BRANCH}:refs/remotes/origin/${DEFAULT_BRANCH}"
      - uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333
        continue-on-error: true
        with:
          name: hotfix-runs
          path: ${{ runner.temp }}/runs
      - name: Judge
        run: |
          J=engineering/release-management/05-src/hotfix/verify-hotfix.mjs
          test -f "$J" || { echo "UNKNOWN: the judge is absent on the base"; exit 2; }
          printf '%s' "$PR_BODY" > "$RUNNER_TEMP/body.md"
          node "$J" --base "$BASE_SHA" --baseline "refs/remotes/origin/${DEFAULT_BRANCH}" --head refs/remotes/pull/head --body-file "$RUNNER_TEMP/body.md" --baseline-run "$RUNNER_TEMP/runs/baseline.json" --head-run "$RUNNER_TEMP/runs/head.json"
`````
