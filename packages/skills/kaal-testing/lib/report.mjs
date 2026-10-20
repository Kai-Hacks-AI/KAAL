// One Testing report over two orthogonal dimensions, reconciled only where the
// evidence links them. The package dimension is each npm workspace's delivered
// JavaScript, executed by that workspace's own tests (kaal-testing/coverage).
// The ownership dimension is each CASE owner's files, by its own declared claim
// (kaal-testing/attribution). Neither is derived from the other: a package is
// not an owner, and an owner may be delivered in any number of packages or none.
//
// A delivered file joins an owner only when attribution attributes that exact
// tracked path to exactly one owner. A delivered file that is tracked but
// unclaimed, or claimed by several owners, stays unassigned with its reason. A
// delivered file Git does not track, such as built output, has no tracked
// identity: it is listed as not reconciled, and no source is guessed for it.
//
// The two metrics never combine. Non-blank text lines count what an owner holds;
// executable lines, as V8 coverage counts them, measure what a workspace's tests
// ran. They are reported side by side, and no ratio of one to the other is
// formed. Every delivered file is reconciled exactly once, and the ownership
// totals are attribution's own, unchanged.

const byPath = (a, b) => (a.workspace < b.workspace ? -1 : a.workspace > b.workspace ? 1 : a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
const byRef = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const ref = ({ kind, name, id }) => ({ kind, name, id });

/** The reconciliation statuses, in report order. */
export const STATUSES = ["attributed", "unclaimed", "conflicting claims", "no tracked identity"];

/** Executed out of executable lines over `entries`, counting only those measured. */
function executed(entries) {
  const measured = entries.filter((e) => e.executableLines);
  return {
    executed: measured.reduce((n, e) => n + e.executableLines.executed, 0),
    total: measured.reduce((n, e) => n + e.executableLines.total, 0),
    unmeasured: entries.length - measured.length,
  };
}

/**
 * Reconcile `attribution` (from kaal-testing/attribution's attribute) with
 * `coverage`, an array with one result per workspace: { workspace, tests,
 * delivered, lines, branches, functions, unexecuted, files, failed?, note? },
 * as Engineering's coverage driver reports them, or { workspace, unknown } for
 * a workspace with no evidence. Both must describe the same tree.
 */
export function report(attribution, coverage) {
  const owner = new Map();
  for (const o of attribution.owners) for (const e of o.entries) owner.set(e.path, o);
  const unassigned = new Map(attribution.unassigned.entries.map((e) => [e.path, e.reason]));

  const findings = [...attribution.findings];
  const packages = [];
  const entries = [];
  for (const w of [...coverage].sort((a, b) => (a.workspace < b.workspace ? -1 : a.workspace > b.workspace ? 1 : 0))) {
    const measured = !w.failed && !w.note && !w.unknown;
    if (w.failed) findings.push({ kind: "verified failure", subject: w.workspace, evidence: w.failed });
    if (w.tests === "fail") findings.push({ kind: "verified failure", subject: w.workspace, evidence: `${w.workspace}: its tests failed` });
    if (w.unknown) findings.push({ kind: "unknown", subject: w.workspace, evidence: w.unknown });
    packages.push({
      workspace: w.workspace,
      tests: w.tests,
      // Of a workspace with no evidence, not even the delivered files are known: never zero.
      ...(w.unknown ? { unknown: w.unknown } : { deliveredFiles: w.delivered?.length ?? 0 }),
      ...(measured ? { lines: w.lines, branches: w.branches, functions: w.functions, unexecuted: [...w.unexecuted] } : {}),
      ...(w.failed ? { failed: w.failed } : {}),
      ...(w.note ? { note: w.note } : {}),
    });
    const figures = new Map((measured ? w.files : []).map((f) => [f.path, { executed: f.lines.covered, total: f.lines.total }]));
    for (const path of w.delivered ?? []) {
      const o = owner.get(path);
      const status = o ? "attributed" : (unassigned.get(path) ?? "no tracked identity");
      entries.push({
        workspace: w.workspace,
        path,
        status,
        ...(o ? { owner: ref(o) } : {}),
        ...(figures.has(path) ? { executableLines: figures.get(path) } : {}),
      });
    }
  }
  entries.sort(byPath);

  const seen = new Set();
  for (const e of entries) {
    const key = `${e.workspace}\0${e.path}`;
    if (seen.has(key)) throw new Error(`${e.workspace} reports ${e.path} as delivered more than once`);
    seen.add(key);
  }

  const owners = attribution.owners
    .map((o) => {
      const delivered = entries.filter((e) => e.status === "attributed" && e.owner.id === o.id);
      return { ...ref(o), files: o.files, nonBlankLines: o.lines, deliveredFiles: delivered.length, executableLines: executed(delivered) };
    })
    .sort(byRef);
  const statuses = STATUSES.map((status) => {
    const of = entries.filter((e) => e.status === status);
    return { status, deliveredFiles: of.length, executableLines: executed(of) };
  });

  const reconciled = statuses.reduce((n, s) => n + s.deliveredFiles, 0);
  if (reconciled !== entries.length) throw new Error(`reconciliation does not account for the delivered files: ${reconciled} reconciled, ${entries.length} delivered`);

  return {
    ownership: {
      metric: attribution.metric,
      nonBlankLines: attribution.lines,
      owners: owners.map(({ kind, name, id, files, nonBlankLines }) => ({ kind, name, id, files, nonBlankLines })),
      unassigned: { files: attribution.unassigned.files, nonBlankLines: attribution.unassigned.lines },
      conflicts: { files: attribution.conflicts.files, nonBlankLines: attribution.conflicts.lines },
    },
    packages,
    reconciliation: {
      metric: "executable lines, as V8 coverage counts them, executed by the delivering workspace's own tests",
      owners: owners.map(({ kind, name, id, deliveredFiles, executableLines }) => ({ kind, name, id, deliveredFiles, executableLines })),
      statuses,
      entries,
    },
    findings,
  };
}

const cell = (v) => String(v).replaceAll("|", "\\|").replaceAll("\n", " ");
const pct = (v) => (v === undefined ? "-" : `${v}%`);
const lines = ({ executed, total, unmeasured }) => `${executed} of ${total}${unmeasured ? ` (${unmeasured} files not measured)` : ""}`;
const short = (id) => id.slice(0, 12);
const FINDINGS = ["verified failure", "potential defect", "architectural concern", "unknown"];

/**
 * The report as GitHub-flavoured Markdown, from one `report()` result and the
 * run it came from: `provenance` = { commit?, run?, attempt?, captured: [{
 * workspace, commit, platform, arch, node }] }. Each section says what its
 * figures are and are not; a failed or unknown measurement is shown as such,
 * never as a figure; and no percentage appears but coverage's own.
 */
export function markdown(result, provenance) {
  const out = [];
  const add = (...l) => out.push(...l);
  const { ownership, packages, reconciliation, findings } = result;
  const platforms = [...new Set(provenance.captured.map((c) => `${c.platform} ${c.arch}, Node ${c.node}`))].sort();

  add("## Testing evidence", "");
  add(`Commit \`${provenance.commit ?? "unknown"}\`${provenance.run ? `, run ${provenance.run}${provenance.attempt ? ` attempt ${provenance.attempt}` : ""}` : ""}.`);
  add(platforms.length ? `Coverage was captured on ${platforms.join("; ")} only.` : "No coverage was captured.");
  add("");

  add("### Code coverage", "", "Delivered JavaScript of each workspace, executed by that workspace's own tests. This is execution, not correctness. Acceptance runs installed packages and is not counted.", "");
  add("| workspace | tests | delivered JS files | lines | branches | functions |", "| --- | --- | --- | --- | --- | --- |");
  for (const p of packages) {
    const figures = p.unknown ? "unknown | unknown | unknown" : p.failed ? "not measured | not measured | not measured" : p.note ? "N/A | N/A | N/A" : `${pct(p.lines)} | ${pct(p.branches)} | ${pct(p.functions)}`;
    add(`| ${cell(p.workspace)} | ${p.unknown ? "unknown" : (p.tests ?? "not observed")} | ${p.unknown ? "unknown" : p.deliveredFiles} | ${figures} |`);
  }
  add("");

  add("### CASE ownership", "", `Metric: ${ownership.metric}. These are the owners' own claims, not obligations met.`, "");
  add("| owner | files | non-blank text lines |", "| --- | --- | --- |");
  for (const o of ownership.owners) add(`| ${o.kind} ${cell(o.name)} (\`${short(o.id)}\`) | ${o.files} | ${o.nonBlankLines} |`);
  add(`| unassigned | ${ownership.unassigned.files} | ${ownership.unassigned.nonBlankLines} |`);
  add(`| of which conflicting claims | ${ownership.conflicts.files} | ${ownership.conflicts.nonBlankLines} |`);
  add("");

  add("### Reconciliation", "", `A delivered file joins an owner only by its exact tracked path. Executable lines and non-blank text lines are never combined. Metric: ${reconciliation.metric}.`, "");
  add("| owner or status | delivered files | executable lines executed |", "| --- | --- | --- |");
  for (const o of reconciliation.owners) add(`| ${o.kind} ${cell(o.name)} (\`${short(o.id)}\`) | ${o.deliveredFiles} | ${lines(o.executableLines)} |`);
  for (const s of reconciliation.statuses) add(`| ${s.status} | ${s.deliveredFiles} | ${lines(s.executableLines)} |`);
  add("");

  add("### Findings", "");
  if (findings.length === 0) add("None reported. That is not evidence of correctness.", "");
  for (const kind of FINDINGS) {
    const of = findings.filter((f) => f.kind === kind);
    if (of.length === 0) continue;
    add(`**${kind}** (${of.length})`, "");
    for (const f of of) add(`- ${cell(f.subject)}: ${cell(f.evidence)}`);
    add("");
  }
  add("### Capability contracts", "", "Not reported here. Coverage, ownership and their reconciliation do not show whether any capability meets its contracts.");
  return out.join("\n") + "\n";
}
