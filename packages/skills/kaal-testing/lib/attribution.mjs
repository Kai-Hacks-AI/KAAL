// CASE-owned file attribution: which Capability, Agent, Skill or Extension owns
// each inventoried file, as each declares it. An owner claims its files in an
// ownership file inside its own tree, found by the file's name: there is no
// central list. A claim names its owner by the exact { name, id } of the owner's
// own Node, typed by one of Core's four CASE kinds, and lists repository-
// relative path patterns. Which CASE Nodes are admitted, and of which kind, is
// the caller's answer, from Core; this decides only how claims read, resolve
// and attribute, the same way for every kind, and reclassifies none.
//
// A file claimed by exactly one resolved owner is that owner's. A file claimed
// by none is unassigned. A file claimed by two or more is an architectural
// concern naming every claimant: it is not attributed by precedence, proximity
// or splitting, and stays unassigned until the claims are fixed. A claim that
// does not read or does not resolve attributes nothing. A pattern that matches
// no inventoried file is reported as a stale claim. Repository lines always
// equal the singly attributed lines plus the unassigned lines. Ownership is
// structural: it says which responsibility a file belongs to, not who is
// accountable for it or who verified it.

/** The name of an owner's ownership file, wherever it is in its tree. */
export const CLAIM_FILE = "ownership.kaal.json";

/** The four CASE kinds an owner's Node may be typed by, as Core names them. */
export const KINDS = ["capability", "agent", "skill", "extension"];

const ID = /^[0-9a-f]{64}$/;
const utf8 = new TextDecoder("utf-8", { fatal: true });
const byPath = (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
const byRef = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const sum = (entries) => entries.reduce((n, e) => n + e.lines, 0);
const label = ({ kind, name, id }) => `${kind} ${name} (${id})`;

/** Whether `path` is an ownership file: its last segment is CLAIM_FILE. */
export function isClaimFile(path) {
  return path === CLAIM_FILE || path.endsWith(`/${CLAIM_FILE}`);
}

/** The scope an ownership file at `path` declares: the directory holding it, as a pattern ("" for the root). */
export function scopeOf(path) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
}

/**
 * Why `pattern` is not a path pattern, or undefined when it is. A pattern is a
 * repository-relative file path, or a directory path ending in `/` that covers
 * everything beneath it. Its characters are literal: there are no wildcards.
 * These are the declaration's own strings, compared as written: which files
 * exist, and how a host names them, is the caller's answer through Hosting.
 */
function invalid(pattern) {
  if (typeof pattern !== "string" || pattern === "") return "is not a non-empty string";
  const segments = (pattern.endsWith("/") ? pattern.slice(0, -1) : pattern).split("/");
  if (segments.some((s) => s === "" || s === "." || s === "..") || pattern.includes("\\")) return "is not a repository-relative path";
  return undefined;
}

const matches = (pattern, path) => (pattern.endsWith("/") ? path.startsWith(pattern) : path === pattern);

/**
 * Read the ownership file at `path`. Resolves to { claim } with { path,
 * owner: { kind, name, id }, paths }, or to { finding } when it does not read.
 * Every pattern must lie within the file's scope, the directory holding it: an
 * owner claims only within its own tree.
 */
export function readClaim(path, bytes) {
  const fail = (why) => ({ finding: { kind: "verified failure", subject: path, evidence: `ownership file ${why}` } });
  let data;
  try {
    data = JSON.parse(utf8.decode(bytes));
  } catch {
    return fail("is not UTF-8 JSON");
  }
  if (typeof data !== "object" || data === null || Object.keys(data).sort().join() !== "owner,paths") return fail("does not hold exactly owner and paths");
  const owner = data.owner;
  if (typeof owner !== "object" || owner === null || Object.keys(owner).sort().join() !== "id,kind,name") return fail("does not name its owner by exactly { kind, name, id }");
  if (!KINDS.includes(owner.kind)) return fail(`names its owner's kind ${JSON.stringify(owner.kind)}, which is not one of ${KINDS.join(", ")}`);
  if (typeof owner.name !== "string" || owner.name === "" || typeof owner.id !== "string" || !ID.test(owner.id))
    return fail("names its owner with a name that is not a non-empty string or an id that is not a lowercase hex SHA-256");
  if (!Array.isArray(data.paths) || data.paths.length === 0) return fail("lists no path patterns");
  const scope = scopeOf(path);
  for (const pattern of data.paths) {
    const why = invalid(pattern);
    if (why) return fail(`lists ${JSON.stringify(pattern)}, which ${why}`);
    if (!pattern.startsWith(scope)) return fail(`lists ${JSON.stringify(pattern)}, which is outside its scope ${scope}`);
  }
  return { claim: { path, owner: { kind: owner.kind, name: owner.name, id: owner.id }, paths: [...data.paths] } };
}

