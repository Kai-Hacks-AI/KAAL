// Case release/T510 (release/C37): the stages declaration judges Developing and says exactly which .githooks files it expects
import assert from "node:assert/strict";
import { stages } from "./helper.mjs";

export const id = "release/T510";
export const tests = ["release/C37"];
export const title = "stages.json declares Developing as judged, with the exact .githooks files it expects: dispatcher, legacy hook by sha256, README and the local verify Stages (Developing) script";
export async function run() {
  const dev = stages().stages.find((s) => s.name === "Developing");
  assert.equal(dev.kind, ".githooks");
  assert.notEqual(dev.judged, "later", "Developing is judged now, not later");
  assert.equal(dev.exact, true, "nothing else under .githooks");
  assert.deepEqual(dev.files.map((f) => f.path), ["pre-push", "old/pre-push", "new/pre-push.d/README.md", "new/pre-push.d/verify-stages-developing"]);
  const by = (p) => dev.files.find((f) => f.path === p);
  assert.equal(by("pre-push").source, "wiring/hooks/pre-push-dispatcher");
  assert.equal(by("old/pre-push").sha256, "df18ff0179e9a10ae340cd463d7012305c438b7148f0217348974b7ab56c8c06", "the legacy hook is pinned by its declared sha256");
  assert.equal(by("new/pre-push.d/verify-stages-developing").source, "wiring/hooks/verify-stages-developing");
  for (const f of dev.files) assert.equal(f.mode, f.path.endsWith(".md") ? "644" : "755", `${f.path} mode`);
}
