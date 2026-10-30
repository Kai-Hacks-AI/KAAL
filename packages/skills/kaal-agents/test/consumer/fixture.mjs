// What the consumer cases share: the installed package's paths, a fresh Git repository, and the
// command line run as a consumer runs it. Only Node's built-ins and the package's own files.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** The installed copy of the package. */
export const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
export const BIN = join(PACKAGE, "bin", "kaal-agents.mjs");

export const slash = (p) => p.split(sep).join("/");
export const output = (r) => `${r.stdout}${r.stderr}`;
export const tmp = () => realpathSync(mkdtempSync(join(tmpdir(), "kaal-agents-")));
export const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));

export const CLAIM = { owner: { kind: "capability", name: "Example", id: "0".repeat(64) }, paths: ["src/"] };

export const git = (cwd, ...args) => {
  const r = spawnSync("git", ["-c", "user.email=fixture@example.invalid", "-c", "user.name=Fixture", "-c", "commit.gpgsign=false", ...args], { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};

/** A fresh repository on branch main, with no commit and no upstream. */
export function repository() {
  const dir = tmp();
  git(dir, "init", "-q", "-b", "main");
  return dir;
}

/** Commits everything, and returns HEAD. */
export const commit = (dir) => {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "fixture");
  return git(dir, "rev-parse", "HEAD");
};

export const agents = (cwd, ...args) => spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8" });

/** orient --json on `dir`, with the report parsed when it reported. */
export const orient = (dir) => {
  const r = agents(dir, "orient", dir, "--json");
  return { ...r, report: r.status === 0 || r.status === 2 ? JSON.parse(r.stdout) : undefined };
};

/** Every file under a directory, .git/ included, with its SHA-256. */
export function snapshot(base) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) out[slash(relative(base, p))] = createHash("sha256").update(readFileSync(p)).digest("hex");
    }
  };
  walk(base);
  return out;
}
