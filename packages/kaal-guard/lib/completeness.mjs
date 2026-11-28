// The completeness check (guard/A22, guard/F44): every package with a test script is covered by a check that
// runs its own suite, or is exempt with a reason. Pure.

export const OWN_SUITE = new Set(["npm test", "npm run test"]);

/**
 * `packages` maps a folder ("" for the root) to its package.json's scripts; `registrations` are the
 * candidate's; `exempt` maps a path ("package.json" for the root) to its reason. Returns the findings.
 */
export function completeness({ aggregate, packages, registrations, exempt }) {
  const findings = [];
  for (const [folder, scripts] of Object.entries(packages)) {
    if (typeof scripts?.test !== "string") continue;
    const key = folder === "" ? "package.json" : folder;
    if (typeof exempt[key] === "string" && exempt[key].trim() !== "") continue;
    const own = registrations.filter((r) => r.folder === folder && r.aggregates.includes(aggregate));
    if (own.some((r) => OWN_SUITE.has(r.command))) continue;
    const file = folder === "" ? "guard.json" : `${folder}/guard.json`;
    if (own.length > 0) {
      for (const r of own) findings.push({ place: file, folder, check: r.id, finding: `${r.id} does not run the suite of ${folder === "" ? "the root package" : folder}: its command is ${JSON.stringify(r.command)}`, fix: `set its command to "npm test" in ${file}` });
    } else {
      findings.push({ place: file, folder, finding: `${folder === "" ? "the root package" : folder} has a test script and no ${aggregate} check or exempt entry`, fix: `add { "checks": [ { "name": "test", "command": "npm test", "aggregates": ["${aggregate}"] } ] } to ${file}, or list ${JSON.stringify(key)} under exempt with a reason` });
    }
  }
  return findings;
}
