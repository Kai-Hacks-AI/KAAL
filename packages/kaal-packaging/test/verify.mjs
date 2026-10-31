// kaal-packaging's Embedded verification (packaging/F9–F11, F15): `npm run test:embedded`, and
// all an installed `npm test` runs. Against the installed copy it compares every delivered file
// with the shipped manifest, test/verify.json, then runs exactly the cases that manifest declares,
// once each, and ends on one result line in Testing's form (packaging/F10). What each result means
// is Testing's (testing/F13). It needs only Node and the package's declared dependencies
// (packaging/N8).
import { fileURLToPath } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { readFile } from "kaal-hosting";

const NAME = "kaal-packaging-verification";
const EXIT = { verified: 0, failed: 1, unknown: 2 };
const at = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

function end(result, cases, causes) {
  const passed = cases.filter((c) => c.outcome === "pass").length;
  console.log(`${passed} passed`);
  console.log(`${NAME} ${JSON.stringify({ result, exit: EXIT[result], cases, causes })}`);
  process.exitCode = EXIT[result];
}

let manifest;
try {
  manifest = JSON.parse((await readFile(at("test/verify.json"))).toString("utf8"));
} catch (e) {
  end("unknown", [], [`the shipped manifest cannot be read: ${e.message}`]);
}
if (manifest) {
  // A delivered file that differs from the manifest makes the evidence untrustworthy: unknown (testing/F43).
  const differ = [];
  for (const [path, digest] of Object.entries(manifest.files ?? {})) {
    try {
      if (sha256(await readFile(at(path))) !== digest) differ.push(`${path} differs from the manifest`);
    } catch {
      differ.push(`${path} is missing`);
    }
  }
  if (differ.length) end("unknown", [], differ);
  else {
    let defined;
    try {
      ({ cases: defined } = await import("./embed/cases.mjs"));
    } catch (e) {
      defined = null;
      end("failed", [], [`the Embedded cases cannot be loaded: ${e.message}`]);
    }
    if (defined) {
      const byId = new Map(defined.map((c) => [c.id, c]));
      const cases = [];
      const causes = [];
      for (const id of manifest.cases ?? []) {
        const c = byId.get(id);
        if (!c) {
          cases.push({ name: id, outcome: "fail" });
          causes.push(`${id} is declared but not delivered`);
          continue;
        }
        try {
          await c.run();
          cases.push({ name: id, outcome: "pass" });
        } catch (e) {
          cases.push({ name: id, outcome: "fail" });
          causes.push(`${id}: ${e.message}`);
        }
      }
      if (cases.length === 0) end("unknown", cases, ["the manifest declares no case, so nothing was verified"]);
      else end(causes.length ? "failed" : "verified", cases, causes);
    }
  }
}
