# C94 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of CTL21.md

`````
---
id: release/CTL21
title: verify Hotfix
description: It proves whether a Hotfix is valid: one Defect and at least one Case that verifies it, RED before and GREEN after.
type: detective
status: designed
has: [release/I10]
---
# release/CTL21 verify Hotfix

A detective control. A valid Hotfix is exactly this: one Defect, and at least one Case that verifies it, RED before and GREEN after. `verify Hotfix` proves that, deterministically, from two trees: a before tree and an after tree. The concept is pure content and takes the two trees as input; whether they are two branches or two file locations does not matter, and only a platform adapter maps its refs onto them (for GitHub, the default branch and the head of a pull request into a `hotfix/` base). A Hotfix brings its own Defect record and Case, so the Defect chapter names one Defect and the after tree holds its record and its Cases, new or earlier. The same Case file is run by the Run of Cases (testing/C63) on the before tree and on the after tree, and every Case the Defect records must be RED before and GREEN after. The first commit of a Hotfix is RED after and a later commit may be GREEN: the after tree at hand is judged, and every push is judged again.

It says PASS when the Hotfix is valid, FAIL with the broken link when it is not, and UNKNOWN when a run could not be made or read. PASS is proven, not approved: whether a Case corresponds to its Defect, is honest, or whether the correction is minimal is content, which review decides, and the Inspector later; this control judges none of it. It judges no route, base or admission, which belong to the envelope check (release/CTL11) and the Hotfix delivery path.

The verdict is the report, not the job result: the job succeeds when a report was produced and fails only when none could be. On GitHub it runs on a plain `pull_request` with no token and no secret, once wired in the Integrating station, in two jobs on two machines: the first runs the Cases, which are code of the pull request, as any CI job does, and its output is only data; the second starts clean and runs the judge of the base. Making it a required check is another control with its own Owner decision, and it would have to read the verdict, not the job result.

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

A check takes two trees, before and after, and the body of a Hotfix, and proves whether the Hotfix is valid. A Hotfix is valid when the Defect chapter names exactly one KAAL Defect `<capability>/D<n>`, the Defect has a record in the after tree with at least one Case that verifies it, each such Case exists in the after tree, and every one of those Cases, the same file run by the Run of Cases on both trees (for the before tree the Case file is first copied over it), is RED before and GREEN after. Where the record and the Case came from, the Hotfix or earlier, is not judged. A Case still RED after, or GREEN before, is a finding for that Case; a run that could not be made, a Case with no attributed test, or a result that is not RED or GREEN leaves the verdict UNKNOWN, never RED. The verdict is PASS when the Hotfix is valid, FAIL with a finding when it is not, and UNKNOWN otherwise. The check takes no Git refs: the mapping of refs onto the two trees belongs to the adapter of a platform. The adapter for GitHub takes the default branch as the before tree and the head of the pull request as the after tree, runs the Cases in their own job because they are code of the pull request, and judges in a clean job from the base's own copy, reading the after tree and the two runs as data and the body from the event, never from script text. The verdict is the report and not the execution result: when a report is produced the job succeeds whatever the verdict, and it fails only when none could be, so a reviewer tells an executed report from a broken check; the verdict is in the report, the job summary and annotations. Requiring the check is a separate control with its own Owner decision.
`````

## Draft of A66.md

