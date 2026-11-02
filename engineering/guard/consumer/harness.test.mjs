// Code test of the A12 harness: each execution has its own Git configuration, which it removes at
// exit. Needs no network.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const HARNESS = join(dirname(fileURLToPath(import.meta.url)), "harness.mjs");

/** Starts an execution that imports the harness, reports its Git configuration, and waits to be told to end. */
function execution() {
  const child = spawn(process.execPath, ["--input-type=module", "-e", `
    const h = await import(${JSON.stringify(pathToFileURL(HARNESS).href)});
    const { existsSync } = await import("node:fs");
    console.log(JSON.stringify({ path: h.gitConfig(), exists: existsSync(h.gitConfig()) }));
    process.stdin.once("data", () => process.exit(0));
  `], { stdio: ["pipe", "pipe", "inherit"] });
  const ended = new Promise((done) => child.once("exit", done));
  // An execution that ends before it reports fails the case instead of leaving it waiting.
  const reported = new Promise((done, fail) => {
    child.stdout.once("data", (d) => done(JSON.parse(String(d))));
    ended.then((code) => fail(new Error(`the execution ended with ${code} before it reported its Git configuration`)));
  });
  return { reported, end: () => (child.stdin.write("end\n"), ended) };
}

test("concurrent executions each have their own Git configuration, removed at exit", async () => {
  const a = execution();
  const b = execution();
  const [ra, rb] = await Promise.all([a.reported, b.reported]);
  assert.ok(ra.exists && rb.exists, "an execution's Git configuration does not exist while it runs");
  assert.notEqual(ra.path, rb.path, "two concurrent executions share one Git configuration");
  assert.notEqual(dirname(ra.path), dirname(rb.path), "two concurrent executions share one scratch directory");
  await Promise.all([a.end(), b.end()]);
  assert.ok(!existsSync(ra.path) && !existsSync(rb.path), "an execution left its Git configuration behind");
  assert.ok(!existsSync(dirname(ra.path)) && !existsSync(dirname(rb.path)), "an execution left its scratch directory behind");
});
