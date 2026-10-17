// Reading one workspace's c8 json-summary into coverage evidence. A summary
// that is missing, unreadable or not a c8 summary is a failure of measurement
// for that workspace, never a percentage.

/** The coverage evidence for `workspace`, or `{ failed }` naming what is missing or invalid. */
export function evidence(workspace, root, text) {
  if (text === undefined) return { failed: `${workspace}: no coverage summary was produced` };
  let summary;
  try {
    summary = JSON.parse(text);
  } catch (e) {
    return { failed: `${workspace}: the coverage summary is not JSON (${e.message})` };
  }
  const metric = (s, k) => s?.[k] && Number.isFinite(s[k].pct) && Number.isInteger(s[k].total) && Number.isInteger(s[k].covered);
  const valid = (s) => ["lines", "branches", "functions"].every((k) => metric(s, k));
  if (summary === null || typeof summary !== "object" || !valid(summary.total)) return { failed: `${workspace}: the coverage summary has no valid total for lines, branches and functions` };
  const files = Object.entries(summary).filter(([file]) => file !== "total");
  const invalid = files.find(([, s]) => !valid(s));
  if (invalid) return { failed: `${workspace}: the coverage summary has no valid figures for ${invalid[0]}` };
  const relative = (file) => (file.startsWith(root) ? file.slice(root.length + 1) : file).replaceAll("\\", "/");
  return {
    lines: summary.total.lines.pct,
    branches: summary.total.branches.pct,
    functions: summary.total.functions.pct,
    measured: files.map(([file]) => relative(file)).sort(),
    unexecuted: files
      .filter(([, s]) => s.functions.total > 0 && s.functions.covered === 0 && s.lines.covered === 0)
      .map(([file]) => relative(file))
      .sort(),
  };
}
