// change/C9 planned outer tests: what a Change changes, and its selected scope.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/scope/*.md). They use kaal-change's public
// interface and its shipped Definitions, and build Nodes with Graph.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createNode, identify } from "kaal-graph";

const CAPABILITY = fileURLToPath(new URL("../../capability/", import.meta.url));

/** `assess` from kaal-change/delivery, or the reason the tests are blocked before any behavioural assertion. */
async function assessor() {
  let mod;
  try {
    mod = await import("kaal-change/delivery");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-change exports no ./delivery (${e.code ?? e.message})`);
  }
  assert.equal(typeof mod.assess, "function", "blocked before behavioural assertion: kaal-change/delivery exports no assess");
  return mod.assess;
}

/** What every test needs: assess, the Change Definition, and a Change Node builder. */
async function fixture() {
  const assess = await assessor();
  const path = CAPABILITY + "Change-Definition.md";
  assert.ok(existsSync(path), "blocked before behavioural assertion: kaal-change ships no capability/Change-Definition.md");
  const definition = identify(readFileSync(path));
  /** A Change Node named `name` with the given frontmatter. */
  const change = (name, frontmatter = {}) =>
    identify(createNode({ name, type: { name: definition.name, id: definition.id }, frontmatter, body: `# ${name}\n` }).bytes);
  return { assess, definition, change };
}

/** The findings of a kind about a Change. */
const about = (findings, kind, change) => findings.filter((f) => f.kind === kind && f.change === change);

describe("What a Change changes, and its selected scope (change/C9)", () => {
  it("change/T36 [change/I16, change/I17, change/F33, change/F34, change/F36]: a Change states what it changes and its selected scope; the views and the exchange give both sorted, and nothing when not stated", async () => {
    const { assess, definition, change } = await fixture();
    const stated = change("hosting/C11", { alters: ["hosting/F31", "hosting/A9"], scope: ["testing", "hosting", "core"] });
    const silent = change("hosting/C12");
    const r = assess([definition, stated, silent]);
    assert.equal(typeof r.alters, "function", "assess gives an alters view");
    assert.equal(typeof r.scope, "function", "and a scope view");
    assert.deepEqual(r.alters("hosting/C11"), ["hosting/A9", "hosting/F31"], "the elements it changes, sorted");
    assert.deepEqual(r.scope("hosting/C11"), ["core", "hosting", "testing"], "the capabilities it selects, sorted");
    assert.equal(r.alters("hosting/C12"), undefined, "a Change that states nothing has stated nothing");
    assert.equal(r.scope("hosting/C12"), undefined, "and no scope is invented for it");
    const data = r.exchange();
    const [eleven, twelve] = data.changes;
    assert.deepEqual(eleven.alters, ["hosting/A9", "hosting/F31"]);
    assert.deepEqual(eleven.scope, ["core", "hosting", "testing"]);
    assert.ok(!("alters" in twelve) && !("scope" in twelve), "the exchange omits what is not stated");
    assert.deepEqual(data.findings, [], "well-formed statements are no finding");
  });

  it("change/T37 [change/F33, change/F35]: a malformed alters, whether empty, not a list, a path, a URL, a pull request or a repeat, is a finding, and the statement is withheld whole", async () => {
    const { assess, definition, change } = await fixture();
    const cases = {
      "sample/C1": [],
      "sample/C2": "hosting/F31",
      "sample/C3": ["hosting/F31", "packages/extensions/kaal-hosting/package.json"],
      "sample/C4": ["hosting/F31", "https://github.com/Kai-Hacks-AI/KAAL/pull/657"],
      "sample/C5": ["hosting/F31", "#657"],
      "sample/C6": ["hosting/F31", "hosting/F31"],
      "sample/C7": ["hosting/F31", 31],
      "sample/C8": ["hosting/F31", "hosting"],
    };
    const r = assess([definition, ...Object.entries(cases).map(([name, alters]) => change(name, { alters }))]);
    for (const name of Object.keys(cases)) {
      assert.equal(about(r.findings, "malformed-alters", name).length > 0, true, `${name}'s alters is a malformed-alters finding`);
      assert.equal(r.alters(name), undefined, `and ${name}'s statement is withheld whole, never given in part`);
      assert.ok(!("alters" in r.exchange().changes.find((c) => c.identity === name)), `and the exchange omits it for ${name}`);
      assert.equal(r.has(name), true, `${name} is still a walked Change`);
    }
  });

  it("change/T38 [change/I17, change/F34, change/F35]: a scope entry that is a path, a pull request, a Change identity or a repeat, or an empty scope, is a finding, and the scope is withheld whole, never narrowed", async () => {
    const { assess, definition, change } = await fixture();
    const cases = {
      "sample/C1": [],
      "sample/C2": "hosting",
      "sample/C3": ["hosting", "packages/extensions/kaal-hosting/"],
      "sample/C4": ["hosting", "package.json"],
      "sample/C5": ["hosting", "#657"],
      "sample/C6": ["hosting", "657"],
      "sample/C7": ["hosting", "hosting/C11"],
      "sample/C8": ["hosting", "hosting"],
      "sample/C9": ["hosting", "Hosting"],
    };
    const r = assess([definition, ...Object.entries(cases).map(([name, scope]) => change(name, { scope }))]);
    for (const name of Object.keys(cases)) {
      assert.equal(about(r.findings, "malformed-scope", name).length > 0, true, `${name}'s scope is a malformed-scope finding`);
      assert.equal(r.scope(name), undefined, `and ${name}'s scope is withheld whole, so it is never narrowed to its well-formed entries`);
      assert.ok(!("scope" in r.exchange().changes.find((c) => c.identity === name)), `and the exchange omits it for ${name}`);
    }
  });

  it("change/T39 [change/F33, change/F34, change/F37, change/N8]: Change neither resolves an element nor judges a scope; nothing in the result claims isolation or admission, and delivery is unchanged", async () => {
    const { assess, definition, change } = await fixture();
    const requires = ["sample/T1"];
    const plain = change("sample/C1", { requires });
    const stated = change("sample/C2", { requires, alters: ["nobody/F999"], scope: ["nobody", "elsewhere"] });
    const broken = change("sample/C3", { requires, alters: ["not an element"], scope: ["not/a/scope"] });
    const evidence = { by: "selector", evaluations: [{ run: "run-1", plan: "plan-1", result: "passed", cases: { "sample/T1": "passed" }, findings: [] }] };
    const r = assess([definition, plain, stated, broken], { evidence });
    assert.deepEqual(r.alters("sample/C2"), ["nobody/F999"], "an element no Node defines is stated as given");
    assert.deepEqual(r.scope("sample/C2"), ["elsewhere", "nobody"], "a capability Change does not know is stated as given");
    assert.deepEqual(about(r.findings, "malformed-alters", "sample/C2").concat(about(r.findings, "malformed-scope", "sample/C2")), [], "and neither is a finding of Change's");
    for (const name of ["sample/C1", "sample/C2", "sample/C3"]) {
      assert.equal(r.delivery(name).delivered, true, `${name} is delivered on its evidence alone: a statement, even a malformed one, never holds it`);
    }
    const text = JSON.stringify(r.exchange());
    for (const word of ["isolated", "admitted", "impact", "inScope", "paths"]) assert.ok(!text.includes(`"${word}"`), `nothing claims ${word}`);
  });

  it("change/T40 [change/F36]: the exchange with alters and scope is byte-identical in any order, and its findings are sorted", async () => {
    const { assess, definition, change } = await fixture();
    const nodes = [
      definition,
      change("sample/C2", { alters: ["b/F2", "a/F1"], scope: ["b", "a"] }),
      change("sample/C1", { alters: ["a/F1", "a/F1"], scope: ["a/b"] }),
      change("sample/C3", { scope: [] }),
    ];
    const data = assess(nodes).exchange();
    assert.equal(JSON.stringify(assess([...nodes].reverse()).exchange()), JSON.stringify(data), "byte-identical in any order");
    const keys = data.findings.map((f) => `${f.kind} ${f.change} ${JSON.stringify(f)}`);
    assert.deepEqual(keys, [...keys].sort(), "findings are sorted by kind, then change, then their JSON");
    assert.deepEqual(data.findings.map((f) => f.kind).filter((k, i, a) => a.indexOf(k) === i), ["malformed-alters", "malformed-scope"]);
  });
});
