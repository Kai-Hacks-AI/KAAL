// foundation/C19 (pin ratchet): how the embed acceptance judges Foundation copies nested inside an installed consumer.
// A consumer may stay on an older published Foundation: that is a visible pin-behind report, not a failure.
// It stays a hard failure when the nested copy has the same version as the workspace one (a duplicate), a version
// above it, a version below a floor Foundation itself declares, or when anything other than Foundation is nested.

const parse = (v) => String(v).split(".").map((n) => Number.parseInt(n, 10));
/** -1, 0 or 1 comparing two plain x.y.z versions. */
export function compare(a, b) {
  const x = parse(a), y = parse(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

/**
 * @param {{ consumer: string, workspace: string, floor?: string, nested: Record<string, string> }} input
 *   nested maps each package nested inside the consumer to its version.
 * @returns {{ failures: string[], reports: string[] }}
 */
export function classifyNested({ consumer, workspace, floor, nested }) {
  const failures = [];
  const reports = [];
  for (const [name, version] of Object.entries(nested)) {
    if (name !== "@kaihacksai/kaal-foundation") {
      failures.push(`${consumer} nests ${name}@${version}: only an older published Foundation may be nested`);
      continue;
    }
    const order = compare(version, workspace);
    if (order === 0) failures.push(`${consumer} holds a duplicate ${name}@${version}, the same version as the workspace copy`);
    else if (order > 0) failures.push(`${consumer} nests ${name}@${version}, newer than the workspace ${workspace}`);
    else if (floor !== undefined && compare(version, floor) < 0) failures.push(`${consumer} nests ${name}@${version}, below the floor ${floor} that Foundation declares`);
    else reports.push(`pin-behind: ${consumer} stays on ${name}@${version}, workspace is ${workspace} (fix soon)`);
  }
  return { failures, reports };
}
