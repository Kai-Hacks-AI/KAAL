// Case release/T913 (release/C71): every PR template has a view with the five sections and names its template
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { read, templates, viewPath, VIEW_HEADINGS } from "./helper.mjs";

export const id = "release/T913";
export const tests = ["release/C71"];
export const title = "each of the PR templates under .github has a view with the sections Objects, Relationships, Information the template expects, What the reviewer should be able to verify, The INFORMED chapter and Outside this template, in that order, and the view names its template";
export async function run() {
  const ts = templates();
  assert.ok(ts.length >= 7, "the PR templates are the default and the six typed ones");
  for (const t of ts) {
    const p = viewPath(t.name);
    assert.ok(existsSync(p), `the view of ${t.path} is absent`);
    const text = read(p);
    const heads = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    assert.deepEqual(heads, VIEW_HEADINGS, `${t.name}: the sections of the view`);
    assert.ok(text.includes(`\`${t.path}\``), `${t.name}: the view does not name ${t.path}`);
    assert.match(text, /\*\*Purpose\.\*\* .*semantic reasoning/, `${t.name}: the view does not state its purpose`);
    assert.match(text, /\*\*In the chain:\*\* /, `${t.name}: the view does not say which part of the chain it carries`);
    const ch = text.split("## The INFORMED chapter")[1].split("\n## ")[0];
    assert.ok([...ch.matchAll(/^- \[ \] /gm)].length >= 2, `${t.name}: the INFORMED chapter holds a box for each concern`);
    assert.match(ch, /Process control/, `${t.name}: the process control is not named`);
    assert.match(ch, /Content control/, `${t.name}: the content control is not named`);
    assert.match(ch, /claimed but not found/, `${t.name}: claimed-but-not-found is not named`);
    assert.match(ch, /done but not claimed/, `${t.name}: done-but-not-claimed is not named`);
    assert.equal([...text.matchAll(/```mermaid/g)].length, 1, `${t.name}: a view holds one diagram`);
  }
}
