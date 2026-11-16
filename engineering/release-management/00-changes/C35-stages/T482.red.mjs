// Case release/T482 (release/C35): no legacy control is in any ruleset source, and no stage-owned check is anything but verify Stages
import assert from "node:assert/strict";
import { NAMES, source, contexts } from "./helper.mjs";

export const id = "release/T482";
export const tests = ["release/C35"];
export const title = "no legacy control is in any ruleset source, and no stage-owned check is anything but verify Stages";
export async function run() {
  const legacy = ["deletion", "non_fast_forward", "pull_request", "code_scanning", "merge_queue", "creation"];
  for (const n of NAMES) {
    const r = source(n);
    for (const t of legacy) assert.ok(!r.rules.some((x) => x.type === t), `${n}: no ${t}`);
    for (const c of contexts(r)) assert.match(c, /^verify Stages \(/, `${n}: only verify Stages, got ${c}`);
  }
}
