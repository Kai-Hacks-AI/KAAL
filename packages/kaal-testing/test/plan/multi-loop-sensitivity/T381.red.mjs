// Case testing/T381 tests: testing/F154. Pilot sensitivity on lib/contracts.mjs via Behavioural RED + targeted contract mutants.
import assert from "node:assert/strict";
import { join } from "node:path";
import { PKG, readText, runContractsWithSource } from "./lib.mjs";

export const id = "testing/T381";
export const tests = ["testing/F154"];
export const title = "test/contracts.test.mjs fails on assertion against an inert stub and kills every targeted contract mutant of lib/contracts.mjs";

const INERT_STUB = `
export const LOOPS = [];
export function problems() { return []; }
export async function classify() { return []; }
`;

const MUTANTS = [
  [
    "owner kind mismatch accepted",
    "mapping.owner.kind !== owner.kind || mapping.owner.name !== owner.name || mapping.owner.id !== owner.id",
    "mapping.owner.name !== owner.name || mapping.owner.id !== owner.id",
  ],
  [
    "owner name mismatch accepted",
    "mapping.owner.kind !== owner.kind || mapping.owner.name !== owner.name || mapping.owner.id !== owner.id",
    "mapping.owner.kind !== owner.kind || mapping.owner.id !== owner.id",
  ],
  [
    "malformed owner accepted (isRef skipped)",
    'if (!isRef(mapping?.owner)) return ["the mapping names no owner { kind, name, id }"];',
    'if (false) return ["the mapping names no owner { kind, name, id }"];',
  ],
  [
    "non-array statements accepted",
    'if (!Array.isArray(mapping.statements)) return [...found, "the mapping has no statements list"];',
    'if (false) return [...found, "the mapping has no statements list"];',
  ],
  [
    "empty quote accepted",
    'typeof s.quote !== "string" || s.quote === ""',
    'typeof s.quote !== "string"',
  ],
  [
    "invalid statement sha256 accepted",
    '!/^[0-9a-f]{64}$/.test(s.sha256 ?? "")',
    "false",
  ],
  [
    "missing limits with offered evidence accepted",
    'typeof s.limits !== "string" || s.limits === ""',
    "false",
  ],
  [
    "invalid evidence sha256 accepted",
    '!/^[0-9a-f]{64}$/.test(e.sha256 ?? "")',
    "false",
  ],
  [
    "empty evidence test path accepted",
    '!Array.isArray(e.test) || e.test.length === 0 || !e.test.every((n) => typeof n === "string")',
    "!Array.isArray(e.test)",
  ],
  [
    "incomplete review missing pr/commit/hashes accepted",
    'typeof r.reviewer !== "string" || typeof r.pr !== "number" || typeof r.commit !== "string" || typeof r.statement !== "string" || !Array.isArray(r.evidence)',
    'typeof r.reviewer !== "string"',
  ],
  [
    "stale review statement hash treated as at-pins",
    "review.statement === s.sha256 && same(",
    "true && same(",
  ],
  [
    "permuted review evidence hash order falsely marked stale",
    "same([...review.evidence].sort(), s.evidence.map((e) => e.sha256).sort())",
    "same(review.evidence, s.evidence.map((e) => e.sha256))",
  ],
  [
    "crafted per-test status accepted",
    'return { ...e, class: "unknown", reason: UNATTESTED };',
    'return { ...e, class: "pass", reason: "accepted" };',
  ],
  [
    "missing source file treated as present",
    "if (text === undefined || !text.includes(s.quote))",
    "if (text !== undefined && !text.includes(s.quote))",
  ],
  [
    "parent traversal '..' in repoPath accepted",
    'seg !== "" && seg !== "." && seg !== ".."',
    'seg !== "" && seg !== "."',
  ],
];

export function run() {
  const original = readText(join(PKG, "lib/contracts.mjs"));
  const baseline = runContractsWithSource(original);
  assert.equal(baseline.exit, 0, `baseline contracts.test.mjs failed:\n${baseline.output}`);

  const inert = runContractsWithSource(INERT_STUB);
  assert.equal(inert.status, "killed", `inert stub did not produce behavioural RED (${inert.status}):\n${inert.output}`);

  const unkilled = [];
  for (const [name, from, to] of MUTANTS) {
    if (!original.includes(from)) throw new Error(`mutant pattern did not match lib/contracts.mjs: ${name}`);
    const mutated = original.replace(from, to);
    const result = runContractsWithSource(mutated);
    if (result.status !== "killed") unkilled.push(`${name} (${result.status})`);
  }
  assert.deepEqual(unkilled, [], `mutants not killed by ERR_ASSERTION: ${unkilled.join("; ")}`);
}
