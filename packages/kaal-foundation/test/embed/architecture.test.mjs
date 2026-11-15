// Delivered cases: the Architecture loop. They read the installed copy only: its package directory
// is found from the installed subpath, never from a repository checkout.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.resolve("@kaihacksai/kaal-foundation/sha256"))), "..");
const read = (path) => readFileSync(join(PACKAGE, path), "utf8");
const manifest = JSON.parse(read("package.json"));
/** Every identifier the installed documents define as a bold term, a heading, or a table row's first cell. */
const defined = new Set(
  readdirSync(join(PACKAGE, "docs"))
    .filter((f) => f.endsWith(".md"))
    .flatMap((f) => [...read(`docs/${f}`).matchAll(/(?:\*\*|^#+\s+|^\|\s*)([a-z][a-z-]*\/[A-Z]+\d+)\b/gm)].map((m) => m[1])),
);

test("foundation/T27 [foundation/N1, foundation/N2]: the installed module imports nothing and names no host global, and the package declares no dependency", () => {
  for (const key of ["dependencies", "peerDependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"]) assert.equal(manifest[key], undefined, `package.json declares ${key}`);
  const source = read(manifest.exports["./sha256"].default).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
  assert.doesNotMatch(source, /^\s*import\b|\bimport\s*\(|\brequire\s*\(|^\s*export\s+[^;]*\bfrom\b/m, "the module imports nothing");
  assert.doesNotMatch(source, /\b(globalThis|process|Buffer|crypto|window|self|Deno|Bun)\b/, "the module names no host global");
});

test("foundation/T28 [foundation/N4]: the README states provisional ownership for each concern it lists", () => {
  const rows = read("README.md").split("\n").filter((line) => line.includes("@kaihacksai/kaal-foundation/"));
  for (const subpath of Object.keys(manifest.exports).filter((k) => k !== "./package.json")) {
    const row = rows.find((line) => line.includes(`@kaihacksai/kaal-foundation/${subpath.slice(2)}`));
    assert.ok(row, `the README lists ${subpath}`);
    assert.match(row, /provisional/i, `${subpath}'s ownership is stated as provisional`);
  }
});

test("foundation/T31 [foundation/F15]: the shipped skill has name kaal-foundation and a description, names both commands, and cites only identifiers the shipped documents define", () => {
  const skill = read("skills/kaal-foundation/SKILL.md");
  const front = /^---\n([\s\S]*?)\n---\n/.exec(skill);
  assert.ok(front, "the skill opens with frontmatter");
  assert.match(front[1], /^name: kaal-foundation$/m);
  assert.match(front[1], /^description: \S.{20,}$/m, "the frontmatter has a description");
  for (const command of ["kaal-foundation sha256", "kaal-foundation verify"]) assert.ok(skill.includes(command), `the skill names ${command}`);
  const cited = [...skill.matchAll(/\bfoundation\/[A-Z]+\d+\b/g)].map((m) => m[0]);
  assert.ok(cited.length > 0, "the skill cites the Requirements it relies on");
  for (const id of cited) assert.ok(defined.has(id), `the skill cites ${id}, which the shipped documents do not define`);
});
