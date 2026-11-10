// release-management/C8 DO (verify Envelope, F19): the pure judgment over a pull request's title and body (PLAN verify-envelope-plan.md).
// A function of facts the caller gathers (the event payload; no secret, no candidate code). The body is read with the Markdown parser,
// never a pattern over prose. Whether the Change is the right one stays Review's validation.
//
// TRUST CONTRACT (the future caller's, explicit and checked here as far as a pure function can): `kind` is the lineage's verdict, never read
// from the title; `capabilities` and `changeIds` are read from the registers on the BASE (never the candidate's tree); `activation` is the trusted
// policy read from the BASE through loadPolicy. The caller asserts this with `provenance`, and a missing or different provenance is refused.
// Only `title`, `body`, `number` and `opened` come from the pull request itself. The title form is parsed by parseChangeTitle, the one place:
// the Development hooks' pull request title check calls it too and carries no copy.
import { Parser } from "commonmark";

/** The exact check name `track Work` reads (C7). */
export const CHECK_NAME = "verify Envelope";
export const PHASES = ["PLAN", "DO", "ACT"];
const HEADINGS = ["Intent", "Design", "Verified by", "Validated by"];
const REQUIRED = new Set(["Intent", "Verified by", "Validated by"]);

const text = (node) => {
  const parts = [];
  const w = node.walker();
  for (let e = w.next(); e; e = w.next()) {
    if (!e.entering) continue;
    if (e.node.type === "text" || e.node.type === "code") parts.push(e.node.literal);
    else if (e.node.type === "softbreak" || e.node.type === "linebreak") parts.push(" ");
  }
  return parts.join("").replace(/\s+/g, " ").trim();
};

/** Findings about the body: the second-level headings in order, once each, and a non-empty Intent. */
function bodyFindings(body) {
  const f = [];
  const seen = [];
  const content = {};
  let current = null;
  for (let n = new Parser().parse(body).firstChild; n; n = n.next) {
    if (n.type === "heading" && n.level === 2) {
      current = text(n);
      seen.push(current);
      content[current] ??= [];
      continue;
    }
    if (n.type === "heading" && n.level < 2) { current = null; continue; }
    if (current !== null && n.type !== "html_block") content[current].push(n);
  }
  const known = seen.filter((h) => HEADINGS.includes(h));
  for (const h of HEADINGS) {
    const count = known.filter((k) => k === h).length;
    if (count === 0 && REQUIRED.has(h)) f.push(`the body has no "## ${h}" heading`);
    if (count > 1) f.push(`the body has "## ${h}" ${count} times`);
  }
  const order = HEADINGS.filter((h) => known.includes(h));
  if (known.filter((h, i) => known.indexOf(h) === i).join("|") !== order.join("|")) f.push(`the body headings are out of order; the template order is ${HEADINGS.join(", ")}`);
  if ((content.Intent ?? []).filter((n) => text(n) !== "").length === 0 && known.includes("Intent")) f.push('the "## Intent" section is empty (the template comment is not an Intent)');
  return f;
}

const CHANGE = /^([a-z][a-z0-9-]*)\/(C[1-9][0-9]*) (PLAN|DO|ACT): (\S.*)$/;
export const KINDS = ["change", "promotion", "synchronization"];
export const PROVENANCE = Object.freeze({ kind: "lineage", registers: "base", activation: "base" });

/** The one parser of a Change pull request title: { capability, id, phase, concern } or null. */
export function parseChangeTitle(title) {
  const m = typeof title === "string" ? CHANGE.exec(title) : null;
  return m ? { capability: m[1], id: m[2], phase: m[3], concern: m[4] } : null;
}
const PROMOTION = /^PROMOTION \S+ -> main: \S.*$/;
const SYNC = /^Synchronize \S+ with main$/;

