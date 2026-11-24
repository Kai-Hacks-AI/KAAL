// The analyses carry their commit as `commit_sha`, as the real API answers (observed on the experiment of release/C129); the first fixtures wrote `sha`.
// The analysis side of the CodeQL gate (release/I68). Pure over facts: no import, no clock, no network. Time, sleep and the read are arguments.
const forSha = (analyses, sha) => analyses.filter((x) => x.commit_sha === sha);
export const missingOf = (expected, analyses, sha) => expected.filter((c) => !forSha(analyses, sha).some((x) => x.category === c));

// The findings of release/CTL34: an expected configuration with no analysis of the sha is `missing:<category>`, one whose analyses all report an error is `errored:<category>`.
export function analysisFindings({ sha, expected, analyses }) {
  const found = missingOf(expected, analyses, sha).map((c) => `missing:${c}`);
  for (const c of expected) {
    const mine = forSha(analyses, sha).filter((x) => x.category === c);
    if (mine.length && mine.every((x) => x.error)) found.push(`errored:${c}`);
  }
  return found.sort();
}

// Waits until every expected configuration has an analysis of the sha. When the analyze job did not succeed nothing will arrive, so it reads once. The end of the budget and a failed read are not ok (UNKNOWN): lateness and absence look the same.
export async function waitForAnalyses({ sha, expected, analyzeResult, read, sleep, now, intervalMs, budgetMs }) {
  const start = now();
  for (;;) {
    let analyses;
    try { analyses = await read(); } catch (e) { return { ok: false, reason: `cannot read the analyses: ${e.message}` }; }
    const missing = missingOf(expected, analyses, sha);
    if (!missing.length || analyzeResult !== 'success') return { ok: true, analyses };
    if (now() - start + intervalMs > budgetMs) return { ok: false, reason: `still missing after ${budgetMs / 1000}s: ${missing.join(' ')}` };
    await sleep(intervalMs);
  }
}
