# C80 interface

Drafts of the files the DO places under `engineering/testing/`, following `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`. Each draft matches its placed file after the DO.

## Draft of I48.md

`````
---
id: testing/I48
title: every Case is well formed and explicitly attributed
---
# testing/I48 every Case is well formed and explicitly attributed

Contract: every Case file (`T<n>.test.mjs` or legacy `T<n>.red.mjs`) carries a valid scoped `id`, an explicit non-empty `tests` attribution pointing to real subjects, an exported callable `run` function, no duplicate `id`, and no stale line-1 header contradicting its exports, so that backward-link discovery and control evidence readers read the same truth everywhere. Source syntax extraction belongs to Hosting's shared inspection, Case interpretation and form rules belong to Testing (`kaal-testing/cases` and `kaal-testing/form`), and this capability's Control consumes those findings in repository context without re-parsing source or judging assertion sufficiency. Reason: an unattributed Case, a malformed export, an incomplete subject resolver turning unverified targets into false failures, or a stale header undermines trust in derived Suites and control evidence. Owner: testing.
`````

## Draft of F173.md

`````
---
id: testing/F173
title: verify-case
kind: functional
serves: [testing/I48]
---
# testing/F173 verify-case

A contextual pure Control judge consumes Testing's `kaal-testing/case-form@1` report (produced by `kaal-testing/form` over `kaal-testing/cases`) and an optional repository subject policy (`subjectPolicy`), without parsing Case source files or redefining Case form rules. It preserves every checker finding and uncertainty verbatim. It says `FAIL` (`applies: true`) when any finding reports an authoritative defect (`no-id`, `missing-id`, `invalid-id`, `duplicate-id`, `absent-attribution`, `malformed-attribution`, `missing-run`, `non-callable-run`, `unknown-subject`, or non-exempt `stale-header`). It distinguishes `absent-attribution` (missing or empty `tests`) from `malformed-attribution` (unparseable/non-literal `tests`), and never collapses them. It says `UNKNOWN` (`applies: true`, never `PASS` and never `FAIL`) when the form report is absent or invalid, `catalog.complete` is false, `targets.checked` is false when target checking is required, or any finding is `unverified-target` (an incomplete subject resolver cannot prove a broken reference). `FAIL` outranks `UNKNOWN`. Policy-exempt legacy items (explicitly named in `subjectPolicy`) are retained in `policyExempt` so nothing is hidden silently. It says `PASS` with `applies: false` when zero Cases are in scope and no errors exist, and `PASS` with `applies: true` when all Cases pass form and attribution without unverified uncertainty.
`````

## Draft of A59.md

`````
---
id: testing/A59
title: judge-verify-case
addresses: [testing/F173]
---
# testing/A59 judge-verify-case

The component is `engineering/testing/13-source/scripts/judge-verify-case.mjs`: a thin N+1 Control script that consumes `kaal-testing/case-form@1` JSON reports (never parsing JavaScript source, never defining regexes over Case files, and never harvesting subjects from `.md` files on its own). It exports pure `judgeVerifyCase({ formReport, subjectPolicy })` and a command line (`--report <case-form.json> [--policy <policy.json>]`, exiting `0` for `PASS`, `1` for `FAIL`, `2` for `UNKNOWN`).

Upstream producer chain (engineered in `packages/*`, delivered for N/N+1 use): `@kaihacksai/kaal-hosting` shared AST declaration inspection -> `kaal-testing/cases` (`readCase` / `collectCases`, `C74`) -> `kaal-testing/form` (`checkCaseForm` emitting `kaal-testing/case-form@1`, `C69`/`C70`). Repository-specific configuration (`CTL1.md` and `subjectPolicy`) stays in `engineering/testing/14-operations/`. Wiring into pre-push githooks and CI workflows is deferred to subsequent Changes.
`````

## Draft of CTL1.md

`````
---
id: testing/CTL1
title: verify Case
description: It reveals any Case file that is malformed, unattributed, duplicated, missing callable run, or carrying a stale header.
type: detective
status: designed
has: [testing/I48]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# testing/CTL1 verify Case

A detective control that is meant to become preventive. `verify Case` consumes Testing's `kaal-testing/case-form@1` report for Case files in repository context and reveals authoritative form and attribution failures (`no-id`/`missing-id`, `invalid-id`, `duplicate-id`, `absent-attribution`, `malformed-attribution`, `missing-run`, `non-callable-run`, `unknown-subject`, and non-exempt `stale-header`) while preserving checker uncertainty (`unverified-target`, `catalog.complete: false`, `targets.checked: false`) as `UNKNOWN`, never as false `FAIL` or `PASS`.

It checks form and attribution only: it does not parse source independently, does not claim an incomplete subject resolver proved a broken target, and does not judge assertion strength, coverage sufficiency (`demand Cases`), test drift (`limit Test-Drift`), or execution (`observe Cases`). It has one Intent, `testing/I48`, which holds the details with `testing/F173` and `testing/A59`. It rolls out detective first: (1) observed locally against real trees with all findings classified; (2) advisory CI and pre-push feedback behind a feature flag while collecting `[fixture:2, real:1, provoked:1:fail]` evidence; (3) preventive only with explicit Owner authorization.
`````

## Draft of judge-verify-case.mjs

`````
#!/usr/bin/env node
// verify Case (testing/C80): thin contextual Control judge over Testing's `kaal-testing/case-form@1` report.
// Never parses Case source directly and never reinterprets structural facts; preserves checker findings and uncertainty verbatim.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FORM_SCHEMA = 'kaal-testing/case-form@1';

const FAIL_KINDS = new Set([
  'no-id',
  'missing-id',
  'case-id',
  'id-differs',
  'invalid-id',
  'duplicate-id',
  'absent-attribution',
  'malformed-attribution',
  'missing-run',
  'non-callable-run',
  'unknown-subject',
  'target-missing',
  'stale-header',
  'first-line',
]);

const UNKNOWN_KINDS = new Set(['unverified-target', 'unchecked', 'unreadable']);

function isExempt(finding, policy) {
  if (!policy || !Array.isArray(policy.exempt)) return false;
  return policy.exempt.some(
    (rule) =>
      (!rule.kind || rule.kind === finding.kind) &&
      (!rule.file || rule.file === finding.file) &&
      (!rule.target || rule.target === finding.target),
  );
}

/**
 * Pure contextual Control judge over `{ formReport, subjectPolicy? }`.
 * Returns `{ verdict: 'PASS' | 'FAIL' | 'UNKNOWN', applies, message, findings, uncertain, policyExempt }`.
 */
