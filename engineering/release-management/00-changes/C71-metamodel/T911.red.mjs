// Case release/T911 (release/C71): the relationships the Owner confirmed are drawn, as normative
import assert from "node:assert/strict";
import { model, mermaid, edges, key } from "./helper.mjs";

export const id = "release/T911";
export const tests = ["release/C71"];
export const title = "the diagram draws the Owner-decided relationships as normative: Requirement answers Intent, Architecture addresses Requirement and Defect, Test Case verifies Intent, Requirement, Architecture, Defect and Gap, Control objective Intent, Change delivers Intent, solves Defect and closes Gap, Gap manifests in Intent, Requirement, Architecture and Defect";
export async function run() {
  const have = new Set(edges(mermaid(model())[0] ?? "").map(key));
  const want = [
    ["Requirement", "answers", "Intent"], ["Architecture", "addresses", "Requirement"], ["Architecture", "addresses", "Defect"],
    ["TestCase", "verifies", "Intent"], ["TestCase", "verifies", "Requirement"], ["TestCase", "verifies", "Architecture"], ["TestCase", "verifies", "Defect"], ["TestCase", "verifies", "Gap"],
    ["Control", "objective", "Intent"], ["Change", "delivers", "Intent"], ["Change", "solves", "Defect"], ["Change", "closes", "Gap"], ["Gap", "manifests", "Intent"], ["Gap", "manifests", "Requirement"], ["Gap", "manifests", "Architecture"], ["Gap", "manifests", "Defect"],
  ];
  for (const [f, l, t] of want) assert.ok(have.has(`${f} ${l} ${t} -->`), `${f} ${l} ${t} is not drawn as a normative (solid) edge`);
}