`````
---
id: release/A66
title: verify-hotfix
addresses: [release/F71]
---
# release/A66 verify-hotfix

One module `05-src/hotfix/verify-hotfix.mjs`: a pure judge `judgeHotfix(facts)`, a reader of the after tree (`readFacts`, `defectsOf`), a reader of the Run of Cases (`caseResult`, `evidenceFrom`), the two actions of the Run (`overlay`, `runAt`) and a command line over two directories, `--before` and `--after`. The reader takes the Defect from the Defect chapter of the body, its record from `<home>/06-defects/D<n>-*.md` in the after tree (`<home>` is `packages/kaal-<capability>` or `engineering/<capability>`, the JSON `tests` list is its Cases) and a Case's files from its identity in a `.mjs` or `.ts` file of the after tree. A Case's result in a run is read from the tests the Run attributes to it by their leading `<namespace>/T<n>` (testing/F141): RED if one is RED, GREEN if all are GREEN, otherwise UNKNOWN, nothing if none. Three commands: `cases` prints the Case files; `run --on before|after` runs them on that tree with `kaal-testing run --root <tree>` (testing/F138 to F145), the before tree having the files copied over it, and writes the report, and writes none if no run can be made; the judgment prints a report whose first word is the verdict and exits 0 whenever a report was produced, 2 only when none could be. On GitHub Actions it also writes the job summary and an annotation per finding. The GitHub adapter is one workflow source `05-src/wiring/workflows/verify-hotfix.yml` (on `pull_request` into `hotfix/**`, read-only, no secret): job `run Hotfix Cases` checks out the base, prepares its Run of Cases, makes a tree of the default branch and a tree of the pull request's head (`refs/pull/<number>/head`), prepares each with `npm ci --ignore-scripts`, runs the Cases on both and uploads the two reports; job `verify Hotfix`, clean and needing it, checks out the base commit with no stored credential, makes the after tree to be read and never run, downloads the reports as data, writes the body from the environment to a file and never into script text, and runs the base's judge. A Case that needs more than `npm ci --ignore-scripts` reads UNKNOWN. The module is the judge release/CTL21 declares. Its registration in the Integrating station is a later WIRE, and requiring the check is the Owner's later decision.
`````

## Draft of F16-sentence.md

`````
One Hotfix corrects one identified Defect and brings the Case that verifies it. Whether that Case is RED before and GREEN after is proven by release/CTL21 (release/F71) and not here. The interface guides the author.
`````

## Draft of verify-hotfix.mjs

`````
// verify Hotfix (release/CTL21): is this a valid Hotfix? One Defect, at least one Case that verifies it, RED before
// and GREEN after. "Before" and "after" are two trees (directories): the concept is pure content and does not care
// whether they are two branches or two file locations. Only the adapter of a platform maps its refs onto the two
// trees (for GitHub: the default branch and the Hotfix's head, see the workflow source).
// A Hotfix brings its own Defect record and Case, so both are read from the after tree. The proof is a comparison: the
// same Case, the after tree's own file, is run by the Run of Cases (kaal-testing run) on the before tree and on the
// after tree, for EVERY Case the Defect records. This module reads the after tree and the two runs as data. PASS means
// proven mechanically, not approved.
import { appendFileSync, copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, sep } from 'node:path';
import { stripComments } from '../plan-body/comments.mjs';

export function judgeHotfix(facts) {
  const { defects = [], lookupDefect, caseExists, caseEvidence } = facts ?? {};
  const findings = [];
  const unknown = [];

  if (defects.length === 0) findings.push('the HOTFIX names no Defect: a HOTFIX corrects one identified Defect');
  if (defects.length > 1) findings.push(`the HOTFIX names ${defects.length} Defects: a HOTFIX corrects one Defect`);

  let caseIds = [];
  if (defects.length === 1) {
    const recorded = lookupDefect?.(defects[0]);
    if (!recorded) findings.push(`the Defect ${defects[0]} has no record in the after tree`);
    else if (!Array.isArray(recorded.cases) || recorded.cases.length === 0) {
      findings.push(`the Defect ${defects[0]} names no Case that verifies it`);
    } else {
      caseIds = recorded.cases;
      for (const c of caseIds) {
        if (!caseExists?.(c)) findings.push(`the Case ${c} of ${defects[0]} does not exist in the after tree`);
      }
    }
  }
  const trace = findings.length === 0 ? 'VALID' : 'BROKEN';

  // The proof, read for every Case: RED before and GREEN after.
  const cases = [];
  let correction = 'UNKNOWN';
  if (trace === 'VALID') {
    for (const caseId of caseIds) {
      const { before, after } = caseEvidence?.(caseId) ?? {};
      let state = 'UNKNOWN';
      if (after === 'RED') {
        state = 'NOT VERIFIED';
        findings.push(`the Case ${caseId} is still RED after`);
      } else if (before === 'GREEN') {
        state = 'NOT VERIFIED';
        findings.push(`the Case ${caseId} is GREEN before: it shows no issue there`);
      } else if (before === 'RED' && after === 'GREEN') {
        state = 'VERIFIED';
      } else {
        unknown.push(`the Case ${caseId} was not observed RED before and GREEN after`);
      }
      cases.push({ id: caseId, correction: state });
    }
    if (cases.some((c) => c.correction === 'NOT VERIFIED')) correction = 'NOT VERIFIED';
    else if (cases.every((c) => c.correction === 'VERIFIED')) correction = 'VERIFIED';
  }

  const verdict = findings.length > 0 ? 'FAIL' : correction === 'VERIFIED' ? 'PASS' : 'UNKNOWN';
  return { verdict, trace, correction, cases, findings, unknown };
}

// The KAAL Defect identities of the Defect chapter of a HOTFIX body: `<capability>/D<n>`.
export function defectsOf(body) {
  const text = stripComments(String(body ?? ''));
  const chapter = text.split(/^##\s+Defect\s*$/m)[1]?.split(/^##\s+/m)[0] ?? '';
  return [...new Set(chapter.match(/\b[a-z][a-z0-9-]*\/D\d+\b/g) ?? [])];
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  if (e.name === 'node_modules' || e.name === '.git') return [];
  const p = join(dir, e.name);
  return e.isDirectory() ? walk(p) : e.isFile() ? [p] : [];
});

// Facts from the after tree. The Defect record and the Cases are the Hotfix's own and are read from it.
export function readFacts({ after, body }) {
  const lookupDefect = (id) => {
    const [cap, d] = id.split('/');
    for (const home of [`packages/kaal-${cap}`, `engineering/${cap}`]) {
      const dir = join(after, home, '06-defects');
      let names = [];
      try { names = readdirSync(dir); } catch { continue; }
      const file = names.find((n) => new RegExp(`^${d}-.*\\.md$`).test(n));
      if (!file) continue;
      const json = /```json\n([\s\S]*?)\n```/.exec(readFileSync(join(dir, file), 'utf8'))?.[1];
      try {
        const record = JSON.parse(json);
        return record.id === id ? { cases: Array.isArray(record.tests) ? record.tests : [] } : undefined;
      } catch { return undefined; }
    }
    return undefined;
  };
  const caseFiles = (id) => {
    const found = new RegExp(`${id.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}([^0-9]|$)`);
    return walk(after).filter((p) => /\.(mjs|ts)$/.test(p) && found.test(readFileSync(p, 'utf8'))).map((p) => relative(after, p).split(sep).join('/'));
  };
  return { defects: defectsOf(body), lookupDefect, caseExists: (id) => caseFiles(id).length > 0, caseFiles };
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

export const evidenceFrom = ({ beforeRun, afterRun }) => (id) => ({ before: caseResult(beforeRun, id), after: caseResult(afterRun, id) });

// The Case files of the Hotfix, copied over the before tree so that the same Case runs against the code without the Hotfix.
export function overlay({ after, before, files }) {
  for (const f of files) {
    mkdirSync(dirname(join(before, f)), { recursive: true });
    copyFileSync(join(after, f), join(before, f));
  }
}

// One run of the Case files on one tree, by the Run of Cases; its report is written to `out`. A run that cannot be
// made writes no file.
export function runAt({ runner, tree, files, out, timeoutMs = 600000 }) {
  const stdout = execFileSync(process.execPath, [runner, 'run', '--root', tree, ...files], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: timeoutMs });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, stdout);
}

// The command line. Three commands over two trees, `--before` and `--after`, and the Hotfix's body.
//   cases  --after <dir> --body-file <file>                the Case files of the Defect, one per line
//   run    --on before|after --before <dir> --after <dir> --body-file <file> --runner <file> --out <file>
//          runs those files on that tree by the Run of Cases (for `before` first copied over it) and writes the report
//          to --out; a run that cannot be made writes no file and the judge reads UNKNOWN
//   (none) --after <dir> --body-file <file> [--before-run <file>] [--after-run <file>]    the judgment
// The verdict (PASS, FAIL or UNKNOWN) is the first word of the report and never the exit status: exit 0 means a report
// was produced; exit 2 means none could be (a missing argument). On GitHub Actions the report is also written to the
// job summary and its findings are annotations.
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  const read = (file) => { try { return file ? JSON.parse(readFileSync(file, 'utf8')) : undefined; } catch { return undefined; } };
  const need = (...keys) => { for (const k of keys) if (!arg(k)) { console.error(`${k} is missing`); process.exit(2); } };
  const filesOf = (facts) => [...new Set((facts.defects.length === 1 ? facts.lookupDefect(facts.defects[0])?.cases ?? [] : []).flatMap((c) => facts.caseFiles(c)))];
  if (process.argv[2] === 'cases') {
    need('--after', '--body-file');
    try { console.log(filesOf(readFacts({ after: arg('--after'), body: readFileSync(arg('--body-file'), 'utf8') })).join('\n')); } catch { /* no files: the judge reports UNKNOWN */ }
    process.exit(0);
  }
  if (process.argv[2] === 'run') {
    need('--on', '--before', '--after', '--body-file', '--runner', '--out');
    const on = arg('--on');
    if (on !== 'before' && on !== 'after') { console.error('--on is before or after'); process.exit(2); }
    try {
      const files = filesOf(readFacts({ after: arg('--after'), body: readFileSync(arg('--body-file'), 'utf8') }));
      if (files.length > 0) {
        if (on === 'before') overlay({ after: arg('--after'), before: arg('--before'), files });
        runAt({ runner: arg('--runner'), tree: arg(`--${on}`), files, out: arg('--out') });
      }
    } catch (e) { console.error(`no run was made: ${String(e.message).split('\n')[0]}`); }
    process.exit(0);
  }
  need('--after', '--body-file');
  let r;
  try {
    r = judgeHotfix({ ...readFacts({ after: arg('--after'), body: readFileSync(arg('--body-file'), 'utf8') }), caseEvidence: evidenceFrom({ beforeRun: read(arg('--before-run')), afterRun: read(arg('--after-run')) }) });
  } catch (e) {
    r = { verdict: 'UNKNOWN', trace: 'UNREAD', correction: 'UNKNOWN', cases: [], findings: [], unknown: [`a fact could not be read: ${String(e.message).split('\n')[0]}`] };
  }
  const lines = [`${r.verdict}: trace ${r.trace}, correction ${r.correction}`, ...r.cases.map((c) => `case ${c.id}: ${c.correction}`), ...r.findings.map((f) => `finding: ${f}`), ...r.unknown.map((u) => `unknown: ${u}`)];
  console.log(lines.join('\n'));
  if (process.env.GITHUB_ACTIONS === 'true') {
    for (const f of r.findings) console.log(`::error title=verify Hotfix::${f}`);
    if (r.verdict === 'UNKNOWN') console.log(`::warning title=verify Hotfix::UNKNOWN: ${r.unknown.join('; ')}`);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## verify Hotfix: ${r.verdict}\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n\nThe job result says that this report was produced; the verdict is above.\n`);
  }
  process.exit(0);
}
`````

## Draft of verify-hotfix.yml

`````
name: verify Hotfix
# release/CTL21, the GitHub adapter. The control compares two trees, before and after. Here the default branch is the before tree and the
# head of the pull request is the after tree. A detective check on plain pull_request: no token, no secret, no privileged trigger.
# Two jobs on two machines. `run Hotfix Cases` runs the Hotfix's Cases on both trees by the Run of Cases (kaal-testing run), as the
# repository's own CI runs its tests on a plain pull_request. `verify Hotfix` starts clean, checks out the base, the trusted judge,
# reads the after tree and the two runs as data, and judges. The body is data in a file, never script text.
# The job result says whether the report was produced; the verdict (PASS, FAIL or UNKNOWN) is in the report, the job summary and the annotations.
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
      - name: Fetch the proposed head and the default branch
        run: |
          git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"
          git fetch --no-tags origin "+refs/heads/${DEFAULT_BRANCH}:refs/remotes/origin/${DEFAULT_BRANCH}"
      - name: Prepare the Run of Cases of the base
        run: |
          npm ci --ignore-scripts
          npm run build -w kaal-core -w @kaihacksai/kaal-hosting
      - name: Run the Hotfix's Cases on the before and the after tree
        run: |
          J=engineering/release-management/05-src/hotfix/verify-hotfix.mjs
          test -f "$J" || { echo "no run: the judge is absent on the base"; exit 0; }
          mkdir -p "$RUNNER_TEMP/runs"
          printf '%s' "$PR_BODY" > "$RUNNER_TEMP/body.md"
          git worktree add --detach "$RUNNER_TEMP/before" "refs/remotes/origin/${DEFAULT_BRANCH}"
          git worktree add --detach "$RUNNER_TEMP/after" refs/remotes/pull/head
          for T in before after; do (cd "$RUNNER_TEMP/$T" && npm ci --ignore-scripts) || true; done
          for T in before after; do
            node "$J" run --on "$T" --before "$RUNNER_TEMP/before" --after "$RUNNER_TEMP/after" --body-file "$RUNNER_TEMP/body.md" --runner "$PWD/packages/kaal-testing/bin/kaal-testing.mjs" --out "$RUNNER_TEMP/runs/$T.json"
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
      PR_NUMBER: ${{ github.event.pull_request.number }}
      PR_BODY: ${{ github.event.pull_request.body }}
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
      - name: Fetch the proposed head as the after tree, to be read and never run
        run: |
          git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"
          git worktree add --detach "$RUNNER_TEMP/after" refs/remotes/pull/head
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
          node "$J" --after "$RUNNER_TEMP/after" --body-file "$RUNNER_TEMP/body.md" --before-run "$RUNNER_TEMP/runs/before.json" --after-run "$RUNNER_TEMP/runs/after.json"
`````
