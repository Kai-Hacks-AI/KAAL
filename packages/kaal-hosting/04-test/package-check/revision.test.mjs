// hosting/C110 delivered cases: reading the files of a revision (hosting/F80, hosting/F81, hosting/F82, hosting/F83, hosting/N12;
// hosting/T272 to hosting/T276 and hosting/T279). They reach Hosting by its name, as a consumer does, and write only to
// the operating system's temporary directory. Git is used for fixtures only, through Hosting's own starts.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { PACKAGE } from "./harness.mjs";

const SCRIPTS = join(PACKAGE, "dist/skills/kaal-hosting/scripts");

/** A scratch repository on branch main, isolated from the user's Git configuration. `cleanup()` removes it. */
async function repo() {
  const h = hosting;
  const home = mkdtempSync(join(tmpdir(), "hosting-revision-"));
  const dir = join(home, "repo");
  mkdirSync(dir);
  const env = h.isolatedEnvironment(home);
  const git = (...args) => {
    const r = h.executeSync("git", ["-c", "user.name=case", "-c", "user.email=case@example.invalid", "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", ...args], { cwd: dir, env });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
  git("init", "-q", "-b", "main");
  return {
    dir,
    home,
    git,
    write(path, bytes) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), bytes);
    },
    commit(message) {
      git("add", "-A");
      git("commit", "-q", "-m", message);
      return git("rev-parse", "HEAD");
    },
    cleanup: () => rmSync(home, { recursive: true, force: true }),
  };
}

it("hosting/T272: readRevision returns the committed bytes of a revision, exactly, whole or limited by `under`, never the working tree, and writes nothing; revision names the commit", async () => {
    const h = hosting;
    assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
    assert.equal(typeof h.revision, "function", "revision is not exported");
    const r = await repo();
    try {
      const bin = Buffer.from([0xff, 0xfe, 0x00, 0x62, 0x69, 0x6e]);
      r.write("b.bin", bin);
      r.write("d/a.txt", "one");
      r.write("d/e/f.txt", "deep");
      r.write("top.txt", "top");
      const first = r.commit("one");
      r.write("d/a.txt", "two");
      r.write("new.txt", "new");
      r.commit("two");
      r.write("top.txt", "uncommitted");
      const before = r.git("status", "--porcelain");

      const files = await h.readRevision(r.dir, first);
      assert.deepEqual(Object.keys(files).sort(), ["b.bin", "d/a.txt", "d/e/f.txt", "top.txt"], "the commit's files, keyed by / paths, and not a later file");
      assert.ok(Buffer.isBuffer(files["b.bin"]) && files["b.bin"].equals(bin), "bytes that are not text stay exactly as committed");
      assert.equal(files["d/a.txt"].toString(), "one", "the commit's content, not a later commit's");
      assert.equal(files["top.txt"].toString(), "top", "the commit's content, not the working tree's");
      assert.deepEqual(await h.readRevision(r.dir, "HEAD~1"), files, "a ref by any name reads the same commit");
      assert.deepEqual(await h.readRevision(r.dir, "main"), await h.readRevision(r.dir, "HEAD"));

      assert.deepEqual(Object.keys(await h.readRevision(r.dir, first, { under: ["d"] })).sort(), ["d/a.txt", "d/e/f.txt"], "a folder");
      assert.deepEqual(Object.keys(await h.readRevision(r.dir, first, { under: ["d/"] })).sort(), ["d/a.txt", "d/e/f.txt"], "a trailing slash is the same folder");
      assert.deepEqual(Object.keys(await h.readRevision(r.dir, first, { under: ["d/a.txt", "top.txt"] })).sort(), ["d/a.txt", "top.txt"], "files");
      assert.deepEqual(await h.readRevision(r.dir, first, { under: ["nope"] }), {}, "a path the commit does not hold gives nothing, not an error");

      assert.deepEqual(await h.revision(r.dir, first), { commit: first });
      assert.equal(r.git("status", "--porcelain"), before, "reading changed nothing in the repository");
    } finally {
      r.cleanup();
    }
});

