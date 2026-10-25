// kaal-guard outer acceptance, Architecture conformance: each test (T…) names the Architecture elements
// (A…) it checks. Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CONFIG, consumer, NAME, PACKAGE, RECORD } from "./harness.mjs";

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
      // The .kaal namespace is not a KAAL Engine (guard/F1): only Guard's own config and state directories in it are allowed.
      const own = text.replaceAll(`${engine}config/guard`, "").replaceAll(`${engine}state/guard`, "");
      assert.ok(!own.includes(engine), `${f} references a KAAL Engine`);
    }
  });

  it("guard/T31 [guard/A8, guard/N6]: the acceptance boundary is closed: its files import only Node built-ins and files inside it", () => {
    for (const f of files(HERE).filter((f) => f.endsWith(".mjs"))) {
      for (const s of specifiers(readFileSync(join(HERE, f), "utf8"))) {
        assert.ok(s.startsWith("node:") || (s.startsWith("./") && !s.includes("..")), `${f} imports ${s}, outside the boundary`);
      }
    }
  });

  // Written in guard/C13 before any code and marked todo with the Change that turns each GREEN (requirements.test.mjs).
  const RED = (change) => ({ todo: `RED until ${change}` });

  it("guard/T49 [guard/F21, guard/A15]: with --github, fail and cannot-judge annotations and the step summary name the Skill path, and a passing run's summary does not", RED("guard/C15"), () => {
    for (const [status, verdict] of [[1, "fail"], [2, "cannot judge"], [0, "pass"]]) {
      const c = consumer();
      c.checks({ x: { command: `node checks/exit.mjs ${status} evidence`, runs: ["ci"] } });
      c.commit("x");
      const summary = join(c.root, "summary.md");
      writeFileSync(summary, "");
      const r = c.guard(["run", "--check", "x", "--github"], { GITHUB_STEP_SUMMARY: summary });
      assert.equal(r.status, status, `${verdict}: the exit status changed`);
      const annotations = r.stdout.split(/\r?\n/).filter((l) => /^::(error|warning|notice)/.test(l));
      const step = readFileSync(summary, "utf8");
      if (status === 0) {
        assert.doesNotMatch(step, /skills[\\/]kaal-guard/, "a passing run's summary names the Skill");
        assert.deepEqual(annotations.filter((l) => /skills[\\/]kaal-guard/.test(l)), [], "a passing run's annotation names the Skill");
      } else {
        const errors = annotations.filter((l) => l.startsWith("::error"));
        assert.ok(errors.length > 0, `${verdict}: no error annotation`);
        for (const l of errors) assert.match(l, /skills[\\/]kaal-guard/, `${verdict}: an annotation does not name the Skill path: ${l}`);
        assert.match(step, /skills[\\/]kaal-guard/, `${verdict}: the step summary does not name the Skill path`);
      }
    }
  });

  it("guard/T58 [guard/F27, guard/A17]: contract.json and the lifecycle agree: every asset standalone init writes is in the contract, every one in the contract is written, and the contract names no supplier location beyond the canonical one", RED("guard/C14"), () => {
    present("contract.json");
    const contract = JSON.parse(source("contract.json"));
    const assets = contract.assets.map((a) => a.path.replace(/\/$/, ""));
    assert.ok(assets.includes(".agents/skills/kaal-guard"), "the contract has no Skill asset at the canonical location");
    const c = consumer();
    const before = c.files();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0, "init --hook --ci");
    // The record is the ownership record and the configuration directory is the consumer's (guard/F27), not assets.
    for (const p of c.files().filter((p) => !before.includes(p) && p !== RECORD && !p.startsWith(`${CONFIG}/`))) {
      assert.ok(assets.some((a) => p === a || p.startsWith(`${a}/`)), `init wrote ${p}, which the contract does not name`);
    }
    for (const a of assets) assert.ok(c.exists(a), `the contract names ${a}, which init --hook --ci did not write`);
    const text = JSON.stringify(contract);
    for (const supplier of [".claude/", ".github/skills", ".cursor/", ".codex/", ".gemini/", "CLAUDE.md", "AGENTS.md", "copilot-instructions"]) {
      assert.ok(!text.includes(supplier), `the contract names the supplier location ${supplier}`);
    }
  });
});
