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

/** The body rows of the first Markdown table in a text whose header opens with `first`, as trimmed cells. */
function rows(text, first) {
  const lines = text.split(/\r?\n/);
  const at = lines.findIndex((l) => l.startsWith(`| ${first} |`));
  if (at < 0) return { header: [], body: [] };
  const cells = (l) => l.slice(1, -1).split(/(?<!\\)\|/).map((c) => c.trim());
  const body = [];
  for (const l of lines.slice(at + 2)) {
    if (!l.startsWith("|")) break;
    body.push(cells(l));
  }
  return { header: cells(lines[at]), body };
}

/** The rows of a marked table in docs/testing.md, such as the allocations. */
const marked = (testing, begin, end) => {
  const from = testing.indexOf(begin);
  const to = testing.indexOf(end, from);
  return from < 0 || to < 0 ? [] : rows(testing.slice(from, to), testing.slice(from, to).split(/\r?\n/).find((l) => l.startsWith("| "))?.split("|")[1].trim() ?? "").body;
};

/**
 * The Defects in docs/limitations.md judged against the traces (guard/C123). A Test Case traces to a Defect by
 * citing it in its title; "Tested by" is the incoming view, derived from those traces and never authored: a
 * delivered case by its title, a publisher case by its allocation, a retired case by its entry among what no
 * delivered case verifies. Each finding names the Defect and the rule.
 */
function defects(limitations, testing, titles) {
  const findings = [];
  const { header, body } = rows(limitations, "Defect");
  const columns = ["Defect", "Prohibited behaviour", "Tested by", "Observed in Test Runs"];
  if (header.join("|") !== columns.join("|")) findings.push(`the Defect table's columns are ${header.join(", ") || "missing"}, not ${columns.join(", ")}`);
  const derived = {};
  const add = (d, realization, t) => (((derived[d] ??= {})[realization] ??= new Set()).add(t));
  for (const title of titles) {
    const t = title.match(/guard\/T\d+/)?.[0];
    for (const d of title.match(/guard\/D\d+/g) ?? []) add(d, "delivered", t);
  }
  for (const [realization, begin, end] of [["publisher", "<!-- allocated:", "<!-- end of allocated -->"], ["retired", "<!-- unverified:", "<!-- end of unverified -->"]]) {
    for (const [, ids, text] of marked(testing, begin, end)) {
      const ds = ids.match(/guard\/D\d+/g) ?? [];
      if (ds.length > 1) findings.push(`${ds.join(", ")}: one entry names several Defects, so their cases cannot be told apart`);
      for (const d of ds) for (const t of text.match(/guard\/T\d+/g) ?? []) add(d, realization, t);
    }
  }
  const view = (d) => ["delivered", "publisher", "retired"].filter((r) => derived[d]?.[r]).map((r) => `${r}: ${[...derived[d][r]].sort((a, b) => Number(a.slice(7)) - Number(b.slice(7))).join(", ")}`).join("; ");
  const listed = new Set();
  for (const [d, behaviour, testedBy, observed] of body) {
    listed.add(d);
    if (!/^guard\/D\d+$/.test(d)) findings.push(`${d}: not a Defect identifier`);
    if (!behaviour) findings.push(`${d}: states no prohibited behaviour`);
    if (!derived[d]) findings.push(`${d}: no Test Case traces to it`);
    else if (testedBy !== view(d)) findings.push(`${d}: Tested by is "${testedBy}", not the view derived from the traces, "${view(d)}"`);
    for (const part of (observed ?? "").split(";")) {
      if (/\b(RED|GREEN)\b/.test(part) && !/`\d+\.\d+\.\d+`/.test(part)) findings.push(`${d}: an observation names no version: ${part.trim()}`);
    }
    if (!/\bRED\b/.test(observed ?? "")) findings.push(`${d}: records no observed RED`);
  }
  for (const d of Object.keys(derived)) if (!listed.has(d)) findings.push(`${d}: a case traces to it, but the Defect table does not define it`);
  return findings;
}

/**
 * What an Architecture leaves unplaced: each guard/F and guard/N the Requirements define that no element cites,
 * and each module in lib/ that no element, or more than one, names as `lib/<module>`.
 */
