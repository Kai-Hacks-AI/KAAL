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

A contextual pure Control judge consumes Testing's `kaal-testing/case-form@1` report (produced by `kaal-testing/form` over `kaal-testing/cases`) and an optional strict `subjectPolicy`, without parsing Case source files or redefining Case form rules. It preserves every checker finding and uncertainty verbatim. It requires positive boolean evidence that `catalog.complete === true` and `targets.checked === true`, and non-empty string entries in `files`; missing, non-boolean, or `false` completeness/target-check fields yield `UNKNOWN` (`applies: true`), never `PASS`. It says `FAIL` (`applies: true`) when any finding reports an authoritative defect (`no-id`, `missing-id`, `invalid-id`, `duplicate-id`, `absent-attribution`, `malformed-attribution`, `missing-run`, `non-callable-run`, `unknown-subject`, or non-exempt `stale-header`). It distinguishes `absent-attribution` from `malformed-attribution` and `missing-run` from `non-callable-run`. It says `UNKNOWN` (`applies: true`, never `PASS` and never `FAIL`) when the form report is absent or malformed, `catalog.complete !== true`, `targets.checked !== true`, `subjectPolicy` fails strict validation (`invalid-policy`), or any finding is `unverified-target`, `unchecked`, or `unreadable`. `FAIL` outranks `UNKNOWN` once policy is valid. Valid `subjectPolicy.exempt` rules apply only to explicit legacy header kinds (`stale-header`, `first-line`) naming an exact `file` and non-empty `reason` (never suppressing uncertainty, `missing-run`, `non-callable-run`, or attribution errors), and matched `{ finding, exemption }` pairs are retained in `policyExempt`. It says `PASS` with `applies: false` when zero Cases are in scope and completeness/target checks are positively `true`, and `PASS` with `applies: true` when all Cases pass form and attribution without uncertainty.
`````

## Draft of A59.md

`````
---
id: testing/A59
title: judge-verify-case
addresses: [testing/F173]
---
# testing/A59 judge-verify-case

The component is `engineering/testing/13-source/scripts/judge-verify-case.mjs`: a thin N+1 Control script that consumes `kaal-testing/case-form@1` JSON reports (never parsing JavaScript source, never defining regexes over Case files, and never harvesting subjects from `.md` files on its own). It exports `FORM_SCHEMA`, `EXEMPTIBLE_KINDS`, pure `judgeVerifyCase({ formReport, subjectPolicy })`, and a command line (`--report <case-form.json> [--policy <policy.json>]`, exiting `0` for `PASS`, `1` for `FAIL`, `2` for `UNKNOWN`).

Upstream producer chain (engineered in `packages/*`, delivered for N/N+1 use): `@kaihacksai/kaal-hosting` shared AST declaration inspection (reporting real top-level exports and their value/function classification) -> `kaal-testing/cases` (`readCase` / `collectCases`, `C74`) -> `kaal-testing/form` (`checkCaseForm` emitting `kaal-testing/case-form@1`, `C69` as amended for `C80`). Repository-specific configuration (`CTL1.md` and `subjectPolicy`) stays in `engineering/testing/14-operations/`. Wiring into pre-push githooks and CI workflows is deferred to subsequent Changes.
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

A detective control that is meant to become preventive. `verify Case` consumes Testing's `kaal-testing/case-form@1` report for Case files in repository context, requires positive `catalog.complete === true` and `targets.checked === true`, and reveals authoritative form and attribution failures (`no-id`/`missing-id`, `invalid-id`, `duplicate-id`, `absent-attribution`, `malformed-attribution`, `missing-run`, `non-callable-run`, `unknown-subject`, and non-exempt `stale-header`) while preserving checker uncertainty (`unverified-target`, `catalog-incomplete`, `targets-unchecked`, `unreadable`) as `UNKNOWN`, never as false `FAIL` or `PASS`.

It checks form and attribution only: it does not parse source independently, does not allow policy exemptions to suppress uncertainty or execution/attribution failures, and does not judge assertion strength, coverage sufficiency (`demand Cases`), test drift (`limit Test-Drift`), or execution (`observe Cases`). It has one Intent, `testing/I48`, which holds the details with `testing/F173` and `testing/A59`. It rolls out detective first: (1) observed locally against real trees with all findings classified; (2) advisory CI and pre-push feedback behind a feature flag while collecting `[fixture:2, real:1, provoked:1:fail]` evidence; (3) preventive only with explicit Owner authorization.
`````

## Draft of judge-verify-case.mjs

`````
#!/usr/bin/env node
// verify Case (testing/C80): thin contextual Control judge over Testing's `kaal-testing/case-form@1` report.
// Never parses Case source directly and never reinterprets structural facts; fails closed on incomplete reports or invalid policy.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FORM_SCHEMA = 'kaal-testing/case-form@1';

