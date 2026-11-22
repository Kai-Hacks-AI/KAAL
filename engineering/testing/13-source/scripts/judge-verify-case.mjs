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