it("hosting/T273: no such revision is REVISION_NOT_FOUND and an unreadable repository or Git is REVISION_UNREADABLE, never the same; a ref that starts with a dash is data, not an option", async () => {
    const h = hosting;
    assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
    const code = (c) => (e) => {
      assert.equal(e?.name, "HostingError");
      assert.equal(e.code, c, `expected ${c}, got ${e?.code}: ${e?.message}`);
      return true;
    };
    const r = await repo();
    const plain = mkdtempSync(join(tmpdir(), "hosting-notrepo-"));
    const path = process.env.PATH;
    const ceiling = process.env.GIT_CEILING_DIRECTORIES;
    try {
      r.write("a.txt", "a");
      const head = r.commit("one");
      for (const ref of ["no-such-ref", "", "a\nb", "-x", "--output=pwned", `${head}~9`, r.git("rev-parse", "HEAD:a.txt"), r.git("rev-parse", "HEAD^{tree}")]) {
        await assert.rejects(h.readRevision(r.dir, ref), code("REVISION_NOT_FOUND"), `${JSON.stringify(ref)} names no commit`);
        await assert.rejects(h.revision(r.dir, ref), code("REVISION_NOT_FOUND"), `${JSON.stringify(ref)} names no commit (revision)`);
      }
      assert.equal(existsSync(join(r.dir, "pwned")), false, "a ref was taken for an option");

      process.env.GIT_CEILING_DIRECTORIES = tmpdir();
      await assert.rejects(h.readRevision(plain, "HEAD"), code("REVISION_UNREADABLE"), "a directory that is not a repository cannot be read");
      await assert.rejects(h.readRevision(join(plain, "missing"), "HEAD"), code("REVISION_UNREADABLE"), "a directory that does not exist cannot be read");
      process.env.PATH = "";
      await assert.rejects(h.readRevision(r.dir, "HEAD"), code("REVISION_UNREADABLE"), "Git that cannot be started cannot be read");
    } finally {
      process.env.PATH = path;
      if (ceiling === undefined) delete process.env.GIT_CEILING_DIRECTORIES;
      else process.env.GIT_CEILING_DIRECTORIES = ceiling;
      rmSync(plain, { recursive: true, force: true });
      r.cleanup();
    }
});

it("hosting/T274: a symbolic link or submodule entry inside what is asked for is refused as REVISION_ENTRY naming it, and a narrower under reads around it; a bad path in under is INVALID_PATH", async () => {
    const h = hosting;
    assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
    const r = await repo();
    try {
      r.write("a.txt", "a");
      r.write("lib/x.txt", "x");
      const base = r.commit("base");
      // The entries are put in the index directly, so no filesystem link is needed on any host.
      r.write("target", "t");
      const blob = r.git("hash-object", "-w", "target");
      r.git("update-index", "--add", "--cacheinfo", `120000,${blob},ln`);
      r.git("update-index", "--add", "--cacheinfo", `160000,${base},sub`);
      r.git("commit", "-q", "-m", "entries");

      await assert.rejects(h.readRevision(r.dir, "HEAD"), (e) => e?.code === "REVISION_ENTRY" && /\b(ln|sub)\b/.test(e.message), "the whole revision holds a link and a submodule");
      await assert.rejects(h.readRevision(r.dir, "HEAD", { under: ["ln"] }), (e) => e?.code === "REVISION_ENTRY" && /\bln\b/.test(e.message), "the link, asked for by name");
      await assert.rejects(h.readRevision(r.dir, "HEAD", { under: ["sub"] }), (e) => e?.code === "REVISION_ENTRY" && /\bsub\b/.test(e.message), "the submodule, asked for by name");
      assert.deepEqual(Object.keys(await h.readRevision(r.dir, "HEAD", { under: ["a.txt", "lib"] })).sort(), ["a.txt", "lib/x.txt"], "a narrower under reads around them");

      for (const bad of ["", "..", "a/../b", "/abs", "C:/x", "a\\b", "./a", "a//b"]) {
        await assert.rejects(h.readRevision(r.dir, "HEAD", { under: [bad] }), (e) => e?.code === "INVALID_PATH", `${JSON.stringify(bad)} is not a repository-relative path`);
      }
    } finally {
      r.cleanup();
    }
});

it("hosting/T275: reading five files and eighty files starts Git the same, small number of times; the package keeps exactly its five runtime dependencies and the new source loads no node:test", async () => {
    const h = hosting;
    assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
    const trace = mkdtempSync(join(tmpdir(), "hosting-trace-"));
    const was = process.env.GIT_TRACE;
    const starts = async (root, ref) => {
      const file = join(trace, `t-${Math.random().toString(16).slice(2)}`);
      process.env.GIT_TRACE = file;
      try {
        await h.readRevision(root, ref);
      } finally {
        if (was === undefined) delete process.env.GIT_TRACE;
        else process.env.GIT_TRACE = was;
      }
      return readFileSync(file, "utf8").split("\n").filter((l) => /built-in: git /.test(l)).length;
    };
    const small = await repo();
    const large = await repo();
    try {
      for (let i = 0; i < 5; i++) small.write(`f${i}.txt`, `${i}`);
      small.commit("small");
      for (let i = 0; i < 80; i++) large.write(`d${i % 8}/f${i}.txt`, `${i}`);
      large.commit("large");
      const a = await starts(small.dir, "HEAD");
      const b = await starts(large.dir, "HEAD");
      assert.ok(a >= 1 && a <= 4, `five files took ${a} Git starts`);
      assert.equal(b, a, `eighty files took ${b} Git starts, five took ${a}`);
    } finally {
      rmSync(trace, { recursive: true, force: true });
      small.cleanup();
      large.cleanup();
    }
    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.deepEqual(Object.keys(manifest.dependencies).sort(), ["cross-spawn", "es-module-lexer", "graceful-fs", "proper-lockfile", "typescript"], "no runtime dependency is added");
    assert.ok(!/node:test/.test(readFileSync(join(SCRIPTS, "revision.js"), "utf8")), "revision.js loads node:test");
});