export function judgeVerifyCase(input) {
  if (!input || typeof input !== 'object' || !input.formReport || typeof input.formReport !== 'object') {
    return { verdict: 'UNKNOWN', applies: true, message: 'cannot judge: formReport is missing or invalid', findings: [], uncertain: [], policyExempt: [] };
  }
  const { formReport, subjectPolicy } = input;
  if (formReport.schema !== FORM_SCHEMA || !Array.isArray(formReport.files) || !Array.isArray(formReport.findings)) {
    return { verdict: 'UNKNOWN', applies: true, message: `cannot judge: expected ${FORM_SCHEMA} report`, findings: [], uncertain: [], policyExempt: [] };
  }

  const failures = [];
  const uncertain = [];
  const policyExempt = [];

  for (const rawFinding of formReport.findings) {
    if (!rawFinding || typeof rawFinding.kind !== 'string') {
      uncertain.push({ kind: 'unreadable', detail: 'malformed finding entry in formReport' });
      continue;
    }
    if (isExempt(rawFinding, subjectPolicy)) {
      policyExempt.push(rawFinding);
      continue;
    }
    if (FAIL_KINDS.has(rawFinding.kind)) failures.push(rawFinding);
    else if (UNKNOWN_KINDS.has(rawFinding.kind)) uncertain.push(rawFinding);
    else uncertain.push(rawFinding);
  }

  if (formReport.catalog?.complete === false) {
    uncertain.push({ kind: 'catalog-incomplete', detail: 'case catalog reported complete: false' });
  }
  if (subjectPolicy?.requireCheckedTargets === true && formReport.targets?.checked === false) {
    uncertain.push({ kind: 'targets-unchecked', detail: 'subject targets were not checked against an authoritative set' });
  }

  if (failures.length) {
    const summary = failures.map((f) => `${f.file ?? '(unknown file)'} (${f.kind})`).join('; ');
    return { verdict: 'FAIL', applies: true, message: `case form: ${summary}`, findings: failures, uncertain, policyExempt };
  }
  if (uncertain.length) {
    const summary = uncertain.map((u) => `${u.file ?? u.kind} (${u.kind})`).join('; ');
    return { verdict: 'UNKNOWN', applies: true, message: `cannot judge: ${summary}`, findings: [], uncertain, policyExempt };
  }
  if (formReport.files.length === 0) {
    return { verdict: 'PASS', applies: false, message: 'no Case in scope to verify', findings: [], uncertain: [], policyExempt };
  }
  return { verdict: 'PASS', applies: true, message: `all ${formReport.files.length} Case(s) verified by form report`, findings: [], uncertain: [], policyExempt };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const reportPath = arg('--report');
    if (!reportPath || !existsSync(reportPath)) throw new Error('--report file is required and must exist');
    const formReport = JSON.parse(readFileSync(reportPath, 'utf8'));
    const policyPath = arg('--policy');
    const subjectPolicy = policyPath ? JSON.parse(readFileSync(policyPath, 'utf8')) : undefined;
    r = judgeVerifyCase({ formReport, subjectPolicy });
  } catch (e) {
    r = { verdict: 'UNKNOWN', applies: true, message: `cannot judge: ${String(e.message)}`, findings: [], uncertain: [], policyExempt: [] };
  }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
