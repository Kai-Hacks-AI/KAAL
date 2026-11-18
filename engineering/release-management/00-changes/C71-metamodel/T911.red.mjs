// Case release/T911 (release/C71): the relationships the Owner confirmed are drawn, as normative
import assert from "node:assert/strict";
import { model, mermaid, edges, key } from "./helper.mjs";

export const id = "release/T911";
export const tests = ["release/C71"];
export const title = "the diagram draws the Owner-confirmed relationships as normative: Change delivers Intent, Requirement answers Intent, Architecture answers Requirement, Architecture addresses Defect, and Case tests Intent, Requirement, Architecture and Defect";
export async function run() {
  const have = new Set(edges(mermaid(model())[0] ?? "").map(key));
  const want = [
    ["Change", "delivers", "Intent"], ["Requirement", "answers", "Intent"], ["Architecture", "answers", "Requirement"], ["Architecture", "addresses", "Defect"],
    ["Case", "tests", "Intent"], ["Case", "tests", "Requirement"], ["Case", "tests", "Architecture"], ["Case", "tests", "Defect"],
  ];
  for (const [f, l, t] of want) assert.ok(have.has(`${f} ${l} ${t} -->`), `${f} ${l} ${t} is not drawn as a normative (solid) edge`);
}
