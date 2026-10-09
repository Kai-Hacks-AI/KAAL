// Preservation, through the commands as they are run: what a candidate KAAL
// directory must keep of a baseline one. Closed Changes are kept by identity
// and by nothing else; Node seals and the Kernel are kept as sealed. Fixtures
// are hand-written KAAL directories, and the last tests hold this repository's
// own installed KAAL to it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TestContext } from "node:test";

const CLI = new URL("../helpers/cli.js", import.meta.url).pathname;
const REPO = fileURLToPath(new URL("../../../../", import.meta.url));
const run = (...args: string[]) => {
  const r = spawnSync("node", [CLI, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr.trim() };
};
const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const ONE = "changes/genesis/26/10/04/01";

const kaal = (t: TestContext): string => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};
const put = (dir: string, path: string, text: string) => {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), text);
};
const copy = (t: TestContext, from: string): string => {
  const to = kaal(t);
  cpSync(from, to, { recursive: true });
  return to;
};
const changes = (baseline: string, candidate: string) => run("preserve-changes", baseline, candidate);
const seals = (baseline: string, candidate: string) => run("preserve-seals", baseline, candidate);

/** A KAAL directory holding one Change sealed as it is: the historical form, a single retro.md. */
const withChange = (t: TestContext): string => {
  const dir = kaal(t);
  put(dir, `${ONE}/retro.md`, "# Retro\n");
  assert.equal(run("seal", dir, ONE).code, 0);
  return dir;
};
const sealOf = (dir: string): string => readdirSync(join(dir, "seals", "changes"))[0];

// Closed Changes

test("a candidate that keeps what is closed is preserved, whatever else it adds", (t) => {
  const baseline = withChange(t);
  assert.deepEqual(changes(baseline, baseline), { code: 0, out: "preserved", err: "" });
  const grown = copy(t, baseline);
  put(grown, "changes/genesis/26/10/04/02/work.md", "draft\n");
  put(grown, "README.md", "unrelated\n");
  assert.equal(changes(baseline, grown).code, 0, "a new open Change and unrelated files");
  const sealed = copy(t, baseline);
  put(sealed, "changes/genesis/26/10/04/02/work.md", "draft\n");
  assert.equal(run("seal", sealed, "changes/genesis/26/10/04/02").code, 0);
  assert.equal(changes(baseline, sealed).code, 0, "a new Change sealed as it is");
  assert.equal(changes(kaal(t), baseline).code, 0, "an empty baseline preserves nothing");
});

test("a closed Change moved whole, to another address or another name, is preserved", (t) => {
  const baseline = withChange(t);
  for (const to of ["changes/genesis/26/10/05/01", "changes/other/26/10/04/07"]) {
    const candidate = copy(t, baseline);
    mkdirSync(dirname(join(candidate, to)), { recursive: true });
    renameSync(join(candidate, ONE), join(candidate, to));
    assert.equal(changes(baseline, candidate).code, 0, to);
  }
});

test("every way of changing a closed Change is refused, and the refusal names it and its identity", (t) => {
  const baseline = withChange(t);
  const id = sealOf(baseline);
  const sealed = join("seals", "changes", id);
  const edits: Record<string, (d: string) => void> = {
    "edit a file": (d) => writeFileSync(join(d, ONE, "retro.md"), "# Retro\nmore\n"),
    "rename a file": (d) => renameSync(join(d, ONE, "retro.md"), join(d, ONE, "foo.md")),
    "add a file": (d) => put(d, `${ONE}/foo.md`, "x"),
    "move a file into a subdirectory": (d) => (mkdirSync(join(d, ONE, "sub")), renameSync(join(d, ONE, "retro.md"), join(d, ONE, "sub", "retro.md"))),
    "delete a file": (d) => rmSync(join(d, ONE, "retro.md")),
    "delete the Change": (d) => rmSync(join(d, ONE), { recursive: true }),
    "delete its seal": (d) => rmSync(join(d, sealed)),
    "delete the Change and its seal": (d) => (rmSync(join(d, ONE), { recursive: true }), rmSync(join(d, sealed))),
    "substitute another seal": (d) => (rmSync(join(d, sealed)), put(d, `seals/changes/${sha("x")}`, "")),
    "edit and reseal, dropping the old seal": (d) => (writeFileSync(join(d, ONE, "retro.md"), "more"), run("seal", d, ONE), rmSync(join(d, sealed))),
    "edit and reseal, keeping the old seal": (d) => (writeFileSync(join(d, ONE, "retro.md"), "more"), run("seal", d, ONE)),
    "move it, then edit it": (d) => (renameSync(join(d, ONE), join(d, "changes/genesis/26/10/05/01")), put(d, "changes/genesis/26/10/05/01/foo.md", "x")),
    "move it and drop its seal": (d) => (renameSync(join(d, ONE), join(d, "changes/genesis/26/10/05/01")), rmSync(join(d, sealed))),
    "move it out of any valid address": (d) => renameSync(join(d, ONE), join(d, "elsewhere")),
  };
  for (const [what, edit] of Object.entries(edits)) {
    const candidate = copy(t, baseline);
    mkdirSync(join(candidate, "changes/genesis/26/10/05"), { recursive: true });
    edit(candidate);
    const r = changes(baseline, candidate);
    assert.equal(r.code, 1, what);
    assert.match(r.err, new RegExp(`the Change ${ONE} is closed in the baseline as ${id}, but no closed Change with that identity is in the candidate`), what);
  }
});

// Node seals and the Kernel

