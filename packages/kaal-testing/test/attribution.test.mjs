import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { foundation } from "kaal-core";
import { identify } from "kaal-graph";
import { readFile } from "@kaihacksai/kaal-hosting";
import { attribute, CLAIM_FILE, isClaimFile, KINDS, readClaim, scopeOf } from "kaal-testing/attribution";
import { inventory } from "kaal-testing/inventory";

const text = (s) => new TextEncoder().encode(s);
const json = (data) => text(JSON.stringify(data));
const claim = ({ kind, name, id }, paths) => json({ owner: { kind, name, id }, paths });
const lines = (n) => text("x\n".repeat(n));

// One owner of each CASE kind.
const A = { kind: "capability", name: "Alpha", id: "a".repeat(64) };
const B = { kind: "skill", name: "Beta", id: "b".repeat(64) };
const C = { kind: "agent", name: "Gamma", id: "c".repeat(64) };
const D = { kind: "extension", name: "Delta", id: "d".repeat(64) };

const files = inventory([
  { path: "alpha/a.js", bytes: lines(3) },
  { path: "alpha/ownership.kaal.json", bytes: lines(1) },
  { path: "alpha/beta/b.md", bytes: lines(2) },
  { path: "alpha/beta/ownership.kaal.json", bytes: lines(1) },
  { path: "alpha/logo.png", bytes: new Uint8Array([0x89, 0x00]) },
  { path: "alpha/package-lock.json", bytes: lines(7) },
  { path: "loose.txt", bytes: lines(5) },
]);

describe("ownership files", () => {
  it("are found by name, wherever they are, and declare the directory holding them as their scope", () => {
    assert.equal(CLAIM_FILE, "ownership.kaal.json");
    assert.ok(isClaimFile("ownership.kaal.json") && isClaimFile("packages/x/ownership.kaal.json"));
    assert.ok(!isClaimFile("packages/x/not-ownership.kaal.json") && !isClaimFile("ownership.kaal.json.bak"));
    assert.equal(scopeOf("packages/x/ownership.kaal.json"), "packages/x/");
    assert.equal(scopeOf("ownership.kaal.json"), "");
  });

  it("read as one typed owner, its CASE kind and exact { name, id }, and patterns within the file's scope", () => {
    assert.deepEqual(KINDS, ["capability", "agent", "skill", "extension"]);
    assert.deepEqual(readClaim("a/ownership.kaal.json", claim(A, ["a/", "a/README.md"])), { claim: { path: "a/ownership.kaal.json", owner: A, paths: ["a/", "a/README.md"] } });
    assert.deepEqual(readClaim("ownership.kaal.json", claim(D, ["README.md"])).claim.paths, ["README.md"]);
  });

  it("that do not read are verified failures naming the file, and claim nothing", () => {
    for (const bytes of [
      text("{"),
      new Uint8Array([0xff]),
      json(null),
      json({ owner: { name: "Alpha", id: A.id }, paths: ["x/"] }),
      json({ owner: { ...A, extra: 1 }, paths: ["x/"] }),
      json({ owner: { ...A, kind: "definition" }, paths: ["x/"] }),
      json({ owner: { ...A, kind: "Capability" }, paths: ["x/"] }),
      json({ owner: { ...A, id: "A".repeat(64) }, paths: ["x/"] }),
      json({ owner: { ...A, name: "" }, paths: ["x/"] }),
      json({ capability: { name: A.name, id: A.id }, paths: ["x/"] }),
      json({ owner: A, paths: ["x/"], extra: 1 }),
      claim(A, []),
      claim(A, ["/x/a"]),
      claim(A, ["x/../y"]),
      claim(A, ["x//a"]),
      claim(A, ["x\\a"]),
    ]) {
      const { finding } = readClaim("x/ownership.kaal.json", bytes);
      assert.equal(finding.kind, "verified failure");
      assert.equal(finding.subject, "x/ownership.kaal.json");
      assert.match(finding.evidence, /^ownership file /);
    }
  });

  it("refuse a pattern outside their own scope: an owner claims only within its own tree", () => {
    for (const pattern of ["y/", "README.md", "xy/a", "x"]) {
      assert.deepEqual(readClaim("x/ownership.kaal.json", claim(A, ["x/", pattern])).finding, {
        kind: "verified failure",
        subject: "x/ownership.kaal.json",
        evidence: `ownership file lists ${JSON.stringify(pattern)}, which is outside its scope x/`,
      });
    }
  });
});

