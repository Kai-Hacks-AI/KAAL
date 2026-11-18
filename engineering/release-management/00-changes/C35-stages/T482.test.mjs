// Case release/T482 (release/C35): no legacy control is in any ruleset source
import assert from "node:assert/strict";
import { NAMES, source, contexts } from "./helper.mjs";

export const id = "release/T482";
export const tests = ["release/C35"];
export const title = "no legacy control is in any ruleset source";
export async function run() {
  const legacy = ["deletion", "non_fast_forward", "pull_request", "code_scanning", "merge_queue", "creation"];
  for (const n of NAMES) {
    const r = source(n);
    for (const t of legacy) assert.ok(n === "Integrating" && t === "pull_request" ? r.rules.filter((x) => x.type === t).length === 1 : !r.rules.some((x) => x.type === t), `${n}: no ${t} (the one approval rule of Integrating is release/CTL10, release/C66, not a legacy control)`);
    for (const c of contexts(r)) assert.ok(/^verify Stages \(/.test(c) || (n === "Promoting" && c === "analyze Vulnerabilities (Promoting)"), `${n}: only verify Stages (and for Promoting analyze Vulnerabilities, release/CTL5), got ${c}`);
  }
}
