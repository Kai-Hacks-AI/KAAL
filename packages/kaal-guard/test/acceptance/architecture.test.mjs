// kaal-guard outer acceptance: Architecture. Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { PACKAGE } from "./harness.mjs";

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

/** Fails, naming the missing behaviour, while the package has no such file. */
function present(path) {
  assert.ok(existsSync(join(PACKAGE, path)), `missing behaviour: kaal-guard has no ${path}`);
}

describe("Architecture", () => {
  it("the runner knows nothing of the adapters or GitHub", () => {
    present("lib/runner.mjs");
    const runner = source("lib/runner.mjs");
    for (const s of specifiers(runner)) assert.doesNotMatch(s, /github|templates/, `the runner imports ${s}`);
    assert.doesNotMatch(runner, /GITHUB_|\.github\/|\.githooks|::(error|warning|notice)/, "the runner holds GitHub or hook knowledge");
  });

  it("nothing depends on an adapter", () => {
    present("templates/pre-push");
    for (const f of files(PACKAGE).filter((f) => /\.(mjs|js|cjs)$/.test(f) && !f.startsWith("test/acceptance/"))) {
      for (const s of specifiers(source(f))) assert.doesNotMatch(s, /templates\//, `${f} imports the adapter ${s}`);
    }
  });

  it("the package declares and imports no KAAL element and references no Engineering path", () => {
    present("package.json");
    const manifest = JSON.parse(source("package.json"));
    assert.equal(manifest.name, "kaal-guard");
    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      const kaal = Object.keys(manifest[field] ?? {}).filter((n) => /^(@[^/]+\/)?kaal-/.test(n));
      assert.deepEqual(kaal, [], `${field} names a KAAL element`);
    }
    assert.ok(!manifest.bundleDependencies && !manifest.bundledDependencies, "the package bundles dependencies");
    const engineering = ["engineering", ""].join("/");
    const engine = [".kaal", ""].join("/");
    for (const f of files(PACKAGE)) {
      const text = readFileSync(join(PACKAGE, f), "utf8");
      if (/\.(mjs|js|cjs)$/.test(f)) for (const s of specifiers(text)) assert.ok(!/^(@[^/]+\/)?kaal-/.test(s) || s.startsWith("kaal-guard"), `${f} imports ${s}`);
      assert.ok(!text.includes(engineering), `${f} references an Engineering path`);
      assert.ok(!text.includes(engine), `${f} references a KAAL Engine`);
    }
  });

  it("the acceptance boundary is closed: its files import only Node built-ins and files inside it", () => {
    for (const f of files(HERE).filter((f) => f.endsWith(".mjs"))) {
      for (const s of specifiers(readFileSync(join(HERE, f), "utf8"))) {
        assert.ok(s.startsWith("node:") || (s.startsWith("./") && !s.includes("..")), `${f} imports ${s}, outside the boundary`);
      }
    }
  });
});
