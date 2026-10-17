import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { foundation, identify } from "kaal-core";
import { readFile } from "kaal-hosting";
import { attribute, CLAIM_FILE, isClaimFile, readClaim } from "kaal-testing/attribution";
import { inventory } from "kaal-testing/inventory";

const text = (s) => new TextEncoder().encode(s);
const claim = (capability, paths, extra = {}) => text(JSON.stringify({ capability, paths, ...extra }));
const lines = (n) => text("x\n".repeat(n));

const A = { name: "Alpha", id: "a".repeat(64) };
const B = { name: "Beta", id: "b".repeat(64) };
const C = { name: "Gamma", id: "c".repeat(64) };

const files = inventory([
  { path: "alpha/a.js", bytes: lines(3) },
  { path: "alpha/ownership.kaal.json", bytes: lines(1) },
  { path: "beta/b.md", bytes: lines(2) },
  { path: "shared/s.js", bytes: lines(4) },
  { path: "loose.txt", bytes: lines(5) },
  { path: "alpha/logo.png", bytes: new Uint8Array([0x89, 0x00]) },
  { path: "alpha/package-lock.json", bytes: lines(7) },
]);

describe("ownership files", () => {
  it("are found by name, wherever they are", () => {
    assert.equal(CLAIM_FILE, "ownership.kaal.json");
    assert.ok(isClaimFile("ownership.kaal.json") && isClaimFile("packages/x/ownership.kaal.json"));
    assert.ok(!isClaimFile("packages/x/not-ownership.kaal.json") && !isClaimFile("ownership.kaal.json.bak"));
  });

  it("read as a capability named by exactly { name, id } and repository-relative path patterns", () => {
    assert.deepEqual(readClaim("a/ownership.kaal.json", claim(A, ["a/", "README.md"])), { claim: { path: "a/ownership.kaal.json", capability: A, paths: ["a/", "README.md"] } });
  });

  it("that do not read are verified failures naming the file, and claim nothing", () => {
    const evidence = (bytes) => readClaim("x/ownership.kaal.json", bytes).finding;
    for (const bytes of [
      text("{"),
      new Uint8Array([0xff]),
      claim({ name: "Alpha" }, ["a/"]),
      claim({ ...A, extra: 1 }, ["a/"]),
      claim({ name: "Alpha", id: "A".repeat(64) }, ["a/"]),
      claim(A, []),
      claim(A, ["/abs"]),
      claim(A, ["a/../b"]),
      claim(A, ["a//b"]),
      claim(A, ["a\\b"]),
      claim(A, ["a/"], { owner: "x" }),
    ]) {
      const finding = evidence(bytes);
      assert.equal(finding.kind, "verified failure");
      assert.equal(finding.subject, "x/ownership.kaal.json");
      assert.match(finding.evidence, /^ownership file /);
    }
  });
});

