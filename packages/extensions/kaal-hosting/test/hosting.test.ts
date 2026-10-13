// Conformance: the guarantees Hosting gives KAAL, checked on whichever host
// runs this suite. CI runs it on Linux, Windows and macOS.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import gfs from "graceful-fs";
import { contribution, execute, HostingError, initialize, read, update, type Files } from "kaal-hosting";

const run = promisify(execFile);
const here = fileURLToPath(new URL(".", import.meta.url));

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "kaal-hosting-"));
}

/** A directory in a parent of its own, so whatever Hosting leaves beside it shows. */
function alone(): { parent: string; dir: string } {
  const parent = tmp();
  const dir = join(parent, "d");
  mkdirSync(dir);
  return { parent, dir };
}

/** Make the host refuse every rename while `fn` runs. */
async function renamesFail<T>(fn: () => Promise<T>): Promise<T> {
  const original = gfs.rename;
  gfs.rename = ((_from: string, _to: string, cb: (e: Error) => void) => cb(Object.assign(new Error("EPERM: refused"), { code: "EPERM" }))) as typeof gfs.rename;
  try {
    return await fn();
  } finally {
    gfs.rename = original;
  }
}

function files(entries: Record<string, string>): Files {
  return Object.fromEntries(Object.entries(entries).map(([p, s]) => [p, Buffer.from(s)]));
}

function code(c: HostingError["code"]): (e: unknown) => boolean {
  return (e) => e instanceof HostingError && e.code === c;
}

async function snapshot(dir: string): Promise<string> {
  const all = await read(dir);
  return JSON.stringify(Object.keys(all).sort().map((p) => [p, all[p].toString("base64")]));
}

describe("read", () => {
  it("reads every file by relative path, and a missing directory as empty", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "a", "b"), { recursive: true });
    writeFileSync(join(dir, "top.md"), "1");
    writeFileSync(join(dir, "a", "b", "deep.md"), "2");
    assert.deepEqual(await read(dir), files({ "top.md": "1", "a/b/deep.md": "2" }));
    assert.deepEqual(await read(join(dir, "missing")), {});
  });

  it("leaves nothing out by its name", async () => {
    const dir = tmp();
    mkdirSync(join(dir, ".staging-x"));
    writeFileSync(join(dir, ".staging-x", "kept.md"), "k");
    writeFileSync(join(dir, ".staging-notes.md"), "n");
    mkdirSync(join(dir, "d.lock"));
    writeFileSync(join(dir, "d.lock", "kept.md"), "l");
    assert.deepEqual(await read(dir), files({ ".staging-x/kept.md": "k", ".staging-notes.md": "n", "d.lock/kept.md": "l" }));
  });

  it("reads and publishes a file named __proto__ like any other", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "__proto__"), "p");
    assert.deepEqual(Object.keys(await read(dir)), ["__proto__"]);
    await update(dir, () => ({ prefix: "skills/odd", files: files({ ["__proto__"]: "q" }) }));
    assert.deepEqual(Object.keys(await read(dir)).sort(), ["__proto__", "skills/odd/__proto__"]);
  });

  it("reads a link to a file as that file, and refuses a link to a directory", async () => {
    const dir = tmp();
    const outside = tmp();
    writeFileSync(join(outside, "real.md"), "r");
    symlinkSync(join(outside, "real.md"), join(dir, "linked.md"), "file");
    assert.deepEqual(await read(dir), files({ "linked.md": "r" }));
    symlinkSync(outside, join(dir, "elsewhere"), "junction");
    await assert.rejects(read(dir), code("INVALID_PATH"));
  });
});

