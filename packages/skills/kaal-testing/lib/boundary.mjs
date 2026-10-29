// PLAN boundary integrity: what a realization's verdict on one concern owner's
// Boundary Declaration means as evidence (testing/C11, testing/C12).
//
// Testing interprets and never produces the verdict, and never authenticates it:
// it reads a verdict with the trust authority's attestation, bound to the
// verdict's anchor (testing/C19). Git's diff (realization A)
// and a trusted Seal (realization B) are Engineering's and Sealing's to compute;
// both report the same realization-neutral verdict, and Testing reads either one
// the same way. This module reads no host, runs no command and imports nothing.
//
// Three claims are kept apart, and none is promoted into another:
//   - byte integrity of the declared paths, which a trusted verdict can show;
//   - execution reproducibility, which no verdict shows;
//   - behavioural validity, which no verdict shows.
// An untouched boundary is "unchanged within the declaration", never met.

const CHANGES = ["added", "removed", "renamed", "content", "mode"];
const ANCHORS = ["plan-commit", "owner-review", "collector-record"];
const REALIZATIONS = ["git", "seal"];

/** What no verdict shows, whatever else holds. */
const ALWAYS = [
  { kind: "unknown", subject: "execution reproducibility", reason: "runtime, lockfile bytes, environment, flags, time and network are not compared" },
  { kind: "unknown", subject: "behavioural validity", reason: "clean RED, correctness and Outcome are not shown by unchanged bytes" },
];

/** A repository-relative path: forward slashes, no empty, `.` or `..` segment; a trailing `/` covers what lies beneath it. */
function repoPath(p) {
  if (typeof p !== "string" || p === "" || p.startsWith("/") || p.includes("\\")) return false;
  const segments = (p.endsWith("/") ? p.slice(0, -1) : p).split("/");
  return segments.every((s) => s !== "" && s !== "." && s !== "..");
}

/** Why a declaration does not read: an empty list when it reads. */
export function problems(declaration) {
  const d = declaration;
  if (d === null || typeof d !== "object" || Array.isArray(d)) return ["the declaration is not an object"];
  const found = [];
  if (typeof d.concern !== "string" || d.concern === "") found.push("the declaration names no concern");
  if (d.owner === null || typeof d.owner !== "object" || typeof d.owner.name !== "string" || d.owner.name === "") found.push("the declaration names no owner");
  if (!Array.isArray(d.paths) || d.paths.length === 0) found.push("the declaration lists no paths");
  else for (const p of d.paths) if (!repoPath(p)) found.push(`${JSON.stringify(p)} is not a repository-relative path inside the repository`);
  return found;
}

/** Whether `path` lies within one of the declared paths. */
const declared = (paths, path) => paths.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p));

/**
 * What `verdict` shows about `declaration`: `{ class, findings, unknowns }`.
 * The class is "verified failure", "unknown" or "unchanged within the
 * declaration". Findings and unknowns never name the realization, so the same
 * comparison reads the same from either one.
 */
export function interpret(declaration, verdict, attestation) {
  const findings = [];
  const unknowns = ALWAYS.map((u) => ({ ...u }));
  const unreadable = problems(declaration);
  if (unreadable.length) {
    for (const reason of unreadable) findings.push({ kind: "verified failure", subject: "the Boundary Declaration", reason });
    return { class: "verified failure", findings, unknowns };
  }
  const { concern, owner, paths } = declaration;
  const v = verdict !== null && typeof verdict === "object" && !Array.isArray(verdict) ? verdict : {};
  let trusted = true;
  let unread = false;
  const distrust = (subject, reason) => {
    trusted = false;
    unknowns.push({ kind: "unknown", subject, reason });
  };

  if (!REALIZATIONS.includes(v.realization)) distrust("the verdict", "it names no known realization");
  const anchor = v.anchor;
  if (anchor === null || typeof anchor !== "object" || !ANCHORS.includes(anchor.kind) || typeof anchor.ref !== "string" || anchor.ref === "")
    distrust("the anchor", "the baseline is not trusted: it is missing, or the candidate can write it");
  const a = attestation !== null && typeof attestation === "object" && !Array.isArray(attestation) ? attestation : {};
  if (typeof a.by !== "string" || a.by === "" || typeof anchor?.ref !== "string" || a.anchor !== anchor.ref)
    distrust("the attestation", "no trust authority attests this verdict against its anchor, and Testing does not authenticate a verdict");
  if (v.bytes !== "stored") distrust("content", "the verdict did not compare stored bytes, and a checkout can change working-tree bytes");
  if (v.mode !== true) unknowns.push({ kind: "unknown", subject: "file mode", reason: "the verdict did not compare mode" });

  if (!Array.isArray(v.changes)) distrust("the declared paths", "the verdict lists no changes");

  // A change is a verified failure only against a trusted baseline; against an
  // untrusted one it is reported, and stays unknown.
  for (const c of Array.isArray(v.changes) ? v.changes : []) {
    if (c === null || typeof c !== "object" || !repoPath(c.path)) {
      unread = true;
      unknowns.push({ kind: "unknown", subject: "the declared paths", reason: `the verdict lists a change that does not read: ${JSON.stringify(c)}` });
      continue;
    }
    if (!declared(paths, c.path)) continue;
    if (!CHANGES.includes(c.change)) {
      unread = true;
      unknowns.push({ kind: "unknown", subject: c.path, reason: `the verdict reports an unknown change ${JSON.stringify(c.change)}` });
    }
    else if (c.change === "mode" && v.mode !== true) continue;
    else if (!trusted) unknowns.push({ kind: "unknown", subject: c.path, reason: `reported ${c.change}, against a baseline that is not trusted` });
    else findings.push({ kind: "verified failure", concern, owner: owner.name, path: c.path, change: c.change });
  }

  if (v.outside !== undefined && !Array.isArray(v.outside)) {
    unread = true;
    unknowns.push({ kind: "unknown", subject: "the boundary's dependencies", reason: "the verdict's outside paths do not read" });
  }
  for (const path of Array.isArray(v.outside) ? v.outside : [])
    unknowns.push({ kind: "unknown", subject: path, reason: "the boundary depends on it outside the declaration" });

  const kind = findings.length ? "verified failure" : trusted && !unread ? "unchanged within the declaration" : "unknown";
  return { class: kind, findings, unknowns };
}