/**
 * Attribute `inventory` (from kaal-testing/inventory) to the owners whose
 * ownership files are among `claimFiles`, an array of { path, bytes }, given
 * the admitted CASE Nodes `owners`, an array of { kind, name, id } with kind
 * one of KINDS, as Core types them. Lines are the inventory's: only text files
 * carry them, so binary and excluded files are attributed with none.
 */
export function attribute(inventory, claimFiles, owners) {
  const findings = [];
  for (const o of owners) if (!KINDS.includes(o.kind)) throw new Error(`owner ${o.name} (${o.id}) has kind ${o.kind}, which is not a CASE kind`);
  const admitted = new Map(owners.map((o) => [o.id, o]));
  const claims = [];
  for (const { path, bytes } of [...claimFiles].sort(byPath)) {
    const read = readClaim(path, bytes);
    if (read.finding) {
      findings.push(read.finding);
      continue;
    }
    const declared = read.claim.owner;
    const node = admitted.get(declared.id);
    const unresolved = (why) => findings.push({ kind: "verified failure", subject: path, evidence: `claims for ${label(declared)}, ${why}: its paths stay unassigned` });
    if (!node) unresolved("which is no admitted Capability, Agent, Skill or Extension Node");
    else if (node.name !== declared.name) unresolved(`but that Node is named ${node.name}`);
    else if (node.kind !== declared.kind) unresolved(`but Core types that Node as a ${node.kind}`);
    else claims.push(read.claim);
  }

  const entries = inventory.entries.map((e) => ({ path: e.path, lines: e.kind === "text" ? e.lines : 0 }));
  for (const claim of claims) {
    for (const pattern of claim.paths) {
      if (!entries.some((e) => matches(pattern, e.path)))
        findings.push({ kind: "potential defect", subject: claim.path, evidence: `pattern ${JSON.stringify(pattern)} matches no inventoried file: a stale claim` });
    }
  }

  const owned = new Map();
  const unassigned = [];
  const conflicts = [];
  for (const entry of entries) {
    const claimants = [...new Map(claims.filter((c) => c.paths.some((p) => matches(p, entry.path))).map((c) => [c.owner.id, c.owner])).values()].sort(byRef);
    if (claimants.length === 1) {
      const [owner] = claimants;
      if (!owned.has(owner.id)) owned.set(owner.id, { ...owner, entries: [] });
      owned.get(owner.id).entries.push(entry);
    } else if (claimants.length === 0) {
      unassigned.push({ ...entry, reason: "unclaimed" });
    } else {
      unassigned.push({ ...entry, reason: "conflicting claims" });
      conflicts.push({ ...entry, claimants });
      findings.push({ kind: "architectural concern", subject: entry.path, evidence: `claimed by ${claimants.map(label).join(" and ")}: not attributed until the claims are fixed` });
    }
  }

  const attributed = [...owned.values()].sort(byRef).map(({ kind, name, id, entries }) => ({ kind, name, id, files: entries.length, lines: sum(entries), entries }));
  const result = {
    metric: inventory.metric,
    lines: inventory.lines,
    owners: attributed,
    unassigned: { files: unassigned.length, lines: sum(unassigned), entries: unassigned },
    conflicts: { files: conflicts.length, lines: sum(conflicts), entries: conflicts },
    findings,
  };
  const accounted = sum(attributed) + result.unassigned.lines;
  if (accounted !== inventory.lines) throw new Error(`attribution does not account for the inventory: ${accounted} lines attributed or unassigned, ${inventory.lines} inventoried`);
  return result;
}