describe("update", () => {
  it("publishes a change as a new directory, all at once, leaving nothing else inside or beside", async () => {
    const { parent, dir } = alone();
    const change = { prefix: "skills/greeting", files: files({ "Greeting.md": "g", "docs/.staging-v1.md": "d" }) };
    assert.deepEqual(await update(dir, () => change), change);
    assert.deepEqual(await read(dir), files({ "skills/greeting/Greeting.md": "g", "skills/greeting/docs/.staging-v1.md": "d" }));
    assert.deepEqual(readdirSync(dir), ["skills"]);
    assert.deepEqual(readdirSync(parent), ["d"]);
  });

  it("restores the whole directory, created parents included, when the final rename fails", async () => {
    const { parent, dir } = alone();
    mkdirSync(join(dir, "skills"));
    await assert.rejects(renamesFail(() => update(dir, () => ({ prefix: "skills/a/b", files: files({ "x.md": "1" }) }))), /EPERM/);
    await assert.rejects(renamesFail(() => update(dir, () => ({ prefix: "new/c", files: files({ "x.md": "1" }) }))), /EPERM/);
    assert.deepEqual(readdirSync(dir), ["skills"]);
    assert.deepEqual(readdirSync(join(dir, "skills")), []);
    assert.deepEqual(readdirSync(parent), ["d"]);
  });

  it("gives the plan the directory as it is, and writes nothing when the plan declines", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "a.md"), "a");
    const before = await snapshot(dir);
    let seen: Files | undefined;
    assert.equal(await update(dir, (current) => ((seen = current), undefined)), undefined);
    assert.deepEqual(seen, files({ "a.md": "a" }));
    assert.equal(await snapshot(dir), before);
  });

  it("refuses a prefix that already exists, writing nothing", async () => {
    const dir = tmp();
    await update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) }));
    const before = await snapshot(dir);
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "b.md": "2" }) })), code("EXISTS"));
    assert.equal(await snapshot(dir), before);
  });

  it("leaves the directory unchanged when publication fails", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "skills"), "a file where the directory would go");
    const before = await snapshot(dir);
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) })));
    assert.equal(await snapshot(dir), before);
    assert.deepEqual(readdirSync(dir), ["skills"]);
  });

  it("refuses a prefix reached through a symbolic link, writing nothing outside", async () => {
    const dir = tmp();
    const outside = tmp();
    symlinkSync(outside, join(dir, "skills"), "junction");
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) })), code("INVALID_PATH"));
    assert.deepEqual(readdirSync(outside), []);
  });

  it("propagates a refusal from the plan, writing nothing", async () => {
    const dir = tmp();
    await assert.rejects(update(dir, () => { throw new Error("not admitted"); }), /not admitted/);
    assert.deepEqual(readdirSync(dir), []);
  });
});

describe("faithful publication on every host", () => {
  const collisions: [string, Record<string, string>][] = [
    ["names differing only in case", { "A.md": "1", "a.md": "2" }],
    ["directories differing only in case", { "Docs/x.md": "1", "docs/y.md": "2" }],
    ["NFC and NFD spellings of one name", { "café.md": "1", "café.md": "2" }],
  ];
  for (const [label, entries] of collisions) {
    it(`refuses ${label}, writing nothing`, async () => {
      const dir = tmp();
      await assert.rejects(update(dir, () => ({ prefix: "skills/c", files: files(entries) })), code("COLLISION"));
      assert.deepEqual(readdirSync(dir), []);
    });
  }

  it("refuses a new path that collapses onto an existing one", async () => {
    const dir = tmp();
    await update(dir, () => ({ prefix: "skills/Greeting", files: files({ "a.md": "1" }) }));
    const before = await snapshot(dir);
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "2" }) })), code("COLLISION"));
    assert.equal(await snapshot(dir), before);
  });

  it("refuses a new path that collapses onto an existing empty directory", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "Skills"));
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) })), code("COLLISION"));
    assert.deepEqual(readdirSync(dir), ["Skills"]);
  });

  const invalid = ["../escape.md", "/abs.md", "a//b.md", "con.md", "aux", "x:y.md", "trailing.", "q?.md", "back\\slash.md"];
  for (const path of invalid) {
    it(`refuses the non-portable path ${JSON.stringify(path)}, writing nothing`, async () => {
      const dir = tmp();
      await assert.rejects(update(dir, () => ({ prefix: "skills/c", files: files({ [path]: "1" }) })), code("INVALID_PATH"));
      assert.deepEqual(readdirSync(dir), []);
    });
  }
});