/** Findings about the title, for the kind the lineage decided (the title never decides it). */
function titleFindings(title, kind, { capabilities, changeIds }) {
  if (kind === "promotion") return PROMOTION.test(title) ? [] : ['a promotion title is "PROMOTION <lineage> -> main: <summary>"'];
  if (kind === "synchronization") return SYNC.test(title) ? [] : ['a synchronization title is "Synchronize <lineage> with main"'];
  if (kind !== "change") return [`the pull request kind ${JSON.stringify(kind)} is not one the lineage knows`];
  const parsed = parseChangeTitle(title);
  if (!parsed) return ['a Change title is "<capability>/<C-ID> <PHASE>: <concern>" with PHASE one of PLAN, DO, ACT'];
  const { capability, id } = parsed;
  if (!capabilities.includes(capability)) return [`${capability} is not a known capability`];
  if (!(changeIds[capability] ?? []).includes(id)) return [`${capability}/${id} is not defined in the ${capability} register`];
  return [];
}

/** A UTC ISO timestamp, strictly: Date.parse alone accepts prose such as "Nov 10 2026". */
const utc = (v) => typeof v === "string" && v.endsWith("Z") && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v.slice(0, 19));
const strings = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");
const registers = (v) => typeof v === "object" && v !== null && !Array.isArray(v) && Object.values(v).every(strings);

/**
 * @param facts { number, kind, title, body, capabilities, changeIds, opened, activation, provenance } (trust contract in the header)
 * Every fact is validated before any verdict, the not-applicable one included, so a malformed fact never hides behind the cutoff.
 */
export function verifyEnvelope(facts) {
  const { number, kind, title, body, capabilities, changeIds, opened, activation, provenance } = facts ?? {};
  const missing = [];
  if (typeof title !== "string") missing.push("title");
  if (typeof body !== "string") missing.push("body");
  if (!KINDS.includes(kind)) missing.push("kind");
  if (!strings(capabilities) || !registers(changeIds)) missing.push("registers");
  if (!utc(opened)) missing.push("opened (a UTC timestamp)");
  if (!utc(activation)) missing.push("activation (a UTC timestamp)");
  if (!Number.isInteger(number) || number < 1) missing.push("number");
  if (missing.length > 0) return { kind: "fail", message: `${CHECK_NAME}: ${missing.join(", ")} was not gathered or is malformed, so the envelope cannot be judged.\nRecovery: none (route: re-run the check once the facts are readable; a missing activation policy is the Owner's to set)` };
  if (provenance?.kind !== PROVENANCE.kind || provenance?.registers !== PROVENANCE.registers || provenance?.activation !== PROVENANCE.activation)
    return { kind: "fail", message: `${CHECK_NAME}: the kind, the registers and the activation must come from the lineage verdict and from the base, and the caller did not say so (provenance).\nRecovery: none (route: the check's caller reads them from the base; a pull request cannot supply them)` };
  if (Date.parse(opened) < Date.parse(activation)) return { kind: "not-applicable", message: `${CHECK_NAME}: opened before the activation boundary (${activation}); nothing is blocked retroactively.` };
  const t = titleFindings(title, kind, { capabilities, changeIds });
  const b = bodyFindings(body);
  if (t.length + b.length === 0) return { kind: "pass", message: `${CHECK_NAME}: the title and body follow the envelope.` };
  const recovery = [];
  if (t.length > 0) recovery.push(`Recovery: gh pr edit ${number} --title "<capability>/<C-ID> <PHASE>: <concern>" (re-runs on: edited)`);
  if (b.length > 0) recovery.push(`Recovery: gh pr edit ${number} --body-file <file following .github/pull_request_template.md> (re-runs on: edited)`);
  return { kind: "fail", message: [`${CHECK_NAME}: ${[...t, ...b].join("; ")}.`, ...recovery].join("\n") };
}

/** The trusted policy: { version: 1, cutoff: <UTC timestamp> }, read from the base. Missing or invalid is refused (never a pass). */
export function loadPolicy(raw) {
  let p;
  try { p = JSON.parse(raw); } catch { return { ok: false, finding: "the Envelope policy is not valid JSON" }; }
  if (p?.version !== 1 || !utc(p?.cutoff)) return { ok: false, finding: "the Envelope policy needs version 1 and a UTC cutoff (an ISO timestamp ending in Z)" };
  return { ok: true, activation: p.cutoff };
}
