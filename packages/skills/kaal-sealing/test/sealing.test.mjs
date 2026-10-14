import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, foundation, identify, loadEngine, readContribution, registerSkill, verify } from "kaal-core";
import { HostingError } from "kaal-hosting";
import { artifactId, readArtifact, seal, sealBytes, sealed, SEALING, sealOf, verifyAgainst, verifySeal } from "kaal-sealing";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAYLOAD = join(PACKAGE, "payload");

function tmp() {
  return mkdtempSync(join(tmpdir(), "kaal-sealing-test-"));
}

function tree(dir) {
  const out = {};
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) if (statSync(join(dir, p)).isFile()) out[p] = readFileSync(join(dir, p), "utf8");
  return out;
}

/** A directory `art/` holding `a.txt` ("hello\n") and `sub/B.md` ("x"). */
function art() {
  const dir = join(tmp(), "art");
  mkdirSync(join(dir, "sub"), { recursive: true });
  writeFileSync(join(dir, "a.txt"), "hello\n");
  writeFileSync(join(dir, "sub", "B.md"), "x");
  return dir;
}

/** A bootstrapped Engine; holding Sealing unless `bare`. */
function engine(bare = false) {
  const dir = join(tmp(), "E");
  bootstrap(dir);
  if (!bare) registerSkill(dir, "kaal-sealing", readContribution(PAYLOAD));
  return dir;
}

const id = async (path, form) => artifactId(await readArtifact(path), form);
const sealAt = async (e, path, form) => seal(e, await readArtifact(path), form);
const verifyAt = async (e, path, ref) => verifySeal(e, await readArtifact(path), ref);

describe("the Sealing Node", () => {
  it("is one Node typed by Core's KAAL Skill, pinned in the Agent Skill", () => {
    const files = readContribution(PAYLOAD);
    assert.deepEqual(Object.keys(files), ["Sealing.md"]);
    const n = identify(files["Sealing.md"]);
    assert.deepEqual(n.type, foundation().skill);
    assert.deepEqual({ name: n.name, id: n.id }, SEALING);
  });

  it("is admitted by Core alone, with Core's view of the Engine unchanged by Seals", async () => {
    const e = engine();
    assert.ok(loadEngine(e).resolve(SEALING));
    const before = loadEngine(e).nodes.map((n) => n.id);
    await sealAt(e, join(art(), "a.txt"));
    assert.ok(verify(e).ok);
    assert.deepEqual(loadEngine(e).nodes.map((n) => n.id), before);
  });
});

describe("artifact identity", () => {
  it("gives an unnamed file without a domain Core's Node identity", async () => {
    assert.equal(await id(join(art(), "a.txt")), "5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03");
    assert.equal(await id(join(PAYLOAD, "Sealing.md")), SEALING.id);
  });

  it("computes the four forms byte-compatibly with KAAL's earlier artifact-id", async () => {
    const dir = art();
    assert.equal(await id(join(dir, "a.txt"), { domain: "D" }), "9e51a4f4019b618ba037490152aa87baf6bb0664ec45cbbf2a0d07a77ba4d0c1");
    assert.equal(await id(join(dir, "a.txt"), { domain: "D", named: true }), "787b94a58d0f0127bb80b8442b5b274596f1a4140abd50380939bcfa2add2e40");
    assert.equal(await id(dir, { domain: "D" }), "b78178d47b1cae4db89577bb9ec3f31192758fa7e1d9387e4dce136a304115aa");
    assert.equal(await id(dir, { domain: "D", named: true }), "fde552be7c9835b7941fcecd0e7bf3c8f0ac8c778400dd0974f73b830be1280d");
  });

  it("is the same for the same bytes however they were retrieved", async () => {
    const dir = art();
    const fromMemory = { kind: "directory", name: "art", files: { "sub/B.md": Buffer.from("x"), "a.txt": Buffer.from("hello\n") } };
    assert.equal(artifactId(fromMemory, { domain: "D", named: true }), await id(dir, { domain: "D", named: true }));
    const elsewhere = join(tmp(), "deep", "art");
    cpSync(dir, elsewhere, { recursive: true });
    assert.equal(await id(elsewhere, { domain: "D", named: true }), await id(dir, { domain: "D", named: true }), "location takes no part");
    assert.notEqual(await id(dir, { domain: "D" }), await id(dir, { domain: "E" }));
    assert.notEqual(await id(dir, { domain: "D" }), await id(dir, { domain: "D", named: true }));
  });

  it("needs a single-line domain for every form but an unnamed file, and a name for the named form", async () => {
    const dir = art();
    await assert.rejects(id(dir), /domain/);
    await assert.rejects(id(join(dir, "a.txt"), { named: true }), /domain/);
    await assert.rejects(id(dir, { domain: "a\nb" }), /domain/);
    assert.throws(() => artifactId({ kind: "file", bytes: Buffer.from("x") }, { domain: "D", named: true }), /own name/);
  });

  it("refuses what it could not state the same on every platform", async () => {
    const d = (files) => () => artifactId({ kind: "directory", files: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, Buffer.from(v)])) }, { domain: "D" });
    assert.throws(d({ "a.txt": "1", "A.txt": "2" }), /differ only by case/);
    assert.throws(d({ "é.txt": "x" }), /NFC/);
    assert.throws(d({ "a/../b": "x" }), /segment/);
    assert.throws(d({ "a\\b": "x" }), /backslash/);
    assert.throws(d({}), /no files/);
  });
});

