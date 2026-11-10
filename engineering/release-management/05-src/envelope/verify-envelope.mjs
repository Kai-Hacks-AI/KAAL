// release-management/C8 DO (verify Envelope, F19): the pure judgment over a pull request's title and body (PLAN verify-envelope-plan.md).
// A function of facts the caller gathers (the event payload; no secret, no candidate code). The body is read with the Markdown parser,
// never a pattern over prose. Whether the Change is the right one stays Review's validation.
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
const PROMOTION = /^PROMOTION \S+ -> main: \S.*$/;
const SYNC = /^Synchronize \S+ with main$/;

/** Findings about the title, for the kind the lineage decided (the title never decides it). */
function titleFindings(title, kind, { capabilities, changeIds }) {
  if (kind === "promotion") return PROMOTION.test(title) ? [] : ['a promotion title is "PROMOTION <lineage> -> main: <summary>"'];
  if (kind === "synchronization") return SYNC.test(title) ? [] : ['a synchronization title is "Synchronize <lineage> with main"'];
  if (kind !== "change") return [`the pull request kind ${JSON.stringify(kind)} is not one the lineage knows`];
  const m = CHANGE.exec(title);
  if (!m) return ['a Change title is "<capability>/<C-ID> <PHASE>: <concern>" with PHASE one of PLAN, DO, ACT'];
  const [, capability, id] = m;
  if (!capabilities.includes(capability)) return [`${capability} is not a known capability`];
  if (!(changeIds[capability] ?? []).includes(id)) return [`${capability}/${id} is not defined in the ${capability} register`];
  return [];
}

const valid = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));

/**
 * @param facts { number, kind: "change"|"promotion"|"synchronization" (from the lineage), title, body, capabilities, changeIds, opened, activation }
 * `activation` is the trusted cutoff the caller read from the base-owned policy; a value the candidate supplies is never read here.
 */
export function verifyEnvelope(facts) {
  const { number, kind, title, body, capabilities, changeIds, opened, activation } = facts;
  const missing = [];
  if (typeof title !== "string") missing.push("title");
  if (typeof body !== "string") missing.push("body");
  if (typeof kind !== "string") missing.push("kind");
  if (!Array.isArray(capabilities) || typeof changeIds !== "object" || changeIds === null) missing.push("registers");
  if (!valid(opened)) missing.push("opened");
  if (!valid(activation)) missing.push("activation");
  if (missing.length > 0) return { kind: "fail", message: `${CHECK_NAME}: ${missing.join(", ")} was not gathered, so the envelope cannot be judged.\nRecovery: none (route: re-run the check once the facts are readable; a missing activation policy is the Owner's to set)` };
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
  if (p?.version !== 1 || !valid(p?.cutoff) || !String(p.cutoff).endsWith("Z")) return { ok: false, finding: "the Envelope policy needs version 1 and a UTC cutoff (an ISO timestamp ending in Z)" };
  return { ok: true, activation: p.cutoff };
}
