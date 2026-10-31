// The Intent loop: each case checks that an outcome Hosting intends holds for a consumer, against the
// installed package, reached by its name (docs/intent.md).
import assert from "node:assert/strict";
import { existsSync, lstatSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { manifest, NAME, node, PACKAGE, sha, tmp, tree } from "./harness.mjs";

describe("Intent", () => {
  it("hosting/T55 [hosting/I1, hosting/I2, hosting/I3]: a consumer brings files of its own repository to a planned state, stating only paths, bytes and intent, and a plan made from a stale reading changes nothing", async () => {
    const { reconcile, read } = await import(NAME);
    const repo = tree({ "README.md": "old\n", "notes/a.md": "a\n", "keep.md": "keep\n" });
    const report = await reconcile(repo, {
      write: [
        { path: "README.md", expect: sha("old\n"), bytes: Buffer.from("new\n") },
        { path: "bin/run", expect: "absent", bytes: Buffer.from("#!/bin/sh\n"), executable: true },
      ],
      remove: [{ path: "notes/a.md", expect: sha("a\n") }],
    });
    assert.deepEqual(report, {
      outcomes: [
        { path: "README.md", outcome: "written" },
        { path: "bin/run", outcome: "written" },
        { path: "notes/a.md", outcome: "removed" },
      ],
      pruned: ["notes"],
    });
    const after = await read(repo);
    assert.deepEqual(Object.keys(after).sort(), ["README.md", "bin/run", "keep.md"]);
    assert.equal(after["README.md"].toString(), "new\n");

    // Someone else changes README.md after the plan was made from it.
    writeFileSync(join(repo, "README.md"), "theirs\n");
    const before = await read(repo);
    await assert.rejects(
      reconcile(repo, { write: [{ path: "README.md", expect: sha("new\n"), bytes: Buffer.from("mine\n") }], remove: [{ path: "keep.md", expect: sha("keep\n") }] }),
      (e) => e.name === "HostingError" && e.code === "STALE" && e.findings.some((f) => f.path === "README.md" && f.found === sha("theirs\n")),
    );
    assert.deepEqual(await read(repo), before, "a stale plan changed the repository");
  });

  it("hosting/T56 [hosting/I5]: the package is reached by its name alone: its main entry and each subpath it exports load by that name, and nothing needs another name", async () => {
    const pkg = manifest();
    assert.equal(pkg.name, NAME);
    const main = await import(NAME);
    for (const f of ["read", "readFile", "kind", "within", "update", "reconcile", "initialize", "execute", "contribution", "HostingError"]) assert.equal(typeof main[f], "function", `${NAME} exports no ${f}`);
    const conformance = await import(`${NAME}/conformance`);
    for (const f of ["inspect", "couplings", "osBoundary"]) assert.equal(typeof conformance[f], "function", `${NAME}/conformance exports no ${f}`);
    const boundary = await import(`${NAME}/boundary`);
    for (const f of ["boundary", "boundarySuite", "portability", "portabilitySuite"]) assert.equal(typeof boundary[f], "function", `${NAME}/boundary exports no ${f}`);
    const fixtures = await import(`${NAME}/fixtures`);
    for (const f of ["facts", "specialEntries"]) assert.equal(typeof fixtures[f], "function", `${NAME}/fixtures exports no ${f}`);
    assert.deepEqual(Object.keys(await main.contribution()), ["Hosting.md"]);
  });

  it("hosting/T57 [hosting/I6, hosting/I7]: the installed package carries its own contract and the command that verifies it: docs/ with Intent, Requirements, Architecture, Testing and Limitations, a README that points to both, and npm test as that command", async () => {
    for (const doc of ["intent.md", "requirements.md", "architecture.md", "testing.md", "limitations.md"]) assert.ok(statSync(join(PACKAGE, "docs", doc)).size > 0, `docs/${doc} is not shipped`);
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.match(readme, /docs\/intent\.md/);
    assert.match(readme, /npm explore @kaihacksai\/kaal-hosting -- npm test/);
    assert.equal(manifest().scripts?.test, "node test/verify.mjs");
    assert.ok(existsSync(join(PACKAGE, "test", "verify.mjs")), "the verification entry is not shipped");
  });

  it("hosting/T58 [hosting/I8, hosting/F31]: the boundary command finds where a capability's production code asks which platform it is, and leaves a capability that leaves the host to Hosting verified", async () => {
    const command = join(PACKAGE, manifest().bin["kaal-hosting-boundary"]);
    const coupled = tree({ "package.json": JSON.stringify({ name: "coupled" }), "src/index.js": "export const windows = process.platform === \"win32\";\n" });
    const portable = tree({ "package.json": JSON.stringify({ name: "portable" }), "src/index.js": "export const answer = 42;\n" });
    const line = (r) => JSON.parse(r.stdout.split(/\r?\n/).find((l) => l.startsWith("kaal-hosting-boundary ")).slice("kaal-hosting-boundary ".length));
    const bad = await node([command, "--name", "coupled", "--root", coupled]);
    assert.equal(bad.status, 1, bad.stdout + bad.stderr);
    const found = line(bad);
    assert.equal(found.result, "failed");
    assert.ok(found.findings.some((f) => f.file === "src/index.js" && f.rule === "platform-query" && f.kind === "coupling"), JSON.stringify(found.findings));
    const good = await node([command, "--name", "portable", "--root", portable]);
    assert.equal(good.status, 0, good.stdout + good.stderr);
    assert.equal(line(good).result, "verified");
  });

  it("hosting/T59 [hosting/I10, hosting/F37, hosting/F38]: a host fact is established on this host by trying it, with a reason and evidence, and the fixture that needs it agrees", async () => {
    const { facts, specialEntries } = await import(`${NAME}/fixtures`);
    const fact = (await facts())["kaal-hosting/special-entries"];
    assert.equal(typeof fact.holds, "boolean");
    assert.ok(fact.reason.length > 0, "no reason");
    assert.match(fact.evidence, /^https:\/\//);
    const made = await specialEntries(tmp());
    assert.equal(made.holds, fact.holds);
    if (made.holds) {
      try {
        assert.ok(lstatSync(made.fifo).isFIFO(), "no FIFO was made");
        assert.ok(lstatSync(made.socket).isSocket(), "no socket was made");
      } finally {
        await made.close();
      }
    } else assert.deepEqual([made.reason, made.evidence], [fact.reason, fact.evidence]);
  });

  it("hosting/T67 [hosting/I12]: a consumer publishes a tree, reads it back byte for byte, and runs an installed command with its arguments exactly as given, through Hosting alone", async () => {
    const { execute, kind, read, update } = await import(NAME);
    const dir = tmp();
    const change = await update(dir, () => ({ prefix: "docs", files: { "a.md": Buffer.from("a\n"), "sub/b.md": Buffer.from("b\n") } }));
    assert.equal(change.prefix, "docs");
    assert.deepEqual(Object.fromEntries(Object.entries(await read(dir)).map(([p, b]) => [p, b.toString()])), { "docs/a.md": "a\n", "docs/sub/b.md": "b\n" });
    assert.equal(await kind(join(dir, "docs", "sub")), "directory");
    const args = ["two words", "it's", "$HOME", "a&b", ""];
    const r = await execute(process.execPath, ["-e", "process.stdout.write(JSON.stringify(process.argv.slice(1)))", ...args], { cwd: dir });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout), args);
  });
});