describe("Seals", () => {
  it("bind kind, form and identity in canonical bytes named by their hash", () => {
    const { ref, bytes } = sealOf({ kind: "directory", name: "art", files: { "a.txt": Buffer.from("hello\n") } }, { domain: "D", named: true });
    assert.match(bytes.toString("utf8"), /^KAAL Seal\nkind: directory\nnamed: true\ndomain: D\nid: [0-9a-f]{64}\n$/);
    assert.equal(sealBytes({ kind: "file", form: {}, id: "0".repeat(64) }).toString("utf8"), `KAAL Seal\nkind: file\nnamed: false\nid: ${"0".repeat(64)}\n`);
    assert.match(ref, /^[0-9a-f]{64}$/);
  });

  it("verify purely against the intended Seal, wherever its bytes were retrieved from", () => {
    const v1 = { kind: "file", bytes: Buffer.from("one\n") };
    const v2 = { kind: "file", bytes: Buffer.from("two\n") };
    const s1 = sealOf(v1);
    const s2 = sealOf(v2);
    assert.equal(verifyAgainst(v1, s1.ref, s1.bytes).status, "ok");
    assert.equal(verifyAgainst(v2, s1.ref, s1.bytes).status, "mismatch");
    assert.equal(verifyAgainst(v2, s1.ref, s2.bytes).status, "corrupt", "another Seal's bytes are not the intended Seal");
    assert.equal(verifyAgainst(v1, s1.ref, undefined).status, "missing");
    assert.throws(() => verifyAgainst(v1, "nope", s1.bytes), /not a Seal ref/);
  });
});

