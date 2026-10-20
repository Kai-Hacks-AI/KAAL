// Contract evidence: what a capability's own mapping, from its authoritative
// statements to the tests it offers for them, shows in one run. Testing reads
// and classifies; the capability owns the mapping, its statements and its
// tests, and Testing invents none of them.
//
// Three things are kept apart, and none is promoted into another:
//   - mechanical facts this tree shows: a pinned statement is present verbatim
//     with its pinned hash, and a pinned test file still holds its pinned bytes;
//   - the inference that a test bears on a statement: a judgment, recorded with
//     its limits. The mapping may declare a review of it, but a mapping is its
//     owner's own claim, so a declared review is reported as declared, never as
//     validated: nothing here verifies who reviewed what;
//   - what stays unknown.
//
// No per-test result is accepted. A record that names a file, its hash, a test
// path and a status proves nothing about a run: anyone can write one. Until
// per-test results come from a runner execution with established provenance,
// every offered test is unknown, with that reason, whatever any file claims.
// So a statement is never reported as met, nor its evidence as verified. There
// is no percentage, ratio or gate.
//
// A mapping is { owner: { kind, name, id }, statements: [{ source, quote,
// sha256, loop, evidence: [{ file, sha256, test: [suite, ..., test] }],
// inference, limits, review }] }. An obligation is identified by its source
// path and the sha256 of its exact quote; no other id is invented.
import { sha256 } from "./acceptance.mjs";

/** The loops a mapping may offer evidence from. Implementation tests are a capability's internals, never contract evidence. */
export const LOOPS = ["conformance", "acceptance"];

const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * A mapping's path is written relative to the repository root with forward
 * slashes and no empty, `.` or `..` segment. This is the mapping's syntax only:
 * it does not establish that the path resolves inside the repository, since a
 * link can still lead out. Containment is Hosting's to decide, and whoever
 * reads the path must ask it first.
 */
const repoPath = (p) => typeof p === "string" && !p.includes("\\") && p.split("/").every((seg) => seg !== "" && seg !== "." && seg !== "..");

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
    if (typeof s?.source === "string" && !repoPath(s.source)) found.push(`${at}: source must be a repository-relative path`);
    if (!LOOPS.includes(s?.loop)) found.push(`${at}: loop must be ${LOOPS.join(" or ")}`);
    if (!Array.isArray(s?.evidence)) found.push(`${at}: evidence must be a list`);
    else
      s.evidence.forEach((e, j) => {
        if (typeof e?.file !== "string" || !/^[0-9a-f]{64}$/.test(e.sha256 ?? "") || !Array.isArray(e.test) || e.test.length === 0 || !e.test.every((n) => typeof n === "string"))
          found.push(`${at}, evidence ${j + 1}: needs a file, its sha256 and a test path`);
        else if (!repoPath(e.file)) found.push(`${at}, evidence ${j + 1}: file must be a repository-relative path`);
      });
    if (s?.evidence?.length && (typeof s.inference !== "string" || s.inference === "" || typeof s.limits !== "string" || s.limits === "")) found.push(`${at}: offered evidence needs an inference and its limits`);
    if (s?.review !== null && s?.review !== undefined) {
      const r = s.review;
      if (typeof r.reviewer !== "string" || typeof r.pr !== "number" || typeof r.commit !== "string" || typeof r.statement !== "string" || !Array.isArray(r.evidence)) found.push(`${at}: a review records its reviewer, pr, commit and the statement and evidence hashes reviewed`);
    }
  });
  return found;
}

/** Why an offered test is unknown in this tree: per-test results are never taken from a record. */
const UNATTESTED = "no per-test result is accepted: a result record is a claim, and none comes from a runner execution with established provenance";

/** One offered test, against this tree's bytes. */
async function offered(e, files) {
  const bytes = files[e.file];
  if (bytes === undefined) return { ...e, class: "unknown", reason: `${e.file} is missing` };
  if ((await sha256(bytes)) !== e.sha256) return { ...e, class: "unknown", reason: `${e.file} no longer holds the pinned bytes (stale)` };
  return { ...e, class: "unknown", reason: UNATTESTED };
}

/** What the mapping says of its own review: declared, never validated here. */
function declared(s) {
  const review = s.review ?? null;
  if (review === null) return "proposed, not reviewed";
  const atPins = review.statement === s.sha256 && same([...review.evidence].sort(), s.evidence.map((e) => e.sha256).sort());
  return atPins ? `review declared by the mapping (${review.reviewer}, #${review.pr} at ${review.commit}), not verified` : "review declared at other hashes (stale)";
}

/**
 * Classify each statement of a readable `mapping` against `files`, this
 * tree's bytes by repository path ({ path: bytes }, a missing path absent).
 * Returns one entry per statement, in mapping order. Every statement is
 * unknown, with its reason: there is no input through which a claimed test
 * result could verify one.
 */
export async function classify(mapping, files) {
  const out = [];
  for (const s of mapping.statements) {
    const base = { source: s.source, sha256: s.sha256, quote: s.quote, loop: s.loop };
    const text = files[s.source] === undefined ? undefined : Buffer.from(files[s.source]).toString("utf8");
    if ((await sha256(Buffer.from(s.quote))) !== s.sha256) {
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
    for (const e of s.evidence) evidence.push(await offered(e, files));
    const inference = declared(s);
    out.push({ ...base, evidence, argument: s.inference, inference, limits: s.limits, class: "unknown", reason: `no offered test is verified; inference ${inference}` });
  }
  return out;
}
