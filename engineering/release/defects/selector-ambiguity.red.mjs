// engineering/T82: the Release workflow's Hosting selector must not choose between two workspaces.
//
// Identities in this file, one per leaf test: engineering/T82 is the RED Case and the only Case D1 names
// in `tests`. engineering/T84 (the workflow has three Hosting build steps to judge), engineering/T85 (a
// workspace the selector accepts is built, alone) and engineering/T86 (an absent workspace stops the
// build) are its preconditions and controls, each with an identity of its own.
//
// Applicability: Linux and macOS, with bash, npm and git. Inapplicable on Windows, because the release
// workflow's build steps run on ubuntu-latest in bash and this Case judges those steps as they run. On
// Windows the file reports that and exits 3, the repository's "does not apply" status; it neither skips
// a leaf nor passes one.
//
// Proves engineering/D1 (see D1-selector-ambiguity.md). The Case runs the selector command lines that
// `.github/workflows/release.yml` really contains, byte for byte, against a scratch workspace repo,
// so a change to the selector changes what is judged. It reads no other copy of the selector.
//
//   expected (the contract):  two workspaces matching `kaal-hosting` or `@kaihacksai/kaal-hosting`
//                             stop the build and build neither;
//   observed today (RED):     the first match is built and the step succeeds.
//
// The two controls below pass today. They show that the harness runs the real command, so the RED
// result is the ambiguity and not a broken fixture. This file is a Case that is RED by design. No
// suite, lane or script names it, so required CI does not run it; run it by hand:
//
//   node --test engineering/release/defects/selector-ambiguity.red.mjs
//
// It is answered when this file is GREEN, unchanged, in the Change that corrects the selector after the
// scoped Hosting transition. The Case reads the names the selector accepts from the selector itself, so
// it holds for either remedy: a selector that still accepts two names must refuse a tree that holds both,
// and a selector that accepts one name cannot be ambiguous, and must still build exactly that workspace.
// Do not edit it to pass, and do not close D1 before then.
//
// The identity, version and confirming Run of this Case are recorded in D1-selector-ambiguity.md.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

if (process.platform === "win32") {
  console.log("engineering/T82: inapplicable on win32: the release workflow's build steps run on ubuntu in bash");
  process.exit(3);
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const WORKFLOW = join(ROOT, ".github", "workflows", "release.yml");

/**
 * Every `run:` step of the workflow that builds the Hosting workspace, found by what it does and not by
 * the shape of today's selector: a `run:` step that runs `npm`, builds, selects a workspace with
 * `--workspace` or `-w`, and names kaal-hosting (directly or in an `npm query`).
 */
function selectors() {
  return readFileSync(WORKFLOW, "utf8")
    .split("\n")
    .filter((line) => /^\s*-\s+run:\s+/.test(line) && /\bnpm\b/.test(line) && /\bbuild\b/.test(line) && /(--workspace\b|\s-w\s)/.test(line) && /kaal-hosting/.test(line))
    .map((line) => line.replace(/^\s*-\s+run:\s+/, ""));
}

/**
 * The package names a selector line accepts, read from the line itself: the `[name=...]` terms of an
 * `npm query`, or the name given directly to `-w` or `--workspace`. A selector by path is not read; it
 * stops the Case, loudly, rather than being guessed at.
 */
function accepts(command) {
  if (command.includes("npm query")) {
    const names = [...command.matchAll(/\[name="?([^\]"]+)"?\]/g)].map((m) => m[1]);
    assert.ok(names.length > 0, `no [name=...] term in: ${command}`);
    return [...new Set(names)];
  }
  const direct = command.match(/(?:--workspace[= ]|-w\s+)["']?(@?[\w.-]+(?:\/[\w.-]+)?)["']?/);
  assert.ok(direct && !direct[1].includes("packages"), `selector form not supported by this Case, extend it: ${command}`);
  return [direct[1]];
}

/** A scratch repo whose workspaces carry the given names; each one's build appends its name to `marker`. */
function fixture(names) {
  const dir = mkdtempSync(join(tmpdir(), "selector-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "scratch", private: true, workspaces: ["w/*"] }));
  names.forEach((name, i) => {
    const w = join(dir, "w", `p${i}`);
    mkdirSync(w, { recursive: true });
    const build = `node -e "require('fs').appendFileSync(process.env.MARKER, process.argv[1] + '\\n')" ${name}`;
    writeFileSync(join(w, "package.json"), JSON.stringify({ name, version: "0.0.1", scripts: { build } }));
  });
  return { dir, marker: join(dir, "built.txt") };
}

/** Runs one selector line in the scratch repo: its exit status and the names it built. */
function run(command, names) {
  const { dir, marker } = fixture(names);
  try {
    const r = spawnSync("bash", ["-c", command], { cwd: dir, env: { ...process.env, MARKER: marker }, encoding: "utf8" });
    const built = existsSync(marker) ? readFileSync(marker, "utf8").split("\n").filter(Boolean) : [];
    return { status: r.status, built, output: `${r.stdout}${r.stderr}`.trim() };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("engineering/T84 the workflow has three Hosting build steps to judge", () => {
  assert.equal(selectors().length, 3, "Pack, Publish and Accept each select the Hosting workspace");
});

test("engineering/T85 control: a workspace the selector accepts is built, and only that one", () => {
  for (const command of selectors()) for (const name of accepts(command)) {
    const r = run(command, [name]);
    assert.deepEqual([r.status, r.built], [0, [name]], `${name}: ${r.output}`);
  }
});

test("engineering/T86 control: no matching workspace stops the build", () => {
  for (const command of selectors()) {
    const r = run(command, ["something-else"]);
    assert.notEqual(r.status, 0, "an absent Hosting workspace must fail");
    assert.deepEqual(r.built, []);
  }
});

test("engineering/T82 RED (engineering/D1): a tree holding every name the selector accepts is refused, and nothing is built", (t) => {
  for (const command of selectors()) {
    const names = accepts(command);
    if (names.length < 2) {
      t.diagnostic(`the selector accepts one name (${names[0]}); it cannot choose between names`);
      continue;
    }
    const r = run(command, names);
    assert.notEqual(r.status, 0, `the step succeeded and built ${JSON.stringify(r.built)} instead of refusing the ambiguity`);
    assert.deepEqual(r.built, [], "an ambiguous selection must not build any workspace");
  }
});
