// Helpers for the testing/C69 planned Cases. Read-only: they inspect repository files and run child-process mutation checks.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

export const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const SKILL_DIR = join(PKG, "skills/kaal-testing");
export const SKILL = join(SKILL_DIR, "SKILL.md");
export const HEADING = "Testing loops";
export const OLD_HEADING = "The three loops";
export const CAPABILITY_SHA = "be4d4a38073318e46d1d9c7351a44fab69aeb2044780ac53af2c11c2d1a9a185";
export const PAYLOAD_SHA = "36d8090e8bdaa43b70b7599b8d0e4381249458415930525feb38e2d34da0b499";

export const readText = (p) => {
  assert.ok(existsSync(p), `missing: ${p.slice(PKG.length + 1)}`);
  return readFileSync(p, "utf8");
};

export const readJson = (p) => JSON.parse(readText(p));

/** SHA-256 of the file's LF-normalized UTF-8 bytes via Foundation. */
export const lfSha256 = (p) => {
  const normalized = readText(p).replace(/\r\n/g, "\n");
  return sha256(new TextEncoder().encode(normalized));
};

/** The `## ` headings of the Skill in order, and the body of `## Testing loops` ('' when absent). */
export function skillParts() {
  const text = readText(SKILL);
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const at = text.search(new RegExp(`^## ${HEADING}\\s*$`, "m"));
  if (at < 0) return { text, headings, section: "" };
  const rest = text.slice(at);
  const next = rest.slice(3).search(/^## /m);
  return { text, headings, section: (next < 0 ? rest : rest.slice(0, next + 3)).trimEnd() };
}

const LOADER = `
import { registerHooks } from 'node:module';
const targets = new Set(JSON.parse(process.env.KAAL_CONTRACTS_TARGETS).map((u) => u.toLowerCase()));
registerHooks({
  load(url, context, next) {
    const loaded = next(url, context);
    if (!targets.has(url.toLowerCase())) return loaded;
    return { ...loaded, source: process.env.KAAL_CONTRACTS_SOURCE };
  },
});
`;

/**
 * Runs `test/contracts.test.mjs` in a child process with `lib/contracts.mjs` replaced in memory.
 * Returns `{ status: 'killed' | 'survived' | 'invalid' | 'unresolved', exit, output }`.
 */
export function runContractsWithSource(source) {
  const rawPath = join(PKG, "lib/contracts.mjs");
  const realPath = realpathSync(rawPath);
  const targets = [...new Set([pathToFileURL(rawPath).href, pathToFileURL(realPath).href])];
  const testFile = join(PKG, "test/contracts.test.mjs");
  const r = spawnSync(
    process.execPath,
    ["--import", `data:text/javascript,${encodeURIComponent(LOADER)}`, "--test", "--test-isolation=none", "--test-reporter=tap", testFile],
    {
      cwd: PKG,
      encoding: "utf8",
      timeout: 30000,
      maxBuffer: 2 ** 20,
      env: {
        ...process.env,
        KAAL_CONTRACTS_TARGETS: JSON.stringify(targets),
        KAAL_CONTRACTS_SOURCE: source,
      },
    },
  );
  const output = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const status = /SyntaxError|ERR_MODULE_NOT_FOUND|ERR_PACKAGE_PATH_NOT_EXPORTED/.test(output)
    ? "invalid"
    : r.error
      ? "unresolved"
      : r.status === 0
        ? "survived"
        : /ERR_ASSERTION/.test(output)
          ? "killed"
          : "unresolved";
  return { status, exit: r.status, output };
}
