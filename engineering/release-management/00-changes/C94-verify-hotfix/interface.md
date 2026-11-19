# C94 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of CTL21.md

`````
---
id: release/CTL21
title: verify Hotfix
description: It reveals whether a Hotfix traces to one recorded Defect and its reproducing Case, and whether the correction is evidenced.
type: detective
status: designed
has: [release/I10]
---
# release/CTL21 verify Hotfix

A detective control. `verify Hotfix` reads a Hotfix pull request, its base and its head as Git data, and judges two things apart. **Trace validity** is structural: the Defect chapter names exactly one KAAL Defect, that Defect is recorded on the base, it names a reproducing Case, and that Case exists on the base. The Case need not be in the diff, because an existing Case may already reproduce the Defect. **Correction evidence** is revision-bound: every reproducing Case the Defect records RED against the baseline and GREEN against the corrected revision. The control only reads that evidence, from a Run record that is bound to both revisions. It runs no code of the pull request. Missing evidence, or evidence bound to another revision, is UNKNOWN.

It says FAIL with the broken link when the trace is broken or a Case is not RED then GREEN, and UNKNOWN otherwise. It never says PASS: even RED then GREEN does not show that the Case corresponds to the Defect, that the correction is minimal or that the diff holds no unrelated work, and these are always listed as not judged. A diff across several capability roots is listed for the reviewer to justify, never failed, because one Defect may need several. It judges no route, base or admission, which belong to the envelope check (release/CTL11) and the Hotfix delivery path.

The verdict is the report, not the job result: the job succeeds when a report was produced and fails only when none could be, and the verdict is in the report, the job summary and annotations.

It runs on a plain `pull_request` into a `hotfix/` base, with no token, once wired in the Integrating station. It reads the base commit and the proposed head ref as Git data and runs the base's judge, never a file of the pull request, fork pull requests included. Making it a required check is another control with its own Owner decision.

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

A pull request check reads a Hotfix, its base and its head, as Git data and judges apart the trace and the evidence of its correction. The trace is valid when the Defect chapter names exactly one KAAL Defect `<capability>/D<n>`, the Defect is recorded on the base with at least one reproducing Case, each such Case exists on the base, and the diff is not empty; each broken link is a finding. The reproducing Cases need not be in the diff. A Defect may record several reproducing Cases and every one of them is read: the correction is verified only when each is RED against the baseline revision and GREEN against the corrected revision, read from evidence bound to those two revisions. RED at the baseline is expected and never a finding; a Case still RED on the corrected head, or GREEN at the baseline, is a finding for that Case, however many others are verified; missing or stale evidence for any Case, or GREEN at the head alone, leaves the correction UNKNOWN. A diff across more than one capability root is listed for the reviewer to justify and never fails. The verdict is FAIL with a finding and UNKNOWN without one: it is never PASS, and it always lists what stays unjudged: that the Case corresponds to the Defect, that the correction is minimal and that the diff holds no unrelated work. The check runs on `pull_request` with no token and no secret, reads the base at its exact commit and the head from `refs/pull/<number>/head`, runs only the judge of the base, reads the body as data and runs no code of the pull request. An unreadable ref or an absent judge is UNKNOWN or a failed step, never a pass. The verdict is the report and not the execution result: when a report is produced the job succeeds whatever the verdict, and it fails only when no report could be produced; the verdict is in the report, in the job summary and in annotations, so a reviewer tells an executed report from a broken check. Requiring the check, which would have to read the verdict and not the job result, is a separate control with its own Owner decision.
`````

## Draft of A66.md

