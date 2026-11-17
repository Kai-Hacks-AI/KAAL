// release/CTL4 verify Source: did the source tests of a package run, in the package's directory, and pass? (release/C55)
// judgeSource({ directory, run }, declaration) -> { result: "verified" | "failed" | "unknown", findings: [{ rule, kind, message }] }.
// It is pure: it runs nothing. `run` is the record of the source test run, { command, cwd, status }, or null when no run left a record.
// `declaration` is verify-source.json: { command }. The command comes from there and is named nowhere in this file.
// A run with no record, or whose status is not a whole number, is unknown and never verified; no other rule is judged on it.
const finding = (rule, kind, message) => ({ rule, kind, message });

export function judgeSource({ directory, run } = {}, declaration = {}) {
  if (!run || typeof run !== 'object' || !Number.isInteger(run.status)) {
    return { result: 'unknown', findings: [finding('source-not-run', 'unknown', 'the source tests left no record of a run with an exit status')] };
  }
  const findings = [];
  if (run.command !== declaration.command) findings.push(finding('source-command', 'failed', `the command run is not the declared one (${declaration.command})`));
  if (run.cwd !== directory) findings.push(finding('source-directory', 'failed', `the tests did not run in the package directory (${directory})`));
  if (run.status !== 0) findings.push(finding('source-failed', 'failed', `the tests exited with status ${run.status}`));
  return { result: findings.length ? 'failed' : 'verified', findings };
}