/** A KAAL directory with a Kernel and three Node seals. */
const installed = (t: TestContext): string => {
  const dir = kaal(t);
  put(dir, "core/KERNEL.md", "# Kernel\n");
  for (const n of ["a", "b", "c"]) put(dir, `seals/${sha(n)}`, "");
  return dir;
};

test("a candidate that keeps every Node seal and the Kernel is preserved, and may add seals and Nodes", (t) => {
  const baseline = installed(t);
  assert.deepEqual(seals(baseline, baseline), { code: 0, out: "preserved", err: "" });
  const grown = copy(t, baseline);
  put(grown, `seals/${sha("d")}`, "");
  put(grown, "skills/x/Y.md", "a new Node\n");
  assert.equal(seals(baseline, grown).code, 0);
  assert.equal(seals(kaal(t), baseline).code, 0, "an empty baseline has nothing to keep");
  const bare = kaal(t);
  put(bare, `seals/${sha("a")}`, "");
  assert.equal(seals(bare, grown).code, 0, "a baseline without a Kernel has no Kernel to keep");
  assert.equal(seals(bare, bare).code, 0);
});

test("a Node seal missing from the candidate is refused, whatever replaces it, and the refusal names it", (t) => {
  const baseline = installed(t);
  const cases: Record<string, (d: string) => void> = {
    "removed": (d) => rmSync(join(d, "seals", sha("b"))),
    "swapped for another seal": (d) => (rmSync(join(d, "seals", sha("b"))), put(d, `seals/${sha("z")}`, "")),
    "emptied of its marker (not empty any more)": (d) => writeFileSync(join(d, "seals", sha("b")), "not a marker"),
    "the seals directory gone": (d) => rmSync(join(d, "seals"), { recursive: true }),
  };
  for (const [what, edit] of Object.entries(cases)) {
    const candidate = copy(t, baseline);
    edit(candidate);
    const r = seals(baseline, candidate);
    assert.equal(r.code, 1, what);
    assert.match(r.err, new RegExp(`the Node seal ${sha("b")} is in the baseline, but it is not a seal of the candidate`), what);
  }
});

test("the Kernel must keep its identity: altered or missing is refused, the same bytes anywhere else in the file system are not its identity", (t) => {
  const baseline = installed(t);
  const altered = copy(t, baseline);
  put(altered, "core/KERNEL.md", "# Kernel\n ");
  const r = seals(baseline, altered);
  assert.equal(r.code, 1);
  assert.equal(r.err, `the Kernel core/KERNEL.md is ${sha("# Kernel\n")} in the baseline, but ${sha("# Kernel\n ")} in the candidate`);
  const missing = copy(t, baseline);
  rmSync(join(missing, "core", "KERNEL.md"));
  assert.equal(seals(baseline, missing).err, `the Kernel core/KERNEL.md is in the baseline as ${sha("# Kernel\n")}, but the candidate has none`);
  const elsewhere = copy(t, baseline);
  rmSync(join(elsewhere, "core", "KERNEL.md"));
  put(elsewhere, "elsewhere/KERNEL.md", "# Kernel\n");
  assert.equal(seals(baseline, elsewhere).code, 1);
});

test("every violation is reported, not only the first", (t) => {
  const baseline = installed(t);
  const candidate = copy(t, baseline);
  rmSync(join(candidate, "seals", sha("a")));
  rmSync(join(candidate, "seals", sha("c")));
  put(candidate, "core/KERNEL.md", "changed");
  assert.equal(seals(baseline, candidate).err.split("\n").length, 3);
});

test("the scope is the Node seals and the Kernel: tree and Change seals are Change closure's concern, and hardening them is not done here", (t) => {
  const baseline = installed(t);
  put(baseline, `seals/trees/${sha("t")}`, "");
  put(baseline, `seals/changes/${sha("c")}`, "");
  const candidate = copy(t, baseline);
  rmSync(join(candidate, "seals", "trees"), { recursive: true });
  rmSync(join(candidate, "seals", "changes"), { recursive: true });
  assert.equal(seals(baseline, candidate).code, 0);
});

// Usage

test("the commands take exactly two directories", () => {
  for (const command of ["preserve-changes", "preserve-seals"]) {
    assert.equal(run(command).code, 2);
    assert.equal(run(command, "only-one").code, 2);
    assert.equal(run(command, "a", "b", "c").code, 2);
  }
});

// This repository's own KAAL

const own = join(REPO, ".kaal");

test("this repository's installed KAAL preserves itself, and a copy missing any one of its Node seals does not", (t) => {
  assert.ok(existsSync(join(own, "core", "KERNEL.md")));
  assert.equal(seals(own, own).code, 0);
  assert.equal(changes(own, own).code, 0);
  const ids = readdirSync(join(own, "seals")).filter((n) => /^[0-9a-f]{64}$/.test(n));
  assert.ok(ids.length >= 12, "Core's and the capabilities' Node seals are all installed");
  for (const id of ids) {
    const candidate = kaal(t);
    cpSync(own, candidate, { recursive: true });
    rmSync(join(candidate, "seals", id));
    assert.match(seals(own, candidate).err, new RegExp(id));
  }
});

test("this repository's own closed Changes are each preserved, and a copy with any one of them edited is refused", (t) => {
  const closed = run("closed", own).out.split("\n").map((l) => l.split(" ")[0]);
  assert.ok(closed.length >= 5);
  for (const path of closed) {
    const candidate = kaal(t);
    cpSync(own, candidate, { recursive: true });
    put(candidate, `${path}/stowaway.md`, "x");
    assert.match(changes(own, candidate).err, new RegExp(`the Change ${path} `), path);
  }
});
