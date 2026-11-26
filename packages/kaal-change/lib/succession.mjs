// What a Change Record states about the Changes it succeeds (change/C15).
//
// readSuccession(records, { pinOf }) reads the records it is given, each as
// { identity, text }, and returns the valid Edges and the findings. It is
// pure: it reads no file, no process and no network, and it names no host.
// Which records to read, and from where, is the caller's. The pin is the
// caller's derivation of a record's exact bytes (pinOf(text)); the reader
// compares it and never repairs it.
//
// It reports an Edge and a finding and nothing about delivery: a pin binds a
// revision, and whether the predecessor is delivered is judged elsewhere.

const IDENTITY = /^[a-z][a-z0-9-]*\/C[1-9][0-9]*$/;
const PIN = /^[0-9a-f]{64}$/;
const DERIVED = Object.freeze(["successors", "succeededBy", "precedes"]);
const OVERLAP = Object.freeze(["overlaps", "conflicts", "files"]);

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const unquote = (value) => value.trim().replace(/^(["'])(.*)\1$/, "$2");

/** The frontmatter of a record as its top-level keys and the `succeeds` items, or nothing when there is none. */
function front(text) {
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  if (lines[0] !== "---") return { keys: new Set(), items: [] };
  const end = lines.indexOf("---", 1);
  if (end < 0) return { keys: new Set(), items: [] };
  const keys = new Set();
  const items = [];
  let inside = false;
  for (const line of lines.slice(1, end)) {
    const top = /^([A-Za-z][A-Za-z0-9_-]*):(.*)$/.exec(line);
    if (top) {
      keys.add(top[1]);
      inside = top[1] === "succeeds";
      continue;
    }
    if (!inside) continue;
    const start = /^\s*-\s+([A-Za-z][A-Za-z0-9_-]*):(.*)$/.exec(line);
    if (start) {
      items.push({ [start[1]]: unquote(start[2]) });
      continue;
    }
    const more = /^\s+([A-Za-z][A-Za-z0-9_-]*):(.*)$/.exec(line);
    if (more && items.length) items[items.length - 1][more[1]] = unquote(more[2]);
  }
  return { keys, items };
}

/** The Changes in a cycle, each group sorted, groups sorted by their first Change (change/F12). */
function cycles(edges) {
  const out = new Map();
  for (const { from, to } of edges) out.set(from, [...(out.get(from) ?? []), to]);
  const nodes = [...new Set(edges.flatMap(({ from, to }) => [from, to]))].sort(compare);
  const reach = (start) => {
    const seen = new Set();
    const stack = [...(out.get(start) ?? [])];
    while (stack.length) {
      const next = stack.pop();
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(...(out.get(next) ?? []));
    }
    return seen;
  };
  const reaches = new Map(nodes.map((node) => [node, reach(node)]));
  const groups = [];
  const placed = new Set();
  for (const node of nodes) {
    if (placed.has(node) || !reaches.get(node).has(node)) continue;
    const group = nodes.filter((other) => reaches.get(node).has(other) && reaches.get(other).has(node));
    for (const member of group) placed.add(member);
    groups.push(group);
  }
  return groups;
}

/** Reads the succession the records state: the valid Edges, the findings and the derived successors. */
export function readSuccession(records, { pinOf }) {
  const given = [...records].sort((a, b) => compare(a.identity, b.identity));
  const byIdentity = new Map(given.map((record) => [record.identity, record]));
  const findings = [];
  const edges = [];

  for (const record of given) {
    const change = record.identity;
    const { keys, items } = front(record.text);
    for (const key of DERIVED) if (keys.has(key)) findings.push({ kind: "derived-stated", change, key });
    for (const key of OVERLAP) if (keys.has(key)) findings.push({ kind: "overlap-stated", change, key });

    const seen = new Set();
    for (const item of items) {
      const predecessor = item.change ?? "";
      const pinned = item.pin ?? "";
      if (!IDENTITY.test(predecessor) || !PIN.test(pinned)) {
        findings.push({ kind: "malformed", change, predecessor, reason: "an entry is { change: <namespace>/C<n>, pin: 64 lowercase hexadecimal, because }" });
        continue;
      }
      if (seen.has(predecessor)) {
        findings.push({ kind: "duplicate", change, predecessor });
        continue;
      }
      seen.add(predecessor);
      if (!item.because) {
        findings.push({ kind: "not-hard", change, predecessor });
        continue;
      }
      const present = byIdentity.get(predecessor);
      if (!present) {
        findings.push({ kind: "unresolved", change, predecessor });
        continue;
      }
      const now = pinOf(present.text);
      if (now !== pinned) {
        findings.push({ kind: "stale", change, predecessor, pinned, present: now });
        continue;
      }
      edges.push({ from: change, to: predecessor, pin: pinned, because: item.because });
    }
  }

  for (const changes of cycles(edges)) findings.push({ kind: "cycle", changes });

  return {
    findings,
    edges,
    successors: (identity) => edges.filter((edge) => edge.to === identity).map((edge) => edge.from).sort(compare),
  };
}
