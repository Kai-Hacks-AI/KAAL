// The one script, through the command as an agent runs it. The identity is
// spelled out here as a literal digest, never produced by calling the script twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { SCRIPTS } from "../helpers/setup.js";

const run = (...args: string[]) => {
  const r = spawnSync("node", [join(SCRIPTS, "intent.mjs"), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr.trim() };
};
const dir = (t: TestContext) => {
  const d = mkdtempSync(join(tmpdir(), "intent-"));
  t.after(() => rmSync(d, { recursive: true, force: true }));
  return d;
};
const file = (d: string, content: string | Buffer, name = "intent.md") => {
  writeFileSync(join(d, name), content);
  return join(d, name);
};

test("a plain text that begins with # Intent and says something is an Intent, in any shape", (t) => {
  const d = dir(t);
  for (const content of [
    "# Intent\n\nI want it to be possible to plan a trip in one evening, because evenings are all there is.\n",
    "# Intent — A trip in one evening\n\nWanted: planning in one evening.\nWhy: evenings are all there is.\nNot: booking.\n",
    "# Intent\n\n## Boundaries\n\nUnicode is fine: Ünïcödé, 日本語.\n",
    "# Intent\nx\n",
  ]) assert.equal(run("check", file(d, content)).code, 0, content);
});

test("it prints the identity: the SHA-256 of the exact bytes", (t) => {
  const to = file(dir(t), "# Intent\n\nabc\n");
  const r = run("identity", to);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out, "6e6406ad0f6b0b66e7b837b4de5f705fe4cb8bcdba50a8df086e642665b04da0\n");
  assert.match(r.out.trim(), /^[0-9a-f]{64}$/);
});

test("it refuses what is not an Intent, and says why", (t) => {
  const d = dir(t);
  const refused: [string, string | Buffer][] = [
    ["no head", "I want a thing.\n"],
    ["another title", "# Wanted\n\nA thing.\n"],
    ["a longer word", "# Intention\n\nA thing.\n"],
    ["a deeper heading", "## Intent\n\nA thing.\n"],
    ["a head after text", "preface\n# Intent\n\nA thing.\n"],
    ["nothing after the head", "# Intent\n"],
    ["only blank lines after the head", "# Intent\n\n\n  \n"],
    ["no final newline", "# Intent\n\nA thing."],
    ["carriage returns", "# Intent\r\n\r\nA thing.\r\n"],
    ["a NUL", "# Intent\n\nA\0thing.\n"],
    ["invalid UTF-8", Buffer.concat([Buffer.from("# Intent\n\nA "), Buffer.from([0xff, 0xfe]), Buffer.from(" thing.\n")])],
    ["empty", ""],
  ];
  for (const [what, content] of refused) {
    const to = file(d, content);
    for (const command of ["check", "identity"]) {
      const r = run(command, to);
      assert.equal(r.code, 1, `${command}: ${what}`);
      assert.match(r.err, /is not an Intent/, what);
      assert.equal(r.out, "", `${command} prints nothing: ${what}`);
    }
  }
});

test("a missing file and bad usage fail, and nothing is ever written", (t) => {
  const d = dir(t);
  const to = file(d, "# Intent\n\nA thing.\n");
  assert.equal(run("check", join(d, "missing.md")).code, 1);
  for (const args of [[], ["check"], ["identity"], ["write", to], ["check", to, "extra"], ["establish", to]]) assert.equal(run(...args).code, 2, args.join(" "));
  run("check", to);
  run("identity", to);
  assert.deepEqual(readdirSync(d), ["intent.md"]);
});

test("the identity changes with a single byte: another Intent, another identity", (t) => {
  const d = dir(t);
  const a = run("identity", file(d, "# Intent\n\nI want a thing.\n", "a.md")).out;
  const b = run("identity", file(d, "# Intent\n\nI want a thing!\n", "b.md")).out;
  const same = run("identity", file(d, "# Intent\n\nI want a thing.\n", "c.md")).out;
  assert.notEqual(a, b);
  assert.equal(a, same, "location and name do not take part");
});
