// Capability-owned file attribution: which capability owns each inventoried
// file, as each capability declares it. A capability claims its files in an
// ownership file inside its own tree, found by the file's name: there is no
// central list. A claim names its capability by the exact { name, id } of its
// Capability Node and lists repository-relative path patterns. Which Capability
// Nodes are admitted is the caller's answer, from Core; this decides only how
// claims read, resolve and attribute.
//
// A file claimed by exactly one resolved capability is that capability's. A
// file claimed by none is unassigned. A file claimed by two or more is an
// architectural concern naming every claimant: it is not attributed by
// precedence, proximity or splitting, and stays unassigned until the claims
// are fixed. A claim that does not read or does not resolve attributes nothing.
// A pattern that matches no inventoried file is reported as a stale claim.
// Repository lines always equal the singly attributed lines plus the
// unassigned lines.

/** The name of a capability's ownership file, wherever it is in its tree. */
export const CLAIM_FILE = "ownership.kaal.json";

const ID = /^[0-9a-f]{64}$/;
const utf8 = new TextDecoder("utf-8", { fatal: true });
const byPath = (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
const byRef = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const sum = (entries) => entries.reduce((n, e) => n + e.lines, 0);

/** Whether `path` is an ownership file: its last segment is CLAIM_FILE. */
export function isClaimFile(path) {
  return path === CLAIM_FILE || path.endsWith(`/${CLAIM_FILE}`);
}

/**
 * Why `pattern` is not a path pattern, or undefined when it is. A pattern is a
 * repository-relative file path, or a directory path ending in `/` that covers
 * everything beneath it. Its characters are literal: there are no wildcards.
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
 * capability: { name, id }, paths }, or to { finding } when it does not read.
 */
export function readClaim(path, bytes) {
  const fail = (why) => ({ finding: { kind: "verified failure", subject: path, evidence: `ownership file ${why}` } });
  let data;
  try {
    data = JSON.parse(utf8.decode(bytes));
  } catch {
    return fail("is not UTF-8 JSON");
  }
  const capability = data?.capability;
  if (typeof capability !== "object" || capability === null || Object.keys(capability).sort().join() !== "id,name")
    return fail("does not name its capability by exactly { name, id }");
  if (typeof capability.name !== "string" || capability.name === "" || typeof capability.id !== "string" || !ID.test(capability.id))
    return fail("names its capability with a name that is not a non-empty string or an id that is not a lowercase hex SHA-256");
  if (!Array.isArray(data.paths) || data.paths.length === 0) return fail("lists no path patterns");
  for (const pattern of data.paths) {
    const why = invalid(pattern);
    if (why) return fail(`lists ${JSON.stringify(pattern)}, which ${why}`);
  }
  if (Object.keys(data).sort().join() !== "capability,paths") return fail("holds keys other than capability and paths");
  return { claim: { path, capability: { name: capability.name, id: capability.id }, paths: [...data.paths] } };
}

/**
 * Attribute `inventory` (from kaal-testing/inventory) to the capabilities
 * whose ownership files are among `claimFiles`, an array of { path, bytes },
 * given the admitted Capability Nodes `capabilities`, an array of { name, id }.
 * Lines are the inventory's: only text files carry them, so binary and
 * excluded files are attributed with none.
 */
export function attribute(inventory, claimFiles, capabilities) {
  const findings = [];
  const admitted = new Map(capabilities.map((c) => [c.id, c]));
  const claims = [];
  for (const { path, bytes } of [...claimFiles].sort(byPath)) {
    const read = readClaim(path, bytes);
    if (read.finding) {
      findings.push(read.finding);
      continue;
    }
    const node = admitted.get(read.claim.capability.id);
    const { name, id } = read.claim.capability;
    if (!node) findings.push({ kind: "verified failure", subject: path, evidence: `claims for ${name} (${id}), which is no admitted Capability Node: its paths stay unassigned` });
    else if (node.name !== name) findings.push({ kind: "verified failure", subject: path, evidence: `claims for ${name}, but Capability Node ${id} is named ${node.name}: its paths stay unassigned` });
    else claims.push(read.claim);
  }

  const entries = inventory.entries.map((e) => ({ path: e.path, lines: e.kind === "text" ? e.lines : 0 }));
  for (const claim of claims) {
    for (const pattern of claim.paths) {
      if (!entries.some((e) => matches(pattern, e.path)))
        findings.push({ kind: "potential defect", subject: claim.path, evidence: `pattern ${JSON.stringify(pattern)} matches no inventoried file: a stale claim` });
    }
  }

  const owners = new Map();
  const unassigned = [];
  const conflicts = [];
  for (const entry of entries) {
    const claimants = [...new Map(claims.filter((c) => c.paths.some((p) => matches(p, entry.path))).map((c) => [c.capability.id, c.capability])).values()].sort(byRef);
    if (claimants.length === 1) {
      const [owner] = claimants;
      if (!owners.has(owner.id)) owners.set(owner.id, { ...owner, entries: [] });
      owners.get(owner.id).entries.push(entry);
    } else if (claimants.length === 0) {
      unassigned.push({ ...entry, reason: "unclaimed" });
    } else {
      unassigned.push({ ...entry, reason: "conflicting claims" });
      conflicts.push({ ...entry, claimants });
      findings.push({ kind: "architectural concern", subject: entry.path, evidence: `claimed by ${claimants.map((c) => `${c.name} (${c.id})`).join(" and ")}: not attributed until the claims are fixed` });
    }
  }

  const attributed = [...owners.values()].sort(byRef).map(({ name, id, entries }) => ({ name, id, files: entries.length, lines: sum(entries), entries }));
  const result = {
    metric: inventory.metric,
    lines: inventory.lines,
    capabilities: attributed,
    unassigned: { files: unassigned.length, lines: sum(unassigned), entries: unassigned },
    conflicts: { files: conflicts.length, lines: sum(conflicts), entries: conflicts },
    findings,
  };
  const accounted = sum(attributed) + result.unassigned.lines;
  if (accounted !== inventory.lines) throw new Error(`attribution does not account for the inventory: ${accounted} lines attributed or unassigned, ${inventory.lines} inventoried`);
  return result;
}