it("hosting/T276: kaal-hosting-revision prints one line of facts that agrees with readRevision, exits 0 when read (also when under matches nothing) and 2 when not, never 1, and never prints the bytes", async () => {
    const h = hosting;
    const cli = join(SCRIPTS, "revision-cli.mjs");
    assert.ok(existsSync(cli), "the command revision-cli.mjs is not built into dist");
    const r = await repo();
    try {
      r.write("d/a.txt", "SECRET-CONTENT");
      r.write("b.bin", Buffer.from([0xff, 0x00, 0x01]));
      const head = r.commit("one");
      const run = (...args) => {
        const out = h.executeSync(process.execPath, [cli, ...args], { cwd: r.dir });
        const lines = out.stdout.trim().split("\n");
        assert.equal(lines.length, 1, `one line, got: ${out.stdout}`);
        assert.ok(lines[0].startsWith("kaal-hosting-revision "), lines[0]);
        return { status: out.status, out: out.stdout, fact: JSON.parse(lines[0].slice("kaal-hosting-revision ".length)) };
      };

      const all = run("--root", r.dir, "--ref", "HEAD");
      assert.equal(all.status, 0);
      assert.equal(all.fact.result, "read");
      assert.equal(all.fact.commit, head);
      const files = await h.readRevision(r.dir, "HEAD");
      assert.deepEqual(all.fact.files, Object.keys(files).sort().map((path) => ({ path, bytes: files[path].length, sha256: h.digest(files[path]) })), "the command and the library agree");
      assert.ok(!all.out.includes("SECRET-CONTENT"), "the bytes are not printed");

      const some = run("--root", r.dir, "--ref", "HEAD", "--under", "d");
      assert.deepEqual(some.fact.files.map((f) => f.path), ["d/a.txt"]);
      const none = run("--root", r.dir, "--ref", "HEAD", "--under", "nope");
      assert.equal(none.status, 0, "under matching nothing is a read, not an error");
      assert.deepEqual(none.fact.files, []);

      const missing = run("--root", r.dir, "--ref", "no-such-ref");
      assert.equal(missing.status, 2);
      assert.equal(missing.fact.result, "cannot-determine");
      assert.equal(missing.fact.code, "REVISION_NOT_FOUND");
      const dash = run("--root", r.dir, "--ref", "-x");
      assert.equal(dash.status, 2);
      assert.equal(dash.fact.code, "REVISION_NOT_FOUND");
      const bad = run("--root", r.dir, "--ref", "HEAD", "--under", "..");
      assert.equal(bad.status, 2);
      assert.equal(bad.fact.code, "INVALID_PATH");
      const usage = run("--root", r.dir);
      assert.equal(usage.status, 2);
      assert.equal(usage.fact.code, "USAGE");
    } finally {
      r.cleanup();
    }
});

it("hosting/T279: under is read as literal repository-relative names: wildcards and Git pathspec magic match nothing, and a file whose name looks like pathspec syntax is read by exactly that name", async () => {
    const h = hosting;
    assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
    const r = await repo();
    try {
      r.write("a.txt", "a");
      r.write("b.txt", "b");
      r.write("d/x.txt", "x");
      const plain = r.commit("plain");
      // Names that look like pathspec syntax are put in the index directly, so no host has to hold them as files.
      const blob = r.git("hash-object", "-w", "a.txt");
      for (const name of [":(glob)lit", "*.lit", "q?.lit", "[ab].lit"]) r.git("update-index", "--add", "--cacheinfo", `100644,${blob},${name}`);
      r.git("commit", "-q", "-m", "odd names");

      const keys = async (under) => Object.keys(await h.readRevision(r.dir, "HEAD", { under })).sort();
      for (const magic of ["*.txt", "**/*.txt", "?.txt", "[ab].txt", "d/*", ":(glob)**/*.txt", ":(exclude)a.txt", ":!a.txt", ":(top)d", ":/", ":(icase)A.TXT", ":(attr:foo)a.txt"]) {
        assert.deepEqual(await keys([magic]), [], `${magic} is a literal name, and no file has it: it must not match a.txt, b.txt or d/x.txt`);
      }
      assert.deepEqual(await keys([":(glob)lit"]), [":(glob)lit"], "a file named like pathspec magic is read by exactly that name");
      assert.deepEqual(await keys(["*.lit"]), ["*.lit"], "a file named with a star is that file alone, not every .lit file");
      assert.deepEqual(await keys(["q?.lit"]), ["q?.lit"]);
      assert.deepEqual(await keys(["[ab].lit"]), ["[ab].lit"]);
      assert.deepEqual(await keys(["d", "a.txt"]), ["a.txt", "d/x.txt"], "plain names still read as before");
      assert.deepEqual(Object.keys(await h.readRevision(r.dir, plain, { under: ["*.txt"] })), [], "the same on the earlier commit");
    } finally {
      r.cleanup();
    }
});