describe("attribution", () => {
  it("gives a file claimed by exactly one capability to it, and leaves an unclaimed file unassigned", () => {
    const r = attribute(files, [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/"]) }, { path: "beta/ownership.kaal.json", bytes: claim(B, ["beta/b.md"]) }], [A, B]);
    assert.deepEqual(
      r.capabilities.map(({ name, files, lines, entries }) => ({ name, files, lines, paths: entries.map((e) => e.path) })),
      [
        { name: "Alpha", files: 4, lines: 4, paths: ["alpha/a.js", "alpha/logo.png", "alpha/ownership.kaal.json", "alpha/package-lock.json"] },
        { name: "Beta", files: 1, lines: 2, paths: ["beta/b.md"] },
      ],
    );
    assert.deepEqual(r.unassigned.entries, [
      { path: "loose.txt", lines: 5, reason: "unclaimed" },
      { path: "shared/s.js", lines: 4, reason: "unclaimed" },
    ]);
    assert.deepEqual(r.findings, []);
  });

  it("reports a file claimed by two capabilities as an architectural concern naming both, and attributes it to neither", () => {
    const r = attribute(files, [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/", "shared/"]) }, { path: "beta/ownership.kaal.json", bytes: claim(B, ["beta/", "shared/s.js"]) }], [A, B]);
    assert.deepEqual(r.conflicts, { files: 1, lines: 4, entries: [{ path: "shared/s.js", lines: 4, claimants: [A, B] }] });
    assert.deepEqual(r.unassigned.entries.find((e) => e.path === "shared/s.js"), { path: "shared/s.js", lines: 4, reason: "conflicting claims" });
    assert.ok(r.capabilities.every((c) => !c.entries.some((e) => e.path === "shared/s.js")));
    assert.deepEqual(r.findings, [{ kind: "architectural concern", subject: "shared/s.js", evidence: `claimed by Alpha (${A.id}) and Beta (${B.id}): not attributed until the claims are fixed` }]);
  });

  it("counts a capability claiming the same file twice once, not as a conflict", () => {
    const r = attribute(files, [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/", "alpha/a.js"]) }, { path: "alpha/more/ownership.kaal.json", bytes: claim(A, ["alpha/a.js"]) }], [A]);
    assert.deepEqual(r.conflicts.entries, []);
    assert.equal(r.capabilities[0].files, 4);
  });

  it("does not resolve a claim for no admitted Capability Node, or for a Node by the wrong name: its paths stay unassigned", () => {
    const r = attribute(files, [{ path: "alpha/ownership.kaal.json", bytes: claim(C, ["alpha/"]) }, { path: "beta/ownership.kaal.json", bytes: claim({ name: "Bet", id: B.id }, ["beta/"]) }], [A, B]);
    assert.deepEqual(r.capabilities, []);
    assert.equal(r.unassigned.files, files.files);
    assert.deepEqual(r.findings, [
      { kind: "verified failure", subject: "alpha/ownership.kaal.json", evidence: `claims for Gamma (${C.id}), which is no admitted Capability Node: its paths stay unassigned` },
      { kind: "verified failure", subject: "beta/ownership.kaal.json", evidence: `claims for Bet, but Capability Node ${B.id} is named Beta: its paths stay unassigned` },
    ]);
  });

  it("reports a pattern matching no inventoried file as a stale claim, and still attributes the rest", () => {
    const r = attribute(files, [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/", "alpha/gone.js", "old/"]) }], [A]);
    assert.deepEqual(r.findings, [
      { kind: "potential defect", subject: "alpha/ownership.kaal.json", evidence: 'pattern "alpha/gone.js" matches no inventoried file: a stale claim' },
      { kind: "potential defect", subject: "alpha/ownership.kaal.json", evidence: 'pattern "old/" matches no inventoried file: a stale claim' },
    ]);
    assert.equal(r.capabilities[0].files, 4);
  });

  it("accounts for every inventoried line: attributed plus unassigned, with conflicts inside unassigned and binary and excluded files carrying none", () => {
    const claimFiles = [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/", "shared/"]) }, { path: "beta/ownership.kaal.json", bytes: claim(B, ["shared/"]) }, { path: "x/ownership.kaal.json", bytes: text("{") }];
    const r = attribute(files, claimFiles, [A, B]);
    assert.equal(r.metric, "non-blank text lines");
    assert.equal(r.lines, files.lines);
    assert.equal(r.capabilities.reduce((n, c) => n + c.lines, 0) + r.unassigned.lines, files.lines);
    assert.ok(r.conflicts.lines <= r.unassigned.lines);
    assert.equal(r.capabilities.find((c) => c.name === "Alpha").lines, 4);
  });

  it("is deterministic: the order of ownership files and capabilities does not change the result", () => {
    const claimFiles = [{ path: "alpha/ownership.kaal.json", bytes: claim(A, ["alpha/", "shared/"]) }, { path: "beta/ownership.kaal.json", bytes: claim(B, ["beta/", "shared/"]) }];
    assert.deepEqual(attribute(files, claimFiles, [A, B]), attribute(files, [...claimFiles].reverse(), [B, A]));
  });
});

describe("Testing's own claim", () => {
  const PACKAGE = fileURLToPath(new URL("../", import.meta.url));

  it("names Testing's Capability Node, typed by Core's KAAL Capability, by its exact name and id, and claims Testing's tree", async () => {
    const node = identify(await readFile(join(PACKAGE, "capability", "Testing.md")));
    assert.deepEqual(node.type, foundation().capability);
    const { claim: own } = readClaim("packages/skills/kaal-testing/ownership.kaal.json", await readFile(join(PACKAGE, CLAIM_FILE)));
    assert.deepEqual(own.capability, { name: node.name, id: node.id });
    assert.deepEqual(own.paths, ["packages/skills/kaal-testing/"]);
  });
});
