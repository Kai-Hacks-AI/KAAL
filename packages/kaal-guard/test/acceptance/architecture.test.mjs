// kaal-guard outer acceptance, Architecture conformance: each test (T…) names the Architecture elements
// (A…) it checks. Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { NAME, PACKAGE } from "./harness.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Every file under a directory, relative to it, with forward slashes. */
function files(root) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      if (e.isDirectory()) walk(join(d, e.name));
      else out.push(relative(root, join(d, e.name)).split("\\").join("/"));
    }
  };
  walk(root);
  return out.sort();
}

/** The module specifiers a JavaScript source imports or requires. */
const specifiers = (source) => [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)["']([^"']+)["']/g)].map((m) => m[1]);

const source = (path) => readFileSync(join(PACKAGE, path), "utf8");

/** While the package has no such file, the test is blocked here, before any conformance assertion. */
function present(path) {
  assert.ok(existsSync(join(PACKAGE, path)), `blocked before behavioural assertion: kaal-guard has no ${path}`);
}

describe("Architecture conformance", () => {
  it("guard/T28 [guard/A3, guard/A7]: the runner knows nothing of the adapters or GitHub", () => {
    present("lib/runner.mjs");
    const runner = source("lib/runner.mjs");
    for (const s of specifiers(runner)) assert.doesNotMatch(s, /github|templates/, `the runner imports ${s}`);
    assert.doesNotMatch(runner, /GITHUB_|\.github\/|\.githooks|::(error|warning|notice)/, "the runner holds GitHub or hook knowledge");
  });

  it("guard/T29 [guard/A7]: nothing depends on an adapter", () => {
    present("templates/pre-push");
    for (const f of files(PACKAGE).filter((f) => /\.(mjs|js|cjs)$/.test(f) && !f.startsWith("test/acceptance/"))) {
      for (const s of specifiers(source(f))) assert.doesNotMatch(s, /templates\//, `${f} imports the adapter ${s}`);
    }
  });

  it("guard/T30 [guard/A8, guard/N6]: the package declares and imports no KAAL element and references no Engineering path", () => {
    present("package.json");
    const manifest = JSON.parse(source("package.json"));
    assert.equal(manifest.name, NAME);
    assert.deepEqual(Object.keys(manifest.bin ?? {}), ["kaal-guard"], "the package's command is kaal-guard");
    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      const kaal = Object.keys(manifest[field] ?? {}).filter((n) => /^(@[^/]+\/)?kaal-/.test(n));
      assert.deepEqual(kaal, [], `${field} names a KAAL element`);
    }
    assert.ok(!manifest.bundleDependencies && !manifest.bundledDependencies, "the package bundles dependencies");
    const engineering = ["engineering", ""].join("/");
    const engine = [".kaal", ""].join("/");
    for (const f of files(PACKAGE)) {
      const text = readFileSync(join(PACKAGE, f), "utf8");
      if (/\.(mjs|js|cjs)$/.test(f)) for (const s of specifiers(text)) assert.ok(!/^(@[^/]+\/)?kaal-/.test(s) || s === NAME || s.startsWith(`${NAME}/`), `${f} imports ${s}`);
      assert.ok(!text.includes(engineering), `${f} references an Engineering path`);
      assert.ok(!text.includes(engine), `${f} references a KAAL Engine`);
    }
  });

  it("guard/T31 [guard/A8, guard/N6]: the acceptance boundary is closed: its files import only Node built-ins and files inside it", () => {
    for (const f of files(HERE).filter((f) => f.endsWith(".mjs"))) {
      for (const s of specifiers(readFileSync(join(HERE, f), "utf8"))) {
        assert.ok(s.startsWith("node:") || (s.startsWith("./") && !s.includes("..")), `${f} imports ${s}, outside the boundary`);
      }
    }
  });
});