describe("attribution", () => {
  it("gives a file claimed by exactly one owner to it, and leaves an unclaimed file unassigned", () => {
    const r = attribute(
      files,
      [
        { path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/a.js", "alpha/ownership.kaal.json", "alpha/logo.png", "alpha/package-lock.json"]) },
        { path: "alpha/beta/ownership.kaal.json", bytes: claim(B, ["alpha/beta/"]) },
      ],
      [A, B],
    );
    assert.deepEqual(
      r.owners.map(({ kind, name, files, lines, entries }) => ({ kind, name, files, lines, paths: entries.map((e) => e.path) })),
      [
        { kind: "capability", name: "Alpha", files: 4, lines: 4, paths: ["alpha/a.js", "alpha/logo.png", "alpha/ownership.kaal.json", "alpha/package-lock.json"] },
        { kind: "skill", name: "Beta", files: 2, lines: 3, paths: ["alpha/beta/b.md", "alpha/beta/ownership.kaal.json"] },
      ],
    );
    assert.deepEqual(r.unassigned.entries, [{ path: "loose.txt", lines: 5, reason: "unclaimed" }]);
    assert.deepEqual(r.findings, []);
  });

  it("attributes all four CASE kinds by the same rule, keeping the kind Core gives each, and reclassifies none", () => {
    const owners = [A, B, C, D];
    const tree = inventory(owners.map((o) => ({ path: `${o.name}/f.md`, bytes: lines(1) })));
    const r = attribute(tree, owners.map((o) => ({ path: `${o.name}/ownership.kaal.json`, bytes: claim(o, [`${o.name}/`]) })), owners);
    assert.deepEqual(
      r.owners.map(({ kind, name, files, lines }) => ({ kind, name, files, lines })),
      [A, B, D, C].map(({ kind, name }) => ({ kind, name, files: 1, lines: 1 })),
    );
    assert.throws(() => attribute(tree, [], [{ kind: "definition", name: "X", id: "e".repeat(64) }]), /not a CASE kind/);
  });

  it("reports a file claimed across kinds as an architectural concern naming every claimant, and attributes it to none", () => {
    // A Capability claims its whole tree; a Skill nested in it claims its own file, and so does an Extension from the root.
    const r = attribute(
      files,
      [
        { path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/"]) },
        { path: "alpha/beta/ownership.kaal.json", bytes: claim(B, ["alpha/beta/b.md"]) },
        { path: "ownership.kaal.json", bytes: claim(D, ["alpha/beta/b.md", "loose.txt"]) },
      ],
      [A, B, C, D],
    );
    assert.deepEqual(r.conflicts, { files: 1, lines: 2, entries: [{ path: "alpha/beta/b.md", lines: 2, claimants: [A, B, D] }] });
    assert.deepEqual(
      r.unassigned.entries.find((e) => e.path === "alpha/beta/b.md"),
      { path: "alpha/beta/b.md", lines: 2, reason: "conflicting claims" },
    );
    assert.ok(r.owners.every((o) => !o.entries.some((e) => e.path === "alpha/beta/b.md")));
    assert.deepEqual(r.findings, [
      { kind: "architectural concern", subject: "alpha/beta/b.md", evidence: `claimed by capability Alpha (${A.id}) and skill Beta (${B.id}) and extension Delta (${D.id}): not attributed until the claims are fixed` },
    ]);
    assert.deepEqual(r.owners.map(({ kind, name, files }) => ({ kind, name, files })), [
      { kind: "capability", name: "Alpha", files: 5 },
      { kind: "extension", name: "Delta", files: 1 },
    ]);
  });

  it("counts an owner claiming the same file twice once, not as a conflict", () => {
    const r = attribute(files, [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/", "alpha/a.js"]) }, { path: "alpha/beta/ownership.kaal.json", bytes: claim(A, ["alpha/beta/b.md"]) }], [A]);
    assert.deepEqual(r.conflicts.entries, []);
    assert.equal(r.owners[0].files, 6);
  });

  it("does not resolve a claim for no admitted CASE Node, for a Node by another name, or for a Node of another kind: its paths stay unassigned", () => {
    const r = attribute(
      files,
      [
        { path: "alpha/ownership.kaal.json", bytes: claim(C, ["alpha/a.js"]) },
        { path: "alpha/beta/ownership.kaal.json", bytes: claim({ ...B, name: "Bet" }, ["alpha/beta/"]) },
        { path: "ownership.kaal.json", bytes: claim({ ...A, kind: "skill" }, ["loose.txt"]) },
      ],
      [A, B],
    );
    assert.deepEqual(r.owners, []);
    assert.equal(r.unassigned.files, files.files);
    assert.deepEqual(r.findings, [
      { kind: "verified failure", subject: "alpha/beta/ownership.kaal.json", evidence: `claims for skill Bet (${B.id}), but that Node is named Beta: its paths stay unassigned` },
      { kind: "verified failure", subject: "alpha/ownership.kaal.json", evidence: `claims for agent Gamma (${C.id}), which is no admitted Capability, Agent, Skill or Extension Node: its paths stay unassigned` },
      { kind: "verified failure", subject: "ownership.kaal.json", evidence: `claims for skill Alpha (${A.id}), but Core types that Node as a capability: its paths stay unassigned` },
    ]);
  });

  it("reports a pattern matching no inventoried file as a stale claim, and still attributes the rest", () => {
    const r = attribute(files, [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/", "alpha/gone.js", "alpha/old/"]) }], [A]);
    assert.deepEqual(r.findings, [
      { kind: "potential defect", subject: "alpha/ownership.kaal.json", evidence: 'pattern "alpha/gone.js" matches no inventoried file: a stale claim' },
      { kind: "potential defect", subject: "alpha/ownership.kaal.json", evidence: 'pattern "alpha/old/" matches no inventoried file: a stale claim' },
    ]);
    assert.equal(r.owners[0].files, 6);
  });

  it("accounts for every inventoried line: attributed plus unassigned, with conflicts inside unassigned and binary and excluded files carrying none", () => {
    const claimFiles = [
      { path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/"]) },
      { path: "alpha/beta/ownership.kaal.json", bytes: claim(B, ["alpha/beta/"]) },
      { path: "x/ownership.kaal.json", bytes: text("{") },
    ];
    const r = attribute(files, claimFiles, [A, B]);
    assert.equal(r.metric, "non-blank text lines");
    assert.equal(r.lines, files.lines);
    assert.equal(r.owners.reduce((n, o) => n + o.lines, 0) + r.unassigned.lines, files.lines);
    assert.deepEqual([r.conflicts.lines, r.unassigned.lines], [3, 8]);
    assert.equal(r.owners.find((o) => o.name === "Alpha").lines, 4);
  });

  it("is deterministic: the order of ownership files and owners does not change the result", () => {
    const claimFiles = [
      { path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/"]) },
      { path: "alpha/beta/ownership.kaal.json", bytes: claim(B, ["alpha/beta/"]) },
      { path: "ownership.kaal.json", bytes: claim(D, ["loose.txt"]) },
    ];
    assert.deepEqual(attribute(files, claimFiles, [A, B, D]), attribute(files, [...claimFiles].reverse(), [D, B, A]));
  });
});

describe("Testing's own claim", () => {
  const PACKAGE = fileURLToPath(new URL("../", import.meta.url));

  it("names Testing's Capability Node, typed by Core's KAAL Capability, by its kind and exact name and id, and claims Testing's tree", async () => {
    const node = identify(await readFile(join(PACKAGE, "capability", "Testing.md")));
    assert.deepEqual(node.type, foundation().capability);
    const { claim: own } = readClaim("packages/skills/kaal-testing/ownership.kaal.json", await readFile(join(PACKAGE, CLAIM_FILE)));
    assert.deepEqual(own.owner, { kind: "capability", name: node.name, id: node.id });
    assert.deepEqual(own.paths, ["packages/skills/kaal-testing/"]);
  });
});
