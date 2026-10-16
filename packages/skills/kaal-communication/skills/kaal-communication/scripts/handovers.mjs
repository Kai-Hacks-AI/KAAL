// Handover records, judged from a host-independent representation: the
// Engine's files and the record files, each keyed by `/`-separated relative
// path. Core decides identity, typing and admission; this module only reads
// what an admitted record says. It touches no host.
import { evaluate, foundation, identify } from "kaal-core";

const HANDOVER = "Handover";

const SECTIONS = ["From", "To", "Request", "Evidence", "Answers", "Outcome"];

/** The body sections of a record, by heading. Text under any other heading is for people and is not read. */
export function sections(text) {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, "");
  const out = {};
  let current;
  for (const line of body.split("\n")) {
    const heading = /^## (.+?)\s*$/.exec(line);
    if (heading) {
      current = SECTIONS.includes(heading[1]) ? heading[1] : undefined;
      if (current) out[current] = [];
    } else if (current) out[current].push(line);
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.join("\n").trim()]));
}

/** The reference in an Answers section: exactly `- name: <name>` then `- id: <64 hex>`, nothing else. */
function answered(text) {
  const m = /^- name: (\S(?:[^\n]*\S)?)\n- id: ([0-9a-f]{64})$/.exec(text);
  return m ? { name: m[1], id: m[2] } : undefined;
}

/**
 * Judge Handover records against an Engine.
 *
 * A record is a Node typed by a Handover Definition the Engine holds (a Node
 * named Handover, typed by Core's KAAL Definition), admitted together with
 * the Engine. It is open when no other record answers it. A record that is
 * not admitted, misses a required section, or answers no admitted record is
 * reported as a problem, never silently dropped.
 *
 * @param {Record<string, Uint8Array>} engine the Engine's files
 * @param {Record<string, Uint8Array>} records the record files
 */
export function judge(engine, records) {
  const problems = [];
  const definition = foundation().definition;
  const handovers = new Set(
    evaluate(engine)
      .named(HANDOVER)
      .filter((n) => n.type?.id === definition.id)
      .map((n) => n.id),
  );
  if (handovers.size === 0) {
    problems.push(`the Engine holds no ${HANDOVER} Definition: register kaal-communication first`);
    return { open: [], answered: [], problems };
  }
  const prefixed = Object.fromEntries(Object.entries(records).map(([p, b]) => [`records/${p}`, b]));
  const combined = evaluate({ ...engine, ...prefixed });
  for (const r of combined.rejected) if (r.path.startsWith("records/")) problems.push(`${r.path.slice(8)}: ${r.reason}`);

  const list = [];
  for (const [path, bytes] of Object.entries(records).sort(([a], [b]) => (a < b ? -1 : 1))) {
    let identity;
    try {
      identity = identify(bytes);
    } catch {
      continue; // not a Node: either reported above or not claiming to be one
    }
    if (identity.type?.name !== HANDOVER || !handovers.has(identity.type.id)) {
      problems.push(`${path}: not typed by a ${HANDOVER} Definition the Engine holds`);
      continue;
    }
    if (!combined.nodes.some((n) => n.id === identity.id)) continue;
    const s = sections(Buffer.from(bytes).toString("utf8"));
    const missing = ["From", "To", s.Answers === undefined ? "Request" : "Outcome"].filter((k) => !s[k]);
    if (missing.length) problems.push(`${path}: missing ${missing.join(", ")}`);
    const answers = s.Answers === undefined ? undefined : answered(s.Answers);
    if (s.Answers !== undefined && !answers) problems.push(`${path}: Answers holds exactly "- name: <name>" and "- id: <id>"`);
    list.push({ path, id: identity.id, name: identity.name, from: s.From ?? "", to: s.To ?? "", request: s.Request ?? "", evidence: s.Evidence ?? "", answering: s.Answers !== undefined, answers, outcome: s.Outcome });
  }

  const byId = new Map(list.map((r) => [r.id, r]));
  const closed = new Set();
  for (const r of list) {
    if (!r.answers) continue;
    const target = byId.get(r.answers.id);
    if (!target || target.name !== r.answers.name) problems.push(`${r.path}: answers ${r.answers.name} (${r.answers.id}), which is not an admitted record`);
    else closed.add(target.id);
  }
  return {
    open: list.filter((r) => !r.answering && !closed.has(r.id)),
    answered: list.filter((r) => !r.answering && closed.has(r.id)),
    problems,
  };
}
