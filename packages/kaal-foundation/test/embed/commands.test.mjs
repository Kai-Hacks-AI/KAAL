// Delivered cases: the Code loop for the installed command, run under this Node without a shell. It
// writes only in a scratch directory it removes.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const PACKAGE = join(dirname(fileURLToPath(import.meta.resolve("@kaihacksai/kaal-foundation/sha256"))), "..");
const BIN = join(PACKAGE, "bin", "kaal-foundation.mjs");
const command = (args, { cwd, input } = {}) => spawnSync(process.execPath, [BIN, ...args], { cwd, input, encoding: "utf8" });

test("foundation/T29 [foundation/F14]: kaal-foundation sha256 prints the library's digest for a file and for standard input", () => {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-foundation-command-"));
  try {
    const bytes = new TextEncoder().encode("KAAL Foundation\n");
    writeFileSync(join(scratch, "a.txt"), bytes);
    writeFileSync(join(scratch, "empty"), "");
    const r = command(["sha256", "a.txt", "empty"], { cwd: scratch });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, `${sha256(bytes)}  a.txt\n${sha256(new Uint8Array())}  empty\n`);
    const stdin = command(["sha256"], { cwd: scratch, input: "abc" });
    assert.equal(stdin.status, 0, stdin.stderr);
    assert.equal(stdin.stdout, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  -\n");
    const dash = command(["sha256", "-"], { cwd: scratch, input: "abc" });
    assert.equal(dash.stdout, stdin.stdout, "- reads standard input");
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("foundation/T30 [foundation/F14]: an unreadable file and an unknown command exit 2 with a usage line", () => {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-foundation-command-"));
  try {
    for (const [why, args] of [["an unreadable file", ["sha256", "missing.txt"]], ["an unknown command", ["frobnicate"]], ["an unknown option", ["sha256", "--fast"]], ["no command", []]]) {
      const r = command(args, { cwd: scratch });
      assert.equal(r.status, 2, `${why} exits 2`);
      assert.match(r.stderr, /usage: kaal-foundation/, `${why} prints a usage line`);
      assert.equal(r.stdout, "", `${why} prints no digest`);
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
