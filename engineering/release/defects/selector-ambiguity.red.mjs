// engineering/T82: the Release workflow's Hosting selector must not choose between two workspaces.
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
// It is answered when this file is GREEN, in the Change that removes the dual-name logic after the
// scoped Hosting transition. Do not edit it to pass, and do not close D1 before then.
//
// Needs a POSIX shell and npm, like the workflow's ubuntu steps.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const WORKFLOW = join(ROOT, ".github", "workflows", "release.yml");
const UNSCOPED = "kaal-hosting";
const SCOPED = "@kaihacksai/kaal-hosting";

/** Every `run:` step of the workflow that selects the Hosting workspace with `npm query`. */
function selectors() {
  return readFileSync(WORKFLOW, "utf8")
    .split("\n")
    .filter((line) => /^\s*-\s+run:\s+npm run build\b.*\$\(npm query\b/.test(line))
    .map((line) => line.replace(/^\s*-\s+run:\s+/, ""));
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

test("engineering/T82 the workflow has three selector steps to judge", () => {
  assert.equal(selectors().length, 3, "Pack, Publish and Accept each select Hosting with npm query");
});

test("engineering/T82 control: one matching workspace is built, whichever name it has", () => {
  for (const command of selectors()) for (const name of [UNSCOPED, SCOPED]) {
    const r = run(command, [name]);
    assert.deepEqual([r.status, r.built], [0, [name]], `${name}: ${r.output}`);
  }
});

test("engineering/T82 control: no matching workspace stops the build", () => {
  for (const command of selectors()) {
    const r = run(command, ["something-else"]);
    assert.notEqual(r.status, 0, "an absent Hosting workspace must fail");
    assert.deepEqual(r.built, []);
  }
});

test("engineering/T82 RED (engineering/D1): two matching workspaces stop the build and build neither", () => {
  for (const command of selectors()) {
    const r = run(command, [UNSCOPED, SCOPED]);
    assert.notEqual(r.status, 0, `the step succeeded and built ${JSON.stringify(r.built)} instead of refusing the ambiguity`);
    assert.deepEqual(r.built, [], "an ambiguous selection must not build either workspace");
  }
});
