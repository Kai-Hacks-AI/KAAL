// testing/C24 planned outer tests: ownership claims as Markdown with validated frontmatter.
// Immutable to DO and CHECK; testing/C25 turns them GREEN. Each title names the
// contracts it checks (plan/ownership/*.md). They use kaal-testing's public interface,
// and Core's frontmatter validator as the reference Testing's reading is never looser than.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validate } from "kaal-core/frontmatter";
import * as attribution from "kaal-testing/attribution";
import { inventory } from "kaal-testing/inventory";

const { attribute, readClaim } = attribution;
const text = (s) => new TextEncoder().encode(s);
const lines = (n) => text("x\n".repeat(n));
const A = { kind: "capability", name: "Alpha", id: "a".repeat(64) };
const B = { kind: "skill", name: "Beta", id: "b".repeat(64) };

/** A Markdown claim: `fields` replaces or, with undefined, removes frontmatter lines; `body` is the prose. */
function md({ kind, name, id }, paths, { fields = {}, body = "Alpha's own tree, as Alpha states it.\n" } = {}) {
  const lines = {
    type: "type: Testing/Ownership",
    kind: `kind: ${kind}`,
    owner: `owner:\n  name: ${name}\n  id: ${id}`,
    paths: `paths:\n${paths.map((p) => `  - ${p}`).join("\n")}`,
  };
  for (const [k, v] of Object.entries(fields)) if (v === undefined) delete lines[k]; else lines[k] = v;
  return text(`---\n${Object.values(lines).join("\n")}\n---\n\n${body}`);
}
const json = ({ kind, name, id }, paths) => text(JSON.stringify({ owner: { kind, name, id }, paths }));

/** kaal-testing/attribution's Markdown claim support, or the reason the tests are blocked before any behavioural assertion. */
function markdown() {
  if (attribution.CLAIM_FILE !== "ownership.kaal.md") assert.fail(`blocked before behavioural assertion: kaal-testing/attribution's CLAIM_FILE is ${JSON.stringify(attribution.CLAIM_FILE)}, not ownership.kaal.md`);
  if (typeof attribution.TYPES?.["Testing/Ownership"] !== "object") assert.fail("blocked before behavioural assertion: kaal-testing/attribution exports no Testing/Ownership Type");
  return attribution;
}

