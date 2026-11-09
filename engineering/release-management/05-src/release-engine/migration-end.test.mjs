// release-management/T13 (F20): the migration's temporary requirement turns RED when it is still there after the migration is done.
// "Done" means: nothing calls the old paths any more. Then the shims and 00-changes/change-requirements.md must be gone.
// Callers are found by parsers, never by regex: workflow files with the YAML parser, JavaScript and TypeScript with the TypeScript AST.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { parse } from "yaml";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../../..");
const SHIMS = ["engineering/release/release.mjs", "engineering/release/run.mjs"];
const REQUIREMENT = "engineering/release-management/00-changes/change-requirements.md";

const scalars = (node, out = []) => {
  if (typeof node === "string") out.push(node);
  else if (node && typeof node === "object") for (const v of Object.values(node)) scalars(v, out);
  return out;
};

/** Old paths a workflow's parsed values mention as whole command-line tokens. */
export function workflowCallers(text, shims = SHIMS) {
  const tokens = scalars(parse(text)).flatMap((s) => s.split(/\s+/)).map((t) => t.replace(/^["']|["']$/g, ""));
  return shims.filter((p) => tokens.includes(p));
}

/** Old paths a JavaScript or TypeScript file imports or re-exports (static or dynamic), resolved from the file's location. */
export function importCallers(text, file, shims = SHIMS) {
  const found = new Set();
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const consider = (specifier) => {
    if (!specifier.startsWith(".")) return;
    const target = resolve(dirname(join(ROOT, file)), specifier).slice(ROOT.length + 1).split("\\").join("/");
    if (shims.includes(target)) found.add(target);
  };
  const visit = (n) => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) consider(n.moduleSpecifier.text);
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) consider(n.arguments[0].text);
    ts.forEachChild(n, visit);
  };
  visit(source);
  return [...found];
}

describe("release-management/T13 the migration ends cleanly", () => {
  it("the detectors find a caller in a workflow and in an import, and none in unrelated text", () => {
    assert.deepEqual(workflowCallers("jobs:\n  a:\n    steps:\n      - run: node engineering/release/run.mjs pack --x 1\n"), ["engineering/release/run.mjs"]);
    assert.deepEqual(workflowCallers("jobs:\n  a:\n    steps:\n      - run: echo hello\n"), []);
    assert.deepEqual(importCallers('import { readiness } from "../release/release.mjs";', "engineering/release-management/x.mjs"), ["engineering/release/release.mjs"]);
    assert.deepEqual(importCallers('const m = await import("./release/run.mjs");', "engineering/y.mjs"), ["engineering/release/run.mjs"]);
    assert.deepEqual(importCallers('import fs from "node:fs";', "engineering/z.mjs"), []);
  });

  it("while something still calls an old path the shims and the requirement stay; once nothing does they must be gone", () => {
    const files = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" }).split("\0").filter(Boolean);
    const callers = new Set();
    for (const f of files) {
      if (SHIMS.includes(f) || !existsSync(join(ROOT, f))) continue;
      if (/^\.github\/workflows\/.+\.ya?ml$/.test(f)) workflowCallers(readFileSync(join(ROOT, f), "utf8")).forEach((p) => callers.add(p));
      else if (/\.(mjs|js|ts)$/.test(f) && !f.endsWith("migration-end.test.mjs") && !f.includes("node_modules")) importCallers(readFileSync(join(ROOT, f), "utf8"), f).forEach((p) => callers.add(p));
    }
    const why = [
      "release-management/T13 (F20, a temporary requirement owned by the migration; see engineering/release-management/00-changes/change-requirements.md).",
      `Callers of the old release paths found now: ${callers.size ? [...callers].join(", ") : "none"}.`,
    ].join("\n");
    const stage = (t) => `${why}\n${t}`;
    for (const shim of SHIMS) {
      const stillCalled = callers.has(shim);
      const present = existsSync(join(ROOT, shim));
      assert.ok(
        present === stillCalled,
        stage(
          stillCalled
            ? `${shim} is still called but its shim is missing. Removing a shim before its last caller is rewired breaks that caller. Restore the shim (a full facade: export * plus main, F20), or rewire the caller first. A caller in .github travels alone, so rewire it in a .github-only Change before this shim is removed.`
            : `${shim} has no caller left, so its shim is dead code and the migration step for it is done. Remove the shim in an Engineering Change (never in the same Change as a .github change), then remove the requirement file once both shims are gone.`,
        ),
      );
    }
    const anyCalled = SHIMS.some((s) => callers.has(s));
    const requirementPresent = existsSync(join(ROOT, REQUIREMENT));
    assert.ok(
      requirementPresent === anyCalled,
      stage(
        anyCalled
          ? `${REQUIREMENT} is missing while an old path is still called. Restore it: F20 and T12 still apply until the last caller is rewired.`
          : `The migration is done (no caller of any old path) but ${REQUIREMENT} still exists. Delete it with the terminate Change (step 8 of the path to main in engineering/release-management/README.md), together with this Case, T12 and the last shim.`,
      ),
    );
  });
});