export const EXEMPTIBLE_KINDS = new Set(['stale-header', 'first-line']);

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

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function validatePolicy(policy) {
  if (policy === undefined) return { ok: true };
  if (!isPlainObject(policy)) return { ok: false, detail: 'subjectPolicy must be a plain object' };
  const topKeys = Object.keys(policy);
  if (topKeys.some((k) => k !== 'exempt')) {
    return { ok: false, detail: `subjectPolicy contains unsupported key(s): ${topKeys.filter((k) => k !== 'exempt').join(', ')}` };
  }
  if (policy.exempt === undefined) return { ok: true };
  if (!Array.isArray(policy.exempt)) return { ok: false, detail: 'subjectPolicy.exempt must be an array' };

  const allowedRuleKeys = new Set(['kind', 'file', 'reason', 'target']);
  for (let i = 0; i < policy.exempt.length; i += 1) {
    const rule = policy.exempt[i];
    if (!isPlainObject(rule)) return { ok: false, detail: `subjectPolicy.exempt[${i}] must be a plain object` };
    const keys = Object.keys(rule);
    if (keys.length === 0) return { ok: false, detail: `subjectPolicy.exempt[${i}] must not be empty` };
    const extra = keys.filter((k) => !allowedRuleKeys.has(k));
    if (extra.length) return { ok: false, detail: `subjectPolicy.exempt[${i}] has unknown key(s): ${extra.join(', ')}` };
    if (!isNonEmptyString(rule.kind) || !EXEMPTIBLE_KINDS.has(rule.kind)) {
      return { ok: false, detail: `subjectPolicy.exempt[${i}].kind must be one of ${[...EXEMPTIBLE_KINDS].join(', ')}` };
    }
    if (!isNonEmptyString(rule.file)) return { ok: false, detail: `subjectPolicy.exempt[${i}].file must be a non-empty string` };
    if (!isNonEmptyString(rule.reason)) return { ok: false, detail: `subjectPolicy.exempt[${i}].reason must be a non-empty string` };
    if (rule.target !== undefined && !isNonEmptyString(rule.target)) {
      return { ok: false, detail: `subjectPolicy.exempt[${i}].target must be a non-empty string when provided` };
    }
  }
  return { ok: true };
}

function validateReport(formReport) {
  if (!isPlainObject(formReport)) return 'formReport is missing or not an object';
  if (formReport.schema !== FORM_SCHEMA) return `expected schema ${FORM_SCHEMA}`;
  if (!Array.isArray(formReport.files) || !formReport.files.every(isNonEmptyString)) {
    return 'formReport.files must be an array of non-empty strings';
  }
  if (!Array.isArray(formReport.findings)) return 'formReport.findings must be an array';
  return null;
}

function matchExemption(finding, policy) {
  if (!policy || !Array.isArray(policy.exempt) || !EXEMPTIBLE_KINDS.has(finding.kind)) return null;
  for (const rule of policy.exempt) {
    if (rule.kind !== finding.kind) continue;
    if (rule.file !== finding.file) continue;
    if (rule.target !== undefined && rule.target !== finding.target) continue;
    return {
      kind: rule.kind,
      file: rule.file,
      ...(rule.target !== undefined ? { target: rule.target } : {}),
      reason: rule.reason,
    };
  }
  return null;
}

/**
 * Pure contextual Control judge over `{ formReport, subjectPolicy? }`.
 * Returns `{ verdict: 'PASS' | 'FAIL' | 'UNKNOWN', applies, message, findings, uncertain, policyExempt }`.
 */
export function judgeVerifyCase(input) {
  if (!isPlainObject(input)) {
    return { verdict: 'UNKNOWN', applies: true, message: 'cannot judge: input is missing or invalid', findings: [], uncertain: [{ kind: 'unreadable', detail: 'input is missing or invalid' }], policyExempt: [] };
  }
  const { formReport, subjectPolicy } = input;
  const reportProblem = validateReport(formReport);
  if (reportProblem) {
    return { verdict: 'UNKNOWN', applies: true, message: `cannot judge: ${reportProblem}`, findings: [], uncertain: [{ kind: 'unreadable', detail: reportProblem }], policyExempt: [] };
  }
  const policyCheck = validatePolicy(subjectPolicy);
  if (!policyCheck.ok) {
    return { verdict: 'UNKNOWN', applies: true, message: `cannot judge: invalid-policy: ${policyCheck.detail}`, findings: [], uncertain: [{ kind: 'invalid-policy', detail: policyCheck.detail }], policyExempt: [] };
  }

  const failures = [];
  const uncertain = [];
  const policyExempt = [];

  for (const rawFinding of formReport.findings) {
    if (!isPlainObject(rawFinding) || !isNonEmptyString(rawFinding.kind)) {
      uncertain.push({ kind: 'unreadable', detail: 'malformed finding entry in formReport' });
      continue;
    }
    const exemption = matchExemption(rawFinding, subjectPolicy);
    if (exemption) {
      policyExempt.push({ finding: rawFinding, exemption });
      continue;
    }
    if (FAIL_KINDS.has(rawFinding.kind)) failures.push(rawFinding);
    else if (UNKNOWN_KINDS.has(rawFinding.kind)) uncertain.push(rawFinding);
    else uncertain.push(rawFinding);
  }

  if (!isPlainObject(formReport.catalog) || formReport.catalog.complete !== true) {
    uncertain.push({ kind: 'catalog-incomplete', detail: 'formReport.catalog.complete must be strictly true' });
  }
  if (!isPlainObject(formReport.targets) || formReport.targets.checked !== true) {
    uncertain.push({ kind: 'targets-unchecked', detail: 'formReport.targets.checked must be strictly true' });
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
    r = { verdict: 'UNKNOWN', applies: true, message: `cannot judge: ${String(e.message)}`, findings: [], uncertain: [{ kind: 'unreadable', detail: String(e.message) }], policyExempt: [] };
  }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
