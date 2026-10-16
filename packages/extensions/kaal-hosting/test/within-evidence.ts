// @ts-nocheck
// Evidence only, not conformance: compares two candidate algorithms for
// Hosting's proposed within(dir, path) on whichever host runs it, and prints
// one JSON table. Never merged; it backs the Owner comparison on #95.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { platform, tmpdir } from "node:os";
import { dirname, join, parse, resolve, sep, toNamespacedPath } from "node:path";
import { it } from "node:test";

const win = platform() === "win32";
const mac = platform() === "darwin";

function attempt(fn) {
  try {
    return { ok: fn() };
  } catch (e) {
    return { err: e.code ?? String(e.message).split("\n")[0] };
  }
}

// A: identity walk. Is dir's (dev, ino) that of path's realpath or an ancestor?
function identity(dir, path) {
  const want = statSync(dir, { bigint: true });
  if (want.ino === 0n) return "UNKNOWN_IDENTITY";
  let at = realpathSync.native(path);
  for (;;) {
    const s = statSync(at, { bigint: true });
    if (s.ino === 0n) return "UNKNOWN_IDENTITY";
    if (s.dev === want.dev && s.ino === want.ino) return true;
    const up = dirname(at);
    if (up === at) return false;
    at = up;
  }
}

// B: native realpath of both, then segment comparison; `fold` compares
// segments case-insensitively, as Windows and default macOS volumes do.
function segments(dir, path, fold) {
  const norm = (p) => (fold ? p.toLowerCase() : p);
  const d = realpathSync.native(dir).split(sep).filter(Boolean).map(norm);
  const p = realpathSync.native(path).split(sep).filter(Boolean).map(norm);
  return d.length <= p.length && d.every((s, i) => s === p[i]);
}

// The raw prefix check #95 holds today.
function prefix(dir, path) {
  const r = resolve(path);
  return r === resolve(dir) || r.startsWith(resolve(dir) + sep);
}

it("evidence: within(dir, path)", () => {
  const raw = mkdtempSync(join(tmpdir(), "kaal-within-"));
  const base = realpathSync.native(raw);
  const repo = join(base, "repo");
  mkdirSync(join(repo, "a", "b"), { recursive: true });
  mkdirSync(join(base, "repo-other"));
  mkdirSync(join(base, "outside"));
  const link = win ? "junction" : "dir";
  const setup = {};
  const cases = [];
  const add = (name, dir, path, expected) => cases.push({ name, dir, path, expected });

  add("inside", repo, join(repo, "a", "b"), true);
  add("same", repo, repo, true);
  add("sibling sharing a name prefix", repo, join(base, "repo-other"), false);
  add("unrelated", repo, join(base, "outside"), false);
  add("tmpdir as the host spells it", join(raw, "repo"), join(repo, "a"), true);

  setup.alias = attempt(() => symlinkSync(repo, join(base, "alias"), link));
  add(`path through a ${link} into dir`, repo, join(base, "alias", "a"), true);
  add(`dir given through a ${link}`, join(base, "alias"), join(repo, "a"), true);
  setup.escape = attempt(() => symlinkSync(join(base, "outside"), join(repo, "escape"), link));
  add(`${link} inside dir pointing out`, repo, join(repo, "escape"), false);
  if (win) {
    setup.dirSymlink = attempt(() => symlinkSync(repo, join(base, "dlink"), "dir"));
    add("path through a directory symlink", repo, join(base, "dlink", "a"), true);
  }
  setup.dangling = attempt(() => symlinkSync(join(base, "gone"), join(base, "dangling"), link));
  add("dangling link", repo, join(base, "dangling"), "MISSING");
  add("missing path", repo, join(repo, "nope"), "MISSING");

  add("dir spelled in another case", join(base, "REPO"), join(repo, "a"), win || mac ? true : "MISSING");
  add("path spelled in another case", repo, join(base, "REPO", "A"), win || mac ? true : "MISSING");

  const nfc = join(base, "caf\u00e9");
  mkdirSync(join(nfc, "x"), { recursive: true });
  add("dir in NFD, created NFC", join(base, "cafe\u0301"), join(nfc, "x"), mac ? true : "MISSING");

  if (win) {
    setup.shortName = attempt(() => execFileSync("cmd", ["/c", "for %I in (\"" + raw + "\") do @echo %~sI"]).toString().trim());
    if (setup.shortName.ok) add("dir as an 8.3 short name", join(setup.shortName.ok, "repo"), join(repo, "a"), true);
    setup.subst = attempt(() => execFileSync("subst", ["K:", base]).toString());
    add("dir through a subst drive", "K:\\repo", join(repo, "a"), true);
    add("path through a subst drive", repo, "K:\\repo\\a", true);
    const unc = "\\\\localhost\\" + base[0] + "$" + base.slice(2);
    add("dir as a UNC admin share", join(unc, "repo"), join(repo, "a"), true);
    add("path as a UNC admin share", repo, join(unc, "repo", "a"), true);
    add("dir as a \\\\?\\ path", toNamespacedPath(repo), join(repo, "a"), true);
    const other = ["C:\\", "D:\\"].find((d) => d[0].toUpperCase() !== base[0].toUpperCase());
    add(`path on another drive (${other})`, repo, other, false);
  } else {
    add("path on another mount (/)", repo, "/", false);
  }
  if (platform() === "linux") {
    setup.bind = attempt(() => {
      mkdirSync(join(base, "bound"));
      execFileSync("sudo", ["-n", "mount", "--bind", repo, join(base, "bound")]);
      return "mounted";
    });
    add("path through a bind mount of dir", repo, join(base, "bound", "a"), true);
    setup.shm = attempt(() => mkdtempSync("/dev/shm/kaal-within-"));
    if (setup.shm.ok) add("path on tmpfs", repo, setup.shm.ok, false);
  }

  const ids = {};
  for (const p of [base, repo, parse(base).root]) {
    const s = attempt(() => statSync(p, { bigint: true }));
    const n = attempt(() => statSync(p));
    ids[p] = s.ok ? { dev: String(s.ok.dev), ino: String(s.ok.ino), inoNumber: n.ok ? String(n.ok.ino) : n.err } : s.err;
  }

  const rows = cases.map((c) => {
    const run = (fn) => {
      const r = attempt(fn);
      return r.err ? (r.err === "ENOENT" ? "MISSING" : r.err) : r.ok;
    };
    const row = {
      case: c.name,
      expected: c.expected,
      identity: run(() => identity(c.dir, c.path)),
      segmentsExact: run(() => segments(c.dir, c.path, false)),
      segmentsFolded: run(() => segments(c.dir, c.path, true)),
      prefix: run(() => prefix(c.dir, c.path)),
      realpathDir: run(() => realpathSync.native(c.dir)),
      realpathPath: run(() => realpathSync.native(c.path)),
      realpathJsPath: run(() => realpathSync(c.path)),
    };
    return row;
  });

  console.log("WITHIN-EVIDENCE " + JSON.stringify({ host: platform(), node: process.version, raw, base, setup, ids, rows }));

  if (win && setup.subst?.ok !== undefined) attempt(() => execFileSync("subst", ["K:", "/d"]));
  if (setup.bind?.ok) attempt(() => execFileSync("sudo", ["-n", "umount", join(base, "bound")]));
  if (setup.shm?.ok) rmSync(setup.shm.ok, { recursive: true, force: true });
  rmSync(raw, { recursive: true, force: true });
});
