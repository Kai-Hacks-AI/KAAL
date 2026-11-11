// A9 evidence-reader: reads the current evaluation evidence that Testing supplies, one row per Case and target. It executes nothing.
// Missing or unreadable evidence is returned as undefined, which the judgment reports as UNKNOWN under F1/6.
export function readEvidence(text) {
  if (typeof text !== 'string') return undefined;
  let rows;
  try { rows = JSON.parse(text); } catch { return undefined; }
  if (!Array.isArray(rows) || !rows.every((row) => row !== null && typeof row === 'object' && !Array.isArray(row))) return undefined;
  return rows.map((row) => ({ case: row.case, target: row.target, result: row.result, reason: row.reason }));
}
