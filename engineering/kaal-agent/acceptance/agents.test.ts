// Acceptance of Agent's first adapter, through the commands as an agent or CI
// would run them, on a throwaway checkout holding a deployed KAAL directory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { payload } from "kaal-core";

const helpers = join(dirname(fileURLToPath(import.meta.url)), "..", "helpers");

function checkout(): { dir: string; agents: string; wire: (...a: string[]) => number; check: (...a: string[]) => number } {
  const dir = mkdtempSync(join(tmpdir(), "kaal-agent-"));
  for (const [path, content] of Object.entries(payload())) {
    mkdirSync(dirname(join(dir, ".kaal", path)), { recursive: true });
    writeFileSync(join(dir, ".kaal", path), content);
  }
  const run = (script: string) => (...args: string[]) => spawnSync("node", [join(helpers, script), ...args], { cwd: dir, env: { ...process.env, INIT_CWD: dir } }).status!;
  return { dir, agents: join(dir, "AGENTS.md"), wire: run("wire-kaal-agent.js"), check: run("check-kaal-agent.js") };
}
const withCheckout = (fn: (c: ReturnType<typeof checkout>) => void) => () => {
  const c = checkout();
  try { fn(c); } finally { rmSync(c.dir, { recursive: true, force: true }); }
};
const read = (path: string) => readFileSync(path, "utf8");

test("without AGENTS.md the check fails and does not repair; wire creates the minimum file", withCheckout((c) => {
  assert.equal(c.check(), 1);
  assert.throws(() => read(c.agents), "check created nothing");
  assert.equal(c.wire(), 0);
  assert.equal(c.check(), 0);
  assert.match(read(c.agents), /^<!-- kaal:begin -->\nKAAL is present in `\.kaal\/`\. Load its agent instructions from there\.\n<!-- kaal:end -->\n$/);
}));

test("wire is idempotent: wire, wire gives the same bytes", withCheckout((c) => {
  writeFileSync(c.agents, "# Rules\n\nBe kind.\n");
  assert.equal(c.wire(), 0);
  const once = read(c.agents);
  assert.equal(c.wire(), 0);
  assert.equal(read(c.agents), once);
  assert.equal(once.split("kaal:begin").length, 2, "one KAAL block");
}));

test("wire keeps unrelated content, before and after the fragment", withCheckout((c) => {
  writeFileSync(c.agents, "# Rules\n\nBe kind.");
  c.wire();
  const wired = read(c.agents);
  assert.ok(wired.startsWith("# Rules\n\nBe kind.\n\n<!-- kaal:begin -->"));
  writeFileSync(c.agents, `Intro\n\n${wired}\nMore rules\n`);
  assert.equal(c.wire(), 0);
  assert.equal(read(c.agents), `Intro\n\n${wired}\nMore rules\n`, "an existing fragment is replaced in place");
  assert.equal(c.check(), 0);
}));

test("check fails without wiring, on a changed fragment and on a missing KAAL directory, and never repairs", withCheckout((c) => {
  writeFileSync(c.agents, "# Rules\n");
  assert.equal(c.check(), 1);
  assert.equal(read(c.agents), "# Rules\n");
  c.wire();
  const wired = read(c.agents);
  writeFileSync(c.agents, wired.replace("Load its", "Ignore its"));
  assert.equal(c.check(), 1);
  assert.ok(read(c.agents).includes("Ignore its"), "check left the file as found");
  writeFileSync(c.agents, wired);
  assert.equal(c.check(), 0);
  assert.equal(c.check("--kaal", ".other"), 1, "wiring to .kaal is not wiring to .other");
  rmSync(join(c.dir, ".kaal", "core", "KERNEL.md"));
  assert.equal(c.check(), 1, "the wiring points at a directory that is not KAAL");
}));

test("wire can name another AGENTS.md and KAAL directory; wiring a new directory replaces the old fragment", withCheckout((c) => {
  assert.equal(c.wire("--kaal", ".kaal"), 0);
  mkdirSync(join(c.dir, "sub"));
  assert.equal(c.wire("--agents", "sub/AGENTS.md", "--kaal", "../.kaal"), 0);
  assert.equal(c.check("--agents", "sub/AGENTS.md", "--kaal", "../.kaal"), 0);
}));

test("a malformed fragment is refused and the file is left untouched", withCheckout((c) => {
  const broken = "# Rules\n<!-- kaal:begin -->\nhalf\n";
  writeFileSync(c.agents, broken);
  assert.equal(c.check(), 1);
  assert.equal(c.wire(), 1);
  assert.equal(read(c.agents), broken);
  const twice = `<!-- kaal:begin -->\na\n<!-- kaal:end -->\n<!-- kaal:begin -->\nb\n<!-- kaal:end -->\n`;
  writeFileSync(c.agents, twice);
  assert.equal(c.wire(), 1);
  assert.equal(read(c.agents), twice);
}));