describe("initialize", () => {
  const payload = files({ "KERNEL.md": "k", "core/Node.md": "n" });

  it("creates a missing directory whole", async () => {
    const dir = join(tmp(), "engine");
    assert.deepEqual(await initialize(dir, payload), ["KERNEL.md", "core/Node.md"]);
    assert.deepEqual(await read(dir), payload);
  });

  it("leaves an empty directory empty, and nothing beside it, when a move fails", async () => {
    const { parent, dir } = alone();
    await assert.rejects(renamesFail(() => initialize(dir, payload)), /EPERM/);
    assert.deepEqual(readdirSync(dir), []);
    assert.deepEqual(readdirSync(parent), ["d"]);
  });

  it("fills an empty current directory in place, never removing it", async () => {
    const dir = join(tmp(), "here");
    mkdirSync(dir);
    const cwd = process.cwd();
    process.chdir(dir);
    try {
      await initialize(".", payload);
      assert.deepEqual(await read("."), payload, "the current directory itself holds the files");
    } finally {
      process.chdir(cwd);
    }
  });

  it("refuses a directory that is not empty, writing nothing", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "notes.txt"), "someone else's");
    await assert.rejects(initialize(dir, payload), code("NOT_EMPTY"));
    assert.deepEqual(readdirSync(dir), ["notes.txt"]);
  });

  it("refuses colliding paths before touching the directory", async () => {
    const dir = join(tmp(), "engine");
    await assert.rejects(initialize(dir, files({ "A.md": "1", "a.md": "2" })), code("COLLISION"));
    assert.ok(!existsSync(dir));
  });
});

describe("one writer at a time, across processes", () => {
  it("serializes concurrent updates, whatever path names the directory: each plan sees every earlier change", async () => {
    const dir = tmp();
    const link = join(tmp(), "link");
    symlinkSync(dir, link, "junction");
    const hosting = pathToFileURL(join(here, "..", "dist", "index.js")).href;
    const script = (at: string) => `
      import { update } from ${JSON.stringify(hosting)};
      const change = await update(${JSON.stringify(at)}, async (current) => {
        const n = Object.keys(current).length;
        await new Promise((r) => setTimeout(r, 30));
        return { prefix: "p" + n, files: { "f.md": Buffer.from(String(n)) } };
      });
      console.log(change.prefix);`;
    const writers = 6;
    const outs = await Promise.all(Array.from({ length: writers }, (_, i) => run(process.execPath, ["--input-type=module", "-e", script(i % 2 ? link : dir)])));
    const prefixes = outs.map((o) => o.stdout.trim()).sort();
    assert.deepEqual(prefixes, Array.from({ length: writers }, (_, i) => `p${i}`).sort());
    assert.equal(Object.keys(await read(dir)).length, writers);
    assert.ok(!existsSync(`${dir}.lock`) && !existsSync(`${link}.lock`), "the lock is released");
  });
});

describe("execute", () => {
  it("runs a command found on the PATH, however the host realizes it", async () => {
    const r = await execute("npm", ["--version"], { cwd: tmp() });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /^\d+\.\d+\.\d+/);
  });

  it("runs an installed package's command with its arguments exactly as given", async () => {
    const pkg = tmp();
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "echo-args", version: "1.0.0", bin: { "echo-args": "echo.js" } }));
    writeFileSync(join(pkg, "echo.js"), "#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify(process.argv.slice(2)));\n");
    const host = tmp();
    writeFileSync(join(host, "package.json"), JSON.stringify({ name: "host", version: "1.0.0", private: true }));
    const installed = await execute("npm", ["install", "--offline", "--no-audit", "--no-fund", "--no-package-lock", pkg], { cwd: host });
    assert.equal(installed.status, 0, installed.stderr);
    const args = ["plain", "two words", '"quoted"', "it's", "%PATH%", "$HOME", "a&b", "a|b", "a^b", "<in>", "semi;colon", "back\\slash\\", ""];
    const r = await execute(join(host, "node_modules", ".bin", "echo-args"), args, { cwd: host });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout), args);
  });

  it("reports a failing command's status and output", async () => {
    const r = await execute(process.execPath, ["-e", "process.stdout.write('out'); process.stderr.write('err'); process.exit(3)"], { cwd: tmp() });
    assert.deepEqual(r, { status: 3, stdout: "out", stderr: "err" });
  });

  it("rejects a command that cannot be started", async () => {
    await assert.rejects(execute("kaal-hosting-no-such-command", [], { cwd: tmp() }), /ENOENT/);
  });
});

describe("Hosting's Extension Node", () => {
  it("is carried as Hosting.md, typed by KAAL Extension", async () => {
    const c = await contribution();
    assert.deepEqual(Object.keys(c), ["Hosting.md"]);
    const text = c["Hosting.md"].toString("utf8");
    assert.match(text, /^---\nname: Hosting\ntype:\n  name: KAAL Extension\n  id: [0-9a-f]{64}\n---\n/);
    assert.equal(text, readFileSync(join(here, "..", "payload", "Hosting.md"), "utf8"));
  });
});
