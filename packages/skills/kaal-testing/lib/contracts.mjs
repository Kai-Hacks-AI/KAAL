// Contract evidence: what a capability's own mapping, from its authoritative
// statements to the tests it offers for them, shows in one run. Testing reads
// and classifies; the capability owns the mapping, its statements and its
// tests, and Testing invents none of them.
//
// Three things are kept apart, and none is promoted into another:
//   - mechanical facts: a pinned statement is present verbatim with its pinned
//     hash, a pinned test file still holds its pinned bytes, and a run's
//     per-test result for exactly that test in exactly those bytes;
//   - the inference that a test bears on a statement: a judgment, recorded with
//     its limits, which is "proposed" until a review record names its reviewer,
//     pull request and the exact hashes reviewed, and stale once they change;
//   - what stays unknown.
// A statement is never reported as met. At most its evidence is verified and
// its inference validated at review, within stated limits. There is no
// percentage, ratio or gate.
//
// A mapping is { owner: { kind, name, id }, statements: [{ source, quote,
// sha256, loop, evidence: [{ file, sha256, test: [suite, ..., test] }],
// inference, limits, review }] }. An obligation is identified by its source
// path and the sha256 of its exact quote; no other id is invented. Per-test
// results come from a run's captured evidence as { file, sha256, test, status }
// records; without them, every offered test is unknown, never passed.
import { sha256 } from "./acceptance.mjs";

/** The loops a mapping may offer evidence from. Implementation tests are a capability's internals, never contract evidence. */
export const LOOPS = ["conformance", "acceptance"];

const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * The problems that make `mapping` unreadable, as one-line messages; none
 * means it reads. `owner` is the claim's owner from the same directory.
 */
export function problems(mapping, owner) {
  const found = [];
  const isRef = (o) => o && typeof o.kind === "string" && typeof o.name === "string" && /^[0-9a-f]{64}$/.test(o.id ?? "");
  if (!isRef(mapping?.owner)) return ["the mapping names no owner { kind, name, id }"];
  if (!owner || mapping.owner.kind !== owner.kind || mapping.owner.name !== owner.name || mapping.owner.id !== owner.id) found.push("the mapping's owner is not the owner of the claim beside it");
  if (!Array.isArray(mapping.statements)) return [...found, "the mapping has no statements list"];
  mapping.statements.forEach((s, i) => {
    const at = `statement ${i + 1}`;
    if (typeof s?.source !== "string" || typeof s.quote !== "string" || s.quote === "" || !/^[0-9a-f]{64}$/.test(s.sha256 ?? "")) found.push(`${at}: needs a source, a nonempty quote and its sha256`);
    if (!LOOPS.includes(s?.loop)) found.push(`${at}: loop must be ${LOOPS.join(" or ")}`);
    if (!Array.isArray(s?.evidence)) found.push(`${at}: evidence must be a list`);
    else
      s.evidence.forEach((e, j) => {
        if (typeof e?.file !== "string" || !/^[0-9a-f]{64}$/.test(e.sha256 ?? "") || !Array.isArray(e.test) || e.test.length === 0 || !e.test.every((n) => typeof n === "string"))
          found.push(`${at}, evidence ${j + 1}: needs a file, its sha256 and a test path`);
      });
    if (s?.evidence?.length && (typeof s.inference !== "string" || s.inference === "" || typeof s.limits !== "string" || s.limits === "")) found.push(`${at}: offered evidence needs an inference and its limits`);
    if (s?.review !== null && s?.review !== undefined) {
      const r = s.review;
      if (typeof r.reviewer !== "string" || typeof r.pr !== "number" || typeof r.commit !== "string" || typeof r.statement !== "string" || !Array.isArray(r.evidence)) found.push(`${at}: a review records its reviewer, pr, commit and the statement and evidence hashes reviewed`);
    }
  });
  return found;
}

/** One offered test, against this tree's bytes and the run's results. */
async function offered(e, files, results) {
  const bytes = files[e.file];
  if (bytes === undefined) return { ...e, class: "unknown", reason: `${e.file} is missing` };
  const now = await sha256(bytes);
  if (now !== e.sha256) return { ...e, class: "unknown", reason: `${e.file} no longer holds the pinned bytes (stale)` };
  if (results === undefined) return { ...e, class: "unknown", reason: "this run's evidence carries no per-test results" };
  const runs = results.filter((r) => r.file === e.file && same(r.test, e.test));
  if (runs.length === 0) return { ...e, class: "unknown", reason: "the test did not run in this run" };
  if (runs.length > 1) return { ...e, class: "unknown", reason: `the test path names ${runs.length} results: ambiguous` };
  const [run] = runs;
  if (run.sha256 !== e.sha256) return { ...e, class: "unknown", reason: "the run executed other bytes of the file than the pinned ones" };
  if (run.status === "fail") return { ...e, class: "verified failure", reason: "the test failed in this run" };
  if (run.status !== "pass") return { ...e, class: "unknown", reason: `the test was ${run.status}, not run to a result` };
  return { ...e, class: "verified", reason: "the test passed in this run, in the pinned bytes" };
}

/**
 * Classify each statement of a readable `mapping` against `files`, this
 * tree's bytes by repository path ({ path: bytes }, a missing path absent),
 * and `results`, the run's per-test results, or undefined when the run's
 * evidence has none. Returns one entry per statement, in mapping order.
 */
export async function classify(mapping, files, results) {
  const out = [];
  for (const s of mapping.statements) {
    const base = { source: s.source, sha256: s.sha256, quote: s.quote, loop: s.loop };
    const text = files[s.source] === undefined ? undefined : Buffer.from(files[s.source]).toString("utf8");
    const pinned = (await sha256(Buffer.from(s.quote))) === s.sha256;
    if (!pinned) {
      out.push({ ...base, class: "unknown", reason: "the quote does not match its pinned sha256", evidence: [] });
      continue;
    }
    if (text === undefined || !text.includes(s.quote)) {
      out.push({ ...base, class: "unknown", reason: `the statement is no longer in ${s.source} (stale)`, evidence: [] });
      continue;
    }
    if (s.evidence.length === 0) {
      out.push({ ...base, class: "unknown", reason: "no evidence is offered for it", evidence: [] });
      continue;
    }
    const evidence = [];
    for (const e of s.evidence) evidence.push(await offered(e, files, results));
    const review = s.review ?? null;
    const reviewed = review !== null && review.statement === s.sha256 && same([...review.evidence].sort(), s.evidence.map((e) => e.sha256).sort());
    const inference = review === null ? "proposed, not reviewed" : reviewed ? `validated at review by ${review.reviewer} in #${review.pr} at ${review.commit}` : "reviewed at other hashes (stale)";
    const entry = { ...base, evidence, argument: s.inference, inference, limits: s.limits };
    if (evidence.some((e) => e.class === "verified failure")) out.push({ ...entry, class: "verified failure", reason: "an offered test failed" });
    else if (evidence.some((e) => e.class !== "verified")) out.push({ ...entry, class: "unknown", reason: "not every offered test is verified in this run" });
    else if (!reviewed) out.push({ ...entry, class: "unknown", reason: `evidence verified; inference ${inference}` });
    else out.push({ ...entry, class: "evidence verified, inference validated", reason: `evidence verified; inference ${inference}; limits: ${s.limits}` });
  }
  return out;
}
