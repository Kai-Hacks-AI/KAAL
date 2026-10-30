// The upgrade paths a target release declares under guard/F42 (guard/C113), read fail-closed for guard/T118
// and checked by guard/T133. Three readings are kept apart: a release before 0.0.5 that declares none
// (legacy), a declaration that is valid, and one that is malformed. A malformed declaration is a finding
// and never counts as evidence of a supported transition.

const COLUMNS = ["From", "Path", "Prerequisites", "What changes, and what is kept", "If it fails", "Verify"];
/** The first release that must declare its upgrade paths. */
const FIRST = "0.0.5";

const base = (version) => String(version).split("-")[0];
export const order = (version) => base(version).split(".").reduce((n, part) => n * 1000 + Number(part), 0);
const cells = (line) => line.split("|").slice(1, -1).map((c) => c.trim());

/**
 * The declaration in a release's docs/requirements.md text (null when the release ships none):
 * { kind: "absent" }, { kind: "declared", target, sources } or { kind: "malformed", finding }.
 */
export function declaredPaths(text) {
  const at = text == null ? -1 : text.indexOf("**guard/F42 ");
  if (at < 0) return { kind: "absent" };
  const malformed = (finding) => ({ kind: "malformed", finding: `guard/F42: ${finding}` });
  const head = /^Supported upgrade paths to `(\d+\.\d+\.\d+)`:$/m.exec(text.slice(at));
  if (!head) return malformed("no line names the release its upgrade paths lead to");
  const lines = text.slice(at + head.index).split("\n").slice(1);
  const start = lines.findIndex((l) => l.trim() !== "");
  if (start < 0 || !lines[start].startsWith("|")) return malformed("no table of upgrade paths follows its heading");
  const end = lines.findIndex((l, i) => i > start && !l.startsWith("|"));
  const table = lines.slice(start, end < 0 ? undefined : end);
  if (JSON.stringify(cells(table[0])) !== JSON.stringify(COLUMNS)) return malformed(`the table's columns are not ${COLUMNS.join(", ")}`);
  if (!table[1] || !cells(table[1]).every((c) => /^:?-{3,}:?$/.test(c)) || cells(table[1]).length !== COLUMNS.length) return malformed("the table has no separator row");
  const rows = table.slice(2).map(cells);
  if (rows.length === 0) return malformed("the table declares no source");
  const target = head[1];
  const sources = [];
  for (const row of rows) {
    if (row.length !== COLUMNS.length) return malformed(`a row has ${row.length} columns, not ${COLUMNS.length}: ${row[0] ?? ""}`);
    const version = /^`(\d+\.\d+\.\d+)`$/.exec(row[0])?.[1];
    if (!version) return malformed(`a source is not a version: ${row[0]}`);
    if (sources.includes(version)) return malformed(`${version} is declared twice`);
    if (order(version) >= order(target)) return malformed(`${version} is not earlier than ${target}`);
    if (row.some((c) => c === "")) return malformed(`the path from ${version} leaves a column empty`);
    sources.push(version);
  }
  return { kind: "declared", target, sources };
}

/**
 * Whether the newer candidate's declaration admits the move from the older one:
 * { verdict: "legacy" } for a release before 0.0.5 that declares nothing, { verdict: "declared" } or
 * { verdict: "undeclared" }, or { finding } when the declaration cannot be evidence. At the release gate
 * (a registry candidate, or GUARD_RELEASE_GATE=1 for the bumped candidate) the declared target must equal
 * the candidate's version exactly. Before it, a staged declaration may lead to a later version than the
 * candidate's.
 */
export function admits(paths, older, newer, { gate }) {
  if (paths.kind === "malformed") return { finding: `${newer.version}: ${paths.finding}` };
  if (paths.kind === "absent") {
    return order(newer.version) < order(FIRST) ? { verdict: "legacy" } : { finding: `${newer.version} declares no upgrade paths under guard/F42` };
  }
  if (gate ? paths.target !== newer.version : order(paths.target) < order(newer.version)) {
    return { finding: `${newer.version} declares upgrade paths to ${paths.target}${gate ? ", not to itself, at the release gate" : ", an earlier release"}` };
  }
  return { verdict: paths.sources.includes(base(older.version)) ? "declared" : "undeclared" };
}