describe("Ownership claims as Markdown (testing/C24)", () => {
  it("testing/T45 [testing/F35, testing/A16]: a claim is ownership.kaal.md, typed Testing/Ownership, with kind, owner and paths in frontmatter and its prose in the body; it reads as the JSON claim did, and its body never changes the result", () => {
    const { isClaimFile, scopeOf } = markdown();
    assert.ok(isClaimFile("ownership.kaal.md") && isClaimFile("packages/x/ownership.kaal.md"));
    assert.ok(!isClaimFile("packages/x/ownership.md") && !isClaimFile("packages/x/ownership.kaal.md.bak"));
    assert.equal(scopeOf("packages/x/ownership.kaal.md"), "packages/x/");
    const want = { claim: { path: "alpha/ownership.kaal.md", owner: A, paths: ["alpha", "alpha/README.md"] } };
    assert.deepEqual(readClaim("alpha/ownership.kaal.md", md(A, ["alpha", "alpha/README.md"])), want);
    assert.deepEqual(readClaim("alpha/ownership.kaal.md", md(A, ["alpha", "alpha/README.md"], { body: "Anything at all.\n\n- even a list: of: colons\n" })), want);
  });

  it("testing/T46 [testing/F36]: a path covers the file it names, or everything beneath the directory it names; it never covers a sibling sharing its prefix", () => {
    markdown();
    const files = inventory([
      { path: "alpha/a.js", bytes: lines(3) },
      { path: "alpha/ownership.kaal.md", bytes: lines(1) },
      { path: "alpha/beta/b.md", bytes: lines(2) },
      { path: "alphabet/c.js", bytes: lines(4) },
    ]);
    const r = attribute(files, [{ path: "alpha/ownership.kaal.md", bytes: md(A, ["alpha"]) }, { path: "alpha/beta/ownership.kaal.md", bytes: md(B, ["alpha/beta/b.md"]) }], [A, B]);
    assert.deepEqual(r.owners.map((o) => [o.name, o.entries.map((e) => e.path)]), [["Alpha", ["alpha/a.js", "alpha/ownership.kaal.md"]]]);
    assert.deepEqual(r.conflicts.entries.map((e) => e.path), ["alpha/beta/b.md"], "a directory path covers its nested files, so Alpha and Beta both claim b.md");
    assert.deepEqual(r.unassigned.entries.filter((e) => e.reason === "unclaimed").map((e) => e.path), ["alphabet/c.js"]);
  });

  it("testing/T47 [testing/F37]: a Markdown claim that does not conform to Testing/Ownership is a verified failure naming the file, one with no Testing/Ownership type is unknown, and neither attributes anything", () => {
    markdown();
    const bad = {
      "an undeclared key": { fields: { scope: "scope: alpha" } },
      "a prose key": { fields: { description: "description: Alpha's files" } },
      "no kind": { fields: { kind: undefined } },
      "no owner": { fields: { owner: undefined } },
      "no paths": { fields: { paths: undefined } },
      "a kind that is not a CASE kind": { fields: { kind: "kind: team" } },
      "an owner that is not a ref": { fields: { owner: "owner: Alpha" } },
      "an owner with an extra key": { fields: { owner: `owner:\n  name: Alpha\n  id: ${"a".repeat(64)}\n  kind: capability` } },
      "a trailing slash": { fields: { paths: "paths:\n  - alpha/" } },
      "a parent segment": { fields: { paths: "paths:\n  - alpha/../beta" } },
      "a single path, not a list": { fields: { paths: "paths: alpha" } },
      "a path outside its scope": { fields: { paths: "paths:\n  - beta/b.md" } },
    };
    for (const [why, opts] of Object.entries(bad)) {
      const r = readClaim("alpha/ownership.kaal.md", md(A, ["alpha"], opts));
      assert.equal(r.claim, undefined, why);
      assert.equal(r.finding?.kind, "verified failure", why);
      assert.equal(r.finding.subject, "alpha/ownership.kaal.md", why);
    }
    for (const [why, bytes] of Object.entries({ "no frontmatter": text("# Alpha\n"), "a JSON body": json(A, ["alpha/"]), "not UTF-8": new Uint8Array([0xff]) })) {
      assert.equal(readClaim("alpha/ownership.kaal.md", bytes).finding?.kind, "verified failure", why);
    }
    for (const fields of [{ type: undefined }, { type: "type: Guard/Check" }]) {
      const r = readClaim("alpha/ownership.kaal.md", md(A, ["alpha"], { fields }));
      assert.equal(r.claim, undefined);
      assert.equal(r.finding?.kind, "unknown", JSON.stringify(fields));
    }
    const files = inventory([{ path: "alpha/a.js", bytes: lines(3) }]);
    const r = attribute(files, [{ path: "alpha/ownership.kaal.md", bytes: md(A, ["alpha"], { fields: { type: undefined } }) }], [A]);
    assert.deepEqual([r.owners, r.unassigned.lines], [[], 3]);
  });

  it("testing/T48 [testing/F38]: until the last claim moves, a JSON claim still reads as before; a directory holding both an ownership.kaal.md and an ownership.kaal.json is a verified failure, and neither attributes", () => {
    const { isClaimFile } = markdown();
    assert.ok(isClaimFile("alpha/ownership.kaal.json"), "the JSON claim is still found by its name");
    assert.deepEqual(readClaim("alpha/ownership.kaal.json", json(A, ["alpha/"])), { claim: { path: "alpha/ownership.kaal.json", owner: A, paths: ["alpha/"] } });
    assert.equal(readClaim("alpha/ownership.kaal.json", json(A, ["alpha/", "alpha"])).finding?.kind, "verified failure", "a JSON claim keeps its own pattern rules: its directory is written with a trailing /");
    const j = attribute(inventory([{ path: "alpha/b/c.js", bytes: lines(1) }]), [{ path: "alpha/ownership.kaal.json", bytes: json(A, ["alpha/b"]) }], [A]);
    assert.deepEqual([j.owners, j.unassigned.lines], [[], 1], "a JSON pattern without a trailing / names a file only");
    const files = inventory([{ path: "alpha/a.js", bytes: lines(3) }, { path: "beta/b.js", bytes: lines(2) }]);
    const both = attribute(
      files,
      [
        { path: "alpha/ownership.kaal.md", bytes: md(A, ["alpha"]) },
        { path: "alpha/ownership.kaal.json", bytes: json(A, ["alpha/"]) },
        { path: "beta/ownership.kaal.json", bytes: json(B, ["beta/"]) },
      ],
      [A, B],
    );
    assert.deepEqual(both.owners.map((o) => o.name), ["Beta"], "a lone JSON claim attributes; the doubled directory does not");
    const doubled = both.findings.filter((f) => f.kind === "verified failure").map((f) => f.subject).sort();
    assert.deepEqual(doubled, ["alpha/ownership.kaal.json", "alpha/ownership.kaal.md"]);
  });

  it("testing/T49 [testing/F39, testing/A16]: Testing's reading is never looser than Core's: every Markdown claim it reads is valid under kaal-core/frontmatter with Testing's Type, and every one Core finds invalid or unknown, Testing refuses", () => {
    const { TYPES } = markdown();
    const cases = [
      md(A, ["alpha"]),
      md(B, ["alpha/b.md", "alpha/c"]),
      md(A, ["alpha"], { fields: { scope: "scope: alpha" } }),
      md(A, ["alpha"], { fields: { kind: "kind: team" } }),
      md(A, ["alpha"], { fields: { paths: "paths:\n  - alpha/" } }),
      md(A, ["alpha"], { fields: { paths: "paths: []" } }),
      md(A, ["alpha"], { fields: { type: undefined } }),
      md(A, ["alpha"], { fields: { owner: `owner:\n  name: Alpha\n  id: ${"A".repeat(64)}` } }),
      md(A, ["alpha"], { fields: { kind: "kind: [capability]" } }),
      md(A, ["alpha"], { fields: { notes: "notes: kept by Alpha" } }),
    ];
    for (const bytes of cases) {
      const core = validate(bytes, TYPES).verdict;
      const read = readClaim("alpha/ownership.kaal.md", bytes);
      if (read.claim) assert.equal(core, "valid", new TextDecoder().decode(bytes));
      if (core !== "valid") assert.ok(read.finding, new TextDecoder().decode(bytes));
    }
  });
});
