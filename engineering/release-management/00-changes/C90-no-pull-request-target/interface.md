# C90 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists, the change-oriented Case (T1125) reads this folder.

## Draft of I50.md

`````
---
id: release/I50
title: no workflow uses pull_request_target
---
# release/I50 no workflow uses pull_request_target

Contract: no workflow under `.github/workflows` uses the trigger `pull_request_target`. A workflow that uses it runs with the base branch's token on an event a pull request starts, and GitHub blocks it by default in public repositories from 2 December 2026 unless an Actions policy allows it; the Owner rejected such an exception. Source: https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/. Reason: the repository must not depend on a trigger that is blocked by default and is the widest door a pull request has. Owner: release management. It is reached by a ratchet (release/CTL19): the number of workflows that use the trigger never rises, and a workflow that did not use it never starts to.
`````

## Draft of F67.md

`````
---
id: release/F67
title: verify-triggers
kind: functional
serves: [release/I50]
---
# release/F67 verify-triggers

A pull request check compares the workflows of its base with the workflows of its head, both read as Git data, and says FAIL when the number of workflows that use `pull_request_target` is higher on the head than on the base, or when a workflow that does not use it on the base uses it on the head (a new file, or an existing one that gains it). It says PASS otherwise, and UNKNOWN when the base or the head could not be read, which never passes. A workflow uses the trigger only when its `on:` key names it, in the scalar, list, map or block-list form; a mention in a comment or in a string does not count. The baseline is the base branch, never a list kept by hand. The check runs on `pull_request` with no token and no secret, and reads no pull request code except as Git data.
`````

## Draft of A62.md

`````
---
id: release/A62
title: verify-triggers
addresses: [release/F67]
---
# release/A62 verify-triggers

One module `05-src/triggers/verify-triggers.mjs` with a pure judge over two maps of workflow path to text (`judge({ base, head })`), a reader of a directory or of a Git ref (`readTree`, `read`) and a command line (`--base`, `--head`, exit 0 PASS, 1 FAIL, 2 UNKNOWN), and one workflow source `05-src/wiring/workflows/verify-triggers.yml` (on `pull_request`, `permissions` read only, no secret, one job `verify Triggers`). The module is the judge release/CTL19 declares. Its registration in the Integrating and Promoting stations is a later WIRE, and requiring the check in a ruleset is the Owner's later decision.
`````

## Draft of CTL19.md

`````
---
id: release/CTL19
title: verify Triggers
description: It reveals whether a change adds a workflow that uses pull_request_target, or raises their number.
type: detective
status: designed
has: [release/I50]
---
# release/CTL19 verify Triggers

A detective control and a ratchet. `verify Triggers` compares the workflows of the base with those of the head and says FAIL when the count of workflows that use `pull_request_target` rises or a workflow that did not use it on the base uses it on the head. The base branch is the baseline, so removing a use passes and the count only goes down. It says PASS when neither happens, and UNKNOWN when a side could not be read, which never passes. PASS is not an approval and not a merge decision.

It runs on a plain `pull_request` with no token, in the Integrating and Promoting stations once wired. It judges nothing else: it does not say whether a workflow is safe, only which trigger it names. Making it a required check is another control with its own Owner decision. When the count is 0 the target Case of this control asserts it, and the ratchet then keeps it at 0.

It has one Intent, release/I50.
`````

## Draft of verify-triggers.mjs

`````
// verify Triggers: does a change add or raise a workflow that uses pull_request_target?
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const TARGET = 'pull_request_target';

// A workflow uses the trigger only when its top-level `on:` names it. Comments and strings do not count.
export function uses(text) {
  const lines = text.split('\n').map((l) => l.replace(/\s+#.*$/, '').replace(/^#.*$/, ''));
  const at = lines.findIndex((l) => /^["']?on["']?\s*:/.test(l));
  if (at < 0) return false;
  const rest = lines[at].replace(/^["']?on["']?\s*:\s*/, '').trim();
  if (rest) return rest.replace(/[\[\]\s]/g, '').split(',').includes(TARGET);
  const block = [];
  for (const l of lines.slice(at + 1)) { if (l.trim() === '') continue; if (/^\S/.test(l)) break; block.push(l); }
  if (!block.length) return false;
  const indent = Math.min(...block.map((l) => l.match(/^ */)[0].length));
  return block.some((l) => l.match(/^ */)[0].length === indent && (new RegExp(`^ {${indent}}(-\\s*)?${TARGET}\\s*:?\\s*$`)).test(l));
}

export function judge({ base, head }) {
  if (!base || !head || !Object.keys(base).length) return { verdict: 'UNKNOWN', reasons: ['the base or the head workflows could not be read'] };
  const n = (m) => Object.keys(m).filter((p) => uses(m[p])).length;
  const reasons = [];
  for (const p of Object.keys(head)) if (uses(head[p]) && !(p in base && uses(base[p]))) reasons.push(`${p} uses ${TARGET} and did not on the base`);
  if (n(head) > n(base)) reasons.push(`the count of workflows that use ${TARGET} rises from ${n(base)} to ${n(head)}`);
  return { verdict: reasons.length ? 'FAIL' : 'PASS', reasons, base: n(base), head: n(head) };
}

export function readTree(dir) {
  const out = {};
  for (const f of readdirSync(dir)) if (/\.ya?ml$/.test(f)) out[`.github/workflows/${f}`] = readFileSync(join(dir, f), 'utf8');
  return out;
}

export function read(root, ref) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  const out = {};
  for (const p of git('ls-tree', '-r', '--name-only', ref, '--', '.github/workflows').split('\n').filter((x) => /\.ya?ml$/.test(x))) out[p] = git('show', `${ref}:${p}`);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => process.argv[process.argv.indexOf(k) + 1];
  let r;
  try { r = judge({ base: read(arg('--root') || '.', arg('--base')), head: read(arg('--root') || '.', arg('--head')) }); } catch (e) { r = { verdict: 'UNKNOWN', reasons: [String(e.message)] }; }
  console.log(`${r.verdict}${r.reasons.length ? `: ${r.reasons.join('; ')}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````

## Draft of verify-triggers.yml

`````
name: verify Triggers
# release/CTL19. A detective check on plain pull_request: no token, no secret, no pull_request_target (it is the rule it keeps).
on:
  pull_request:
    branches: ['**']
permissions:
  contents: read
jobs:
  verify-triggers:
    name: verify Triggers
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          fetch-depth: 0
          persist-credentials: false
      - run: node engineering/release-management/05-src/triggers/verify-triggers.mjs --base "origin/${{ github.base_ref }}" --head "${{ github.event.pull_request.head.sha }}"
`````