function placement(architecture, requirements, modules) {
  const elements = architecture
    .split(/^(?=- \*\*guard\/A\d+\b|## )/m)
    .filter((e) => /^- \*\*guard\/A\d+\b/.test(e))
    .map((e) => ({ id: e.match(/guard\/A\d+/)[0], text: e, cites: e.match(/\[([^\]]*)\]/)?.[1] ?? "" }));
  const cited = new Set();
  for (const { cites } of elements) {
    // A range, "guard/F31–guard/F36", cites every identifier in it.
    for (const m of cites.matchAll(/guard\/([FN])(\d+)(?:–guard\/[FN](\d+))?/g)) {
      for (let n = Number(m[2]); n <= Number(m[3] ?? m[2]); n++) cited.add(`guard/${m[1]}${n}`);
    }
  }
  const defined = [...new Set([...requirements.matchAll(/^(?:- )?\*\*(guard\/[FN]\d+)\b/gm)].map((m) => m[1]))];
  return {
    uncited: defined.filter((id) => !cited.has(id)),
    modules: modules
      .map((m) => ({ module: m, elements: elements.filter((e) => e.text.includes(`lib/${m}`)).map((e) => e.id) }))
      .filter((m) => m.elements.length !== 1),
  };
}

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

  it("guard/T49 [guard/F21, guard/A15]: with --github, fail and cannot-judge annotations and the step summary name the Skill path, and a passing run's summary does not", () => {
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

  it("guard/T58 [guard/F27, guard/A17]: contract.json and the lifecycle agree: every asset standalone init writes is in the contract, every one in the contract is written, and the contract names no supplier location beyond the canonical one", () => {
    present("contract.json");
    const contract = JSON.parse(source("contract.json"));
    // Core's Installation Contract format names an asset's location `target` (guard/C51); `path` until then.
    const assets = contract.assets.map((a) => (a.target ?? a.path).replace(/\/$/, ""));
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

  it("guard/T107 [guard/I9, guard/F37, guard/A19]: the package carries docs/ with Intent, Requirements, Architecture, Testing and Limitations; every identifier a delivered case cites is defined there; and no document there cites an Engineering path or a Change as its authority", () => {
    const parts = ["intent.md", "requirements.md", "architecture.md", "testing.md", "limitations.md"];
    for (const part of parts) assert.ok(existsSync(join(PACKAGE, "docs", part)), `the package carries no docs/${part}`);
    assert.ok(JSON.parse(source("package.json")).files.includes("docs"), "the package does not ship docs/");
    const docs = parts.map((part) => source(`docs/${part}`)).join("\n");
    // A definition opens its line in bold: "**guard/F1 Check list.**" or "- **guard/A1 Check list**".
    const defined = new Set([...docs.matchAll(/^(?:- )?\*\*(guard\/[IFNA]\d+)\b/gm)].map((m) => m[1]));
    // The trace defines each delivered case as a row of its own: "| guard/T61 | ...", and Limitations each Defect: "| guard/D1 | ...".
    for (const m of docs.matchAll(/^\| (guard\/[TD]\d+) \|/gm)) defined.add(m[1]);
    const cited = new Set();
    for (const file of readdirSync(HERE).filter((f) => f.endsWith(".test.mjs"))) {
      for (const m of readFileSync(join(HERE, file), "utf8").matchAll(/\b(?:describe|it|test)\(\s*"([^"]*)"/g)) {
        for (const id of m[1].match(/guard\/[IFNATD]\d+/g) ?? []) cited.add(id);
      }
    }
    assert.ok(cited.size > 0, "no delivered case cites an identifier");
    assert.deepEqual([...cited].filter((id) => !defined.has(id)).sort(), [], "delivered cases cite identifiers docs/ does not define");
    assert.deepEqual(docs.match(/engineering\/|guard\/C\d+|\]\(\.\.\//g) ?? [], [], "docs/ cites an Engineering path, a Change, or a document outside the package");
  });

  it("guard/T126 [guard/F37, guard/A19, guard/A21]: every Requirement is cited by an Architecture element, every module in lib/ is named by exactly one element, a module that two elements name is refused, and the runner, the lifecycle and the GitHub adapter all read declarations through lib/config.mjs", () => {
    present("docs/architecture.md");
    const architecture = source("docs/architecture.md");
    const requirements = source("docs/requirements.md");
    const modules = readdirSync(join(PACKAGE, "lib")).filter((f) => f.endsWith(".mjs")).sort();
    const found = placement(architecture, requirements, modules);
    assert.deepEqual(found.uncited, [], "Requirements no Architecture element cites");
    assert.deepEqual(found.modules, [], "modules in lib/ that no element, or more than one, names");
    for (const m of ["runner.mjs", "lifecycle.mjs", "github.mjs"]) {
      assert.ok(specifiers(source(`lib/${m}`)).includes("./config.mjs"), `lib/${m} does not read declarations through lib/config.mjs`);
    }
    // The negative fixture: a copy in which a second element, guard/A4, also names the runner's module.
    const duplicate = architecture.replace(/^(- \*\*guard\/A4 [^\n]*)$/m, "$1 It also holds `lib/runner.mjs`.");
    assert.notEqual(duplicate, architecture, "the fixture did not change the copy");
    assert.deepEqual(placement(duplicate, requirements, modules).modules.filter((m) => m.module === "runner.mjs"), [{ module: "runner.mjs", elements: ["guard/A3", "guard/A4"] }], "a module two elements name is not refused");
  });

  it("guard/T127 [guard/I9, guard/F37, guard/A19]: every Defect states a prohibited behaviour, has no status, records each observed RED and GREEN with its version, is tested by at least one case, and its Tested by is the view derived from the cases' traces by realization; a Tested by that names a case not citing its Defect is refused", () => {
    present("docs/limitations.md");
    const limitations = source("docs/limitations.md");
    const testing = source("docs/testing.md");
    const titles = [];
    for (const dir of ["test/acceptance", "test/unit"]) {
      for (const file of readdirSync(join(PACKAGE, dir)).filter((f) => f.endsWith(".test.mjs"))) {
        for (const m of readFileSync(join(PACKAGE, dir, file), "utf8").matchAll(/\b(?:describe|it|test)\(\s*"([^"]*)"/g)) titles.push(m[1]);
      }
    }
    assert.deepEqual(defects(limitations, testing, titles), [], "the Defects do not follow their traces");
    // The negative fixture: a copy whose Tested by for guard/D5 names guard/T94, which does not cite guard/D5.
    const wrong = limitations.replace(/^(\| guard\/D5 \|[^|]*\| )delivered: guard\/T81( \|)/m, "$1delivered: guard/T94$2");
    assert.notEqual(wrong, limitations, "the fixture did not change the copy");
    assert.ok(defects(wrong, testing, titles).some((f) => f.startsWith("guard/D5: Tested by")), "a Tested by that names a case not citing its Defect is not refused");
  });
});
