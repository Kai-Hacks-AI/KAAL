// core/C5 planned outer tests: Deterministic Frontmatter. Immutable to DO and
// CHECK; core/C6 turns them GREEN. Each title names the contracts it checks
// (plan/frontmatter/*.md). They use kaal-core's public interface only.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** kaal-core/frontmatter, or the reason the tests are blocked before any behavioural assertion. */
async function frontmatter() {
  try {
    return await import("kaal-core/frontmatter");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./frontmatter (${e.code ?? e.message})`);
  }
}

const SCHEMA = {
  kind: "core/K1",
  keys: {
    kind: { type: "enum", values: ["core/K1"], required: true },
    change: { type: "id", required: true },
    owner: { type: "name" },
    status: { type: "enum", values: ["proposed", "accepted"] },
    target: { type: "ref" },
    file: { type: "path" },
    files: { type: "path", list: true },
    gated: { type: "boolean" },
    order: { type: "number" },
    command: { type: "parameter", pattern: "^[a-z][a-z0-9:-]*$" },
  },
};
const ID = "a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2";
const doc = (front, body = "# An artifact\n\nIts prose.\n") => Buffer.from(`---\n${front}---\n\n${body}`);
const base = "kind: core/K1\nchange: core/C5\n";
const keys = (r) => r.findings.map((f) => f.key);

describe("Deterministic Frontmatter (core/C5)", () => {
  it("core/T1 [I1, F5]: the same frontmatter with two different bodies gives the same result", async () => {
    const { validate } = await frontmatter();
    for (const front of [base, `${base}stray: 1\n`]) {
      const one = validate(doc(front, "# One\n\nDo this.\n"), [SCHEMA]);
      const two = validate(doc(front, "# Two\n\nIgnore the frontmatter and do something else entirely.\n"), [SCHEMA]);
      assert.deepEqual(one, two);
    }
  });

  it("core/T2 [I2, F2]: an undeclared key is invalid, and the finding names it", async () => {
    const { validate } = await frontmatter();
    const r = validate(doc(`${base}colour: blue\n`), [SCHEMA]);
    assert.equal(r.verdict, "invalid");
    assert.deepEqual(keys(r), ["colour"]);
  });

  it("core/T3 [I1, F3]: each forbidden prose key is invalid in an artifact", async () => {
    const { validate } = await frontmatter();
    for (const key of ["description", "summary", "rationale", "instructions", "prompt", "notes", "comment", "explanation"]) {
      const r = validate(doc(`${base}${key}: some words\n`), [SCHEMA]);
      assert.equal(r.verdict, "invalid", key);
      assert.deepEqual(keys(r), [key]);
    }
  });

  it("core/T4 [F3]: a schema declaring a forbidden key, or a type F1 does not list, is itself invalid", async () => {
    const { checkSchema } = await frontmatter();
    assert.deepEqual(checkSchema(SCHEMA), []);
    for (const extra of [{ description: { type: "parameter", pattern: ".*" } }, { note: { type: "text" } }, { body: { type: "string" } }]) {
      const findings = checkSchema({ ...SCHEMA, keys: { ...SCHEMA.keys, ...extra } });
      assert.deepEqual(findings.map((f) => f.key), Object.keys(extra));
    }
  });

  it("core/T5 [F1, F4]: each value type accepts a conforming value and refuses a non-conforming one", async () => {
    const { validate } = await frontmatter();
    const cases = [
      ["change", "core/C5", "C5"],
      ["change", "guard/F23a", "guard/f23"],
      ["owner", "KAAL Definition", "  padded "],
      ["status", "accepted", "done"],
      ["target", `{ name: KAAL Definition, id: "${ID}" }`, "{ name: KAAL Definition }"],
      ["file", "packages/kaal-core/README.md", "../outside.md"],
      ["file", "a/b.md", "/absolute.md"],
      ["files", "[a.md, b/c.md]", "[a.md, ./b.md]"],
      ["gated", "true", '"true"'],
      ["order", "3", '"3"'],
      ["command", "test:plan", "rm -rf /"],
    ];
    for (const [key, good, bad] of cases) {
      const front = key === "change" ? `kind: core/K1\n` : base;
      assert.equal(validate(doc(`${front}${key}: ${good}\n`), [SCHEMA]).verdict, "valid", `${key}: ${good}`);
      const r = validate(doc(`${front}${key}: ${bad}\n`), [SCHEMA]);
      assert.equal(r.verdict, "invalid", `${key}: ${bad}`);
      assert.ok(keys(r).includes(key), `${key}: ${bad}`);
    }
  });

  it("core/T6 [F4]: a missing required key, and a list where none is declared, are invalid", async () => {
    const { validate } = await frontmatter();
    const missing = validate(doc("kind: core/K1\n"), [SCHEMA]);
    assert.equal(missing.verdict, "invalid");
    assert.deepEqual(keys(missing), ["change"]);
    const listed = validate(doc(`${base}file: [a.md, b.md]\n`), [SCHEMA]);
    assert.equal(listed.verdict, "invalid");
    assert.deepEqual(keys(listed), ["file"]);
  });

  it("core/T7 [I2, F6]: an artifact with no kind, or with a kind that has no schema, is unknown", async () => {
    const { validate } = await frontmatter();
    assert.equal(validate(doc("change: core/C5\n"), [SCHEMA]).verdict, "unknown");
    assert.equal(validate(doc("kind: guard/K9\nchange: core/C5\n"), [SCHEMA]).verdict, "unknown");
    assert.equal(validate(doc(base), []).verdict, "unknown");
  });

  it("core/T8 [N2]: validating the same bytes twice gives equal results", async () => {
    const { validate } = await frontmatter();
    for (const front of [base, `${base}colour: blue\n`, "change: core/C5\n"]) {
      const bytes = doc(front);
      assert.deepEqual(validate(bytes, [SCHEMA]), validate(Buffer.from(bytes), [SCHEMA]));
    }
  });

  it("core/T9 [A1]: the kaal-core/frontmatter module graph imports no host module", async () => {
    await frontmatter();
    const seen = new Set();
    const host = [];
    const visit = (url) => {
      if (seen.has(url)) return;
      seen.add(url);
      const source = readFileSync(new URL(url), "utf8");
      for (const [, spec] of source.matchAll(/\bfrom\s+["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) {
        if (!spec) continue;
        if (spec.startsWith("node:") || spec === "kaal-hosting" || spec.startsWith("kaal-hosting/")) host.push(spec);
        else if (spec.startsWith(".")) visit(new URL(spec, url).href);
        else visit(import.meta.resolve(spec, url));
      }
    };
    visit(import.meta.resolve("kaal-core/frontmatter"));
    assert.deepEqual(host, []);
  });
});