`````
---
id: release/A66
title: verify-hotfix
addresses: [release/F71]
---
# release/A66 verify-hotfix

One module `05-src/hotfix/verify-hotfix.mjs` with a pure judge `judgeHotfixTrace(facts)`, a reader of the facts as Git data (`readFacts`, `defectsOf`) and a command line (`--base`, `--head`, `--body-file`, optional `--evidence`) whose first output word is the verdict, FAIL or UNKNOWN and never PASS, and whose exit status says only whether a report was produced: 0 when it was, whatever the verdict, 2 when it could not be (a missing argument); on GitHub Actions it also writes the report to the job summary and each finding as an annotation. The reader takes the Defect references from the Defect chapter of the body, the paths from `git diff` of the two revisions, a Defect record from `<home>/06-defects/D<n>-*.md` on the base (`<home>` is `packages/kaal-<capability>` or `engineering/<capability>`, the JSON `tests` list is its reproducing Cases) and the existence of a Case from its identity in a `.mjs` or `.ts` file on the base. The evidence is a JSON Run record keyed by Case identity, `{ "<Case>": { baseline: { rev, result }, head: { rev, result } } }`, with an entry for every reproducing Case, supplied by the caller; producing it is the Run of the Cases (`kaal-testing run`) and is not part of this architecture. One workflow source `05-src/wiring/workflows/verify-hotfix.yml` (on `pull_request` into `hotfix/**`, read-only, no secret, one job `verify Hotfix`) checks out the base commit with no stored credential, fetches the head from `refs/pull/<number>/head` into `refs/remotes/pull/head`, writes the body to a file from the environment and never into script text, and runs the base's judge. The module is the judge release/CTL21 declares. Its registration in the Integrating station is a later WIRE, and requiring the check is the Owner's later decision.
`````

## Draft of F16-sentence.md

`````
One Hotfix corrects one identified Defect, and the trace from the Hotfix to that Defect and its reproducing Case, with the evidence of the correction, is judged by release/CTL21 (release/F71) and not here. The interface guides the author and states no verification.
`````

## Draft of verify-hotfix.mjs

`````
// verify Hotfix (release/CTL21): does a HOTFIX trace to one recorded Defect and its reproducing Case?
// Two judgments are kept apart. Trace validity is structural and is read as Git data: the Defect is recorded on the
// base, it names a reproducing Case, and the Case exists on the base. Correction evidence is revision-bound: the Case
// RED against the baseline and GREEN against the corrected revision, for EVERY reproducing Case the Defect records.
// This control only reads that evidence; it runs no code of the pull request. It never answers PASS: the
// Case-to-Defect correspondence, minimality and unrelated work are for the reviewer and are always listed as not
// judged. The verdict is the report; the exit status only says whether a report was produced (see the command line).
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

export const NOT_JUDGED = [
  'whether the Case corresponds to the Defect is not judged: the review decides it',
  'whether the correction is minimal is not judged: the diff and the review decide it',
  'whether the diff holds no unrelated work is not judged: the diff and the review decide it',
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

// Facts as Git data. Everything about Defects and Cases is read from the base commit, the trusted state: a
// Defect and its reproducing Case must already be recorded there, so they cannot be introduced by the HOTFIX itself.
export function readFacts({ root = '.', base, head, body }) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  const rev = (r) => git('rev-parse', '--verify', '--quiet', `${r}^{commit}`).trim();
  const baseRev = rev(base);
  const headRev = rev(head);
  const paths = git('diff', '--name-only', `${baseRev}...${headRev}`).split('\n').filter(Boolean);
  const lookupDefect = (id) => {
    const [cap, d] = id.split('/');
    for (const home of [`packages/kaal-${cap}`, `engineering/${cap}`]) {
      let names = '';
      try { names = git('ls-tree', '--name-only', baseRev, `${home}/06-defects/`); } catch { continue; }
      const file = names.split('\n').find((n) => new RegExp(`/${d}-[^/]*\\.md$`).test(n));
      if (!file) continue;
      const json = /```json\n([\s\S]*?)\n```/.exec(git('show', `${baseRev}:${file}`))?.[1];
      try {
        const record = JSON.parse(json);
        return record.id === id ? { cases: Array.isArray(record.tests) ? record.tests : [] } : undefined;
      } catch { return undefined; }
    }
    return undefined;
  };
  const caseExists = (id) => {
    try { return git('grep', '-l', '-E', `${id.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}([^0-9]|$)`, baseRev, '--', '*.mjs', '*.ts').trim() !== ''; } catch { return false; }
  };
  return { baseRev, headRev, paths, defects: defectsOf(body), lookupDefect, caseExists };
}

// The command line. The verdict is the report and never an exit status: exit 0 means a report was produced, whatever
// the verdict (FAIL or UNKNOWN is its first word); exit 2 means no report could be produced (a missing argument).
// The evidence is a JSON Run record keyed by Case identity: { "<Case>": { baseline: { rev, result }, head: { rev, result } } }.
// On GitHub Actions the report is also written to the job summary and its findings are annotations, so a reviewer
// sees the verdict at the check without it being the job result.
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  if (!arg('--base') || !arg('--head') || !arg('--body-file')) {
    console.error('usage: verify-hotfix.mjs --base <rev> --head <rev> --body-file <file> [--root <dir>] [--evidence <file>]');
    process.exit(2);
  }
  let r;
  try {
    const facts = readFacts({ root: arg('--root') || '.', base: arg('--base'), head: arg('--head'), body: readFileSync(arg('--body-file'), 'utf8') });
    const file = arg('--evidence');
    const runs = file ? JSON.parse(readFileSync(file, 'utf8')) : {};
    r = judgeHotfixTrace({ ...facts, caseEvidence: (id) => runs[id] });
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
# It runs the judge of the base and reads the pull request only as Git data; the body is data in a file, never script text.
# The job result says whether the report was produced. The verdict (FAIL or UNKNOWN, never PASS) is in the report, the job summary and the annotations.
on:
  pull_request:
    branches: ['hotfix/**']
permissions:
  contents: read
jobs:
  verify-hotfix:
    name: verify Hotfix
    runs-on: ubuntu-latest
    env:
      BASE_SHA: ${{ github.event.pull_request.base.sha }}
      PR_NUMBER: ${{ github.event.pull_request.number }}
      PR_BODY: ${{ github.event.pull_request.body }}
    steps:
      - name: Check out the base, the trusted judge
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          ref: ${{ github.event.pull_request.base.sha }}
          fetch-depth: 0
          persist-credentials: false
      - name: Fetch the proposed head as Git data
        run: |
          git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"
      - name: Judge
        run: |
          J=engineering/release-management/05-src/hotfix/verify-hotfix.mjs
          test -f "$J" || { echo "UNKNOWN: the judge is absent on the base"; exit 2; }
          printf '%s' "$PR_BODY" > "$RUNNER_TEMP/body.md"
          node "$J" --base "$BASE_SHA" --head refs/remotes/pull/head --body-file "$RUNNER_TEMP/body.md"
`````
