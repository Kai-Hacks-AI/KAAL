// The helpers the four parts of the Requirements verification (requirements-1 to requirements-4.test.mjs) share.
// guard/C142 moved them here, unchanged, from the single requirements.test.mjs; each part imports what it uses.
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync, symlinkSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { consumer, verdicts } from "./harness.mjs";

export const exit = (status, message = `exit ${status}`) => `node checks/exit.mjs ${status} ${message}`;

/** A consumer that declares these checks, committed. */
export function given(checks) {
  const c = consumer();
  c.checks(checks);
  c.commit("checks");
  return c;
}

/** Guard's checkout state as Git resolves it from `cwd`: in the common directory, or in the worktree's own metadata. */
export const state = (c, cwd, scope) => {
  const r = scope === "worktree" ? c.git("-C", cwd, "rev-parse", "--path-format=absolute", "--git-path", "kaal/guard/state.json") : c.git("-C", cwd, "rev-parse", "--path-format=absolute", "--git-common-dir");
  assert.equal(r.status, 0, r.output);
  return scope === "worktree" ? r.stdout.trim() : join(r.stdout.trim(), "kaal", "guard", "state.json");
};

/** Where core.hooksPath is set, as `git config --show-scope` sees it from `cwd`: [scope, value], or [] when unset. */
export const hooksPath = (c, cwd) => c.git("-C", cwd, "config", "--show-scope", "--get", "core.hooksPath").stdout.trim().split(/\s+/).filter(Boolean);

/** A linked worktree of `c` on a new branch, beside its main checkout. */
export const worktree = (c, name) => {
  const dir = join(c.root, name);
  const r = c.git("worktree", "add", "-q", "-b", name, dir);
  assert.equal(r.status, 0, r.output);
  assert.ok(statSync(join(dir, ".git")).isFile(), "a linked worktree's .git is a file");
  return dir;
};

/** Every file of the working tree with its bytes, the local Git configuration, and Guard's checkout state. */
export const snapshot = (c) => ({
  files: Object.fromEntries(c.files().map((p) => [p, readFileSync(join(c.dir, p), "utf8")])),
  config: c.git("config", "--local", "--list").stdout,
  state: existsSync(state(c, c.dir)) ? readFileSync(state(c, c.dir), "utf8") : null,
});

/** A check script that writes known bytes to its own stdout and stderr, then exits with its argument. */
export const LOUD = `process.stdout.write("the check's stdout\\n"); process.stderr.write("the check's stderr\\n"); process.exit(Number(process.argv[2]));\n`;

/** The lines of a run's stdout that are neither a verdict line nor its `do:` line. */
export const extra = (stdout) => stdout.split(/\r?\n/).filter((l) => l.trim() && !/^\s+do: /.test(l) && Object.keys(verdicts(l)).length === 0);

/** The Skill path a reminder line names, repository-relative with forward slashes where it lies in the repository, and whether it exists. */
export function named(c, line) {
  const m = /((?:[A-Za-z]:)?[^\s`'"(]*skills[\\/]kaal-guard(?:[\\/][^\s`'"),;]*)?)/.exec(line);
  assert.ok(m, `the reminder names no Skill path: ${line}`);
  const path = m[1].replace(/[.:]$/, "");
  const absolute = isAbsolute(path) ? path : join(c.dir, path);
  const inside = isAbsolute(path) ? null : path.split("\\").join("/").replace(/\/$/, "");
  return { path, inside, exists: existsSync(absolute) };
}

export const WINDOWS = process.platform === "win32";

/** A symbolic link at `path` in `c` to `target`, or false where the host refuses to make one (Windows without the privilege). */
export const link = (c, target, path) => {
  try {
    symlinkSync(target, join(c.dir, path), "file");
    return true;
  } catch (e) {
    if (WINDOWS && e.code === "EPERM") return false;
    throw e;
  }
};

/** Asserts that a command was cannot judge (exit 2), naming `entry`, with no stack trace and no verdict for `check`. */
export const cannotJudge = (r, entry, what, check) => {
  assert.equal(r.status, 2, `${what}:\n${r.output}`);
  assert.match(r.output, /cannot judge/, what);
  assert.ok(r.output.includes(entry), `${what} does not name ${entry}:\n${r.output}`);
  assert.doesNotMatch(r.output, /^\s+at .+[(:]\d+/m, `${what} printed a stack trace:\n${r.output}`);
  if (check) assert.equal(verdicts(r.output)[check], undefined, `${what} gave ${check} a verdict:\n${r.output}`);
};