describe("a KAAL Engine as the Seal store", () => {
  it("seals a file and a directory and verifies each against its own Seal", async () => {
    const e = engine();
    const dir = art();
    const file = join(dir, "a.txt");
    const fileRef = await sealAt(e, file);
    const dirRef = await sealAt(e, dir, { domain: "D", named: true });
    assert.equal(await sealAt(e, file), fileRef, "sealing again changes nothing");
    assert.deepEqual(await sealed(e), [fileRef, dirRef].sort());
    assert.deepEqual(await verifyAt(e, file, fileRef), { status: "ok", sealed: await id(file), id: await id(file) });
    assert.equal((await verifyAt(e, dir, dirRef)).status, "ok", "the form comes from the Seal");
    assert.equal((await verifyAt(e, dir, fileRef)).status, "mismatch", "a file's Seal does not bind a directory");
  });

  it("detects an artifact changed while its Seal is unchanged", async () => {
    const e = engine();
    const dir = art();
    const ref = await sealAt(e, dir, { domain: "D" });
    writeFileSync(join(dir, "sub", "B.md"), "y");
    const v = await verifyAt(e, dir, ref);
    assert.equal(v.status, "mismatch");
    assert.notEqual(v.id, v.sealed);
  });

  it("detects a Seal changed, corrupted or missing while the artifact is unchanged", async () => {
    const e = engine();
    const file = join(art(), "a.txt");
    const ref = await sealAt(e, file);
    const stored = join(e, "seals", ref, "seal");
    const original = readFileSync(stored);
    writeFileSync(stored, original.toString("utf8").replace(/id: [0-9a-f]{64}/, `id: ${"0".repeat(64)}`));
    assert.equal((await verifyAt(e, file, ref)).status, "corrupt", "a well-formed Seal binding another identity");
    writeFileSync(stored, "garbage");
    assert.equal((await verifyAt(e, file, ref)).status, "corrupt");
    rmSync(join(e, "seals", ref), { recursive: true });
    assert.equal((await verifyAt(e, file, ref)).status, "missing");
  });

  it("fails a second sealed version against the original Seal", async () => {
    const e = engine();
    const file = join(art(), "a.txt");
    const v1 = await sealAt(e, file);
    writeFileSync(file, "hello again\n");
    const v2 = await sealAt(e, file);
    assert.notEqual(v1, v2);
    assert.equal((await verifyAt(e, file, v2)).status, "ok");
    assert.equal((await verifyAt(e, file, v1)).status, "mismatch", "the intended Seal decides, not whether any Seal matches");
  });

  it("never replaces what it retains", async () => {
    const e = engine();
    const file = join(art(), "a.txt");
    const ref = await sealAt(e, file);
    writeFileSync(join(e, "seals", ref, "seal"), "not the Seal");
    await assert.rejects(sealAt(e, file), /holds other bytes/);
    assert.equal(readFileSync(join(e, "seals", ref, "seal"), "utf8"), "not the Seal");
  });

  it("seals and verifies outside any repository, and after the artifact and the Engine move", async () => {
    const e = engine();
    const dir = art();
    assert.ok(!existsSync(join(dirname(e), ".git")) && !existsSync(join(dirname(dir), ".git")));
    const ref = await sealAt(e, dir, { domain: "D", named: true });
    const elsewhere = tmp();
    renameSync(e, join(elsewhere, "Engine"));
    cpSync(dir, join(elsewhere, "deep", "art"), { recursive: true });
    assert.equal((await verifyAt(join(elsewhere, "Engine"), join(elsewhere, "deep", "art"), ref)).status, "ok");
    cpSync(dir, join(elsewhere, "renamed"), { recursive: true });
    assert.equal((await verifyAt(join(elsewhere, "Engine"), join(elsewhere, "renamed"), ref)).status, "mismatch", "named: the name takes part");
  });

  it("refuses an Engine that does not hold Sealing, and writes nothing", async () => {
    const e = engine(true);
    const before = tree(e);
    await assert.rejects(sealAt(e, join(art(), "a.txt")), /does not hold Sealing/);
    await assert.rejects(verifyAt(e, join(art(), "a.txt"), "0".repeat(64)), /does not hold Sealing/);
    assert.deepEqual(tree(e), before);
  });
});

describe("links in Seal storage", () => {
  it("refuses seals/ as a link to a directory, reading and writing, and writes nothing through it", async () => {
    const e = engine();
    const file = join(art(), "a.txt");
    const target = tmp();
    symlinkSync(target, join(e, "seals"), "dir");
    await assert.rejects(sealAt(e, file), HostingError);
    await assert.rejects(verifyAt(e, file, "0".repeat(64)), HostingError);
    await assert.rejects(sealed(e), HostingError);
    assert.deepEqual(readdirSync(target), []);
  });

  it("refuses a Seal's directory as a link", async () => {
    const e = engine();
    const file = join(art(), "a.txt");
    const ref = await sealAt(e, file);
    const outside = join(tmp(), "outside");
    renameSync(join(e, "seals", ref), outside);
    symlinkSync(outside, join(e, "seals", ref), "dir");
    await assert.rejects(verifyAt(e, file, ref), HostingError);
  });

  it("cannot redirect verification through a link to a file: only the intended Seal's exact bytes verify", async () => {
    const e = engine();
    const dir = art();
    const file = join(dir, "a.txt");
    const ref = await sealAt(e, file);
    const stored = join(e, "seals", ref, "seal");
    const decoy = join(tmp(), "decoy");
    writeFileSync(decoy, sealOf({ kind: "file", bytes: Buffer.from("forged\n") }).bytes);
    rmSync(stored);
    symlinkSync(decoy, stored);
    assert.equal((await verifyAt(e, file, ref)).status, "corrupt");
    writeFileSync(file, "forged\n");
    assert.equal((await verifyAt(e, file, ref)).status, "corrupt", "a forged artifact with its own Seal still fails the intended ref");
  });
});
