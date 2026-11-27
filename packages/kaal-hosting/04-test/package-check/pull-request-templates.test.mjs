// hosting/C113 delivered cases: pull request templates and bodies rendered from the declared types
// (hosting/F93 to hosting/F96; hosting/T303 to hosting/T309). They reach Hosting by its name, as a consumer does, and write only to the
// operating system's temporary directory.
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { it } from "node:test";
import { join } from "node:path";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO, HOTFIX, SYNC, chapters } from "./pull-request-fixtures.mjs";

it("hosting/T303: renderTemplate gives the declared type, intro and chapters as exact bytes", () => {
  const withIntro = [
    "<!-- KAAL-PR-template: DO -->", "", "<!-- A DO pull request. Exactly three chapters. -->", "",
    "## Change", "", "<!-- One line: the id and name. -->", "",
    "## Implement", "", "<!-- What this DO delivers. -->", "",
    "## Refactor", "", "<!-- What improves while behaviour stays. -->", "",
  ].join("\n");
  assert.equal(hosting.renderTemplate(DO), withIntro);
  const { intro, ...noIntro } = DO;
  assert.equal(hosting.renderTemplate(noIntro), withIntro.replace("<!-- A DO pull request. Exactly three chapters. -->\n\n", ""));
  assert.equal(withIntro.endsWith("-->\n"), true, "one line end after the last chapter");
});

it("hosting/T304: the same declaration renders the same bytes, and CRLF in the declaration comes out as LF", () => {
  assert.equal(hosting.renderTemplate(DO), hosting.renderTemplate(structuredClone(DO)));
  const crlf = structuredClone(DO);
  crlf.intro = "A DO pull request.\r\nExactly three chapters.";
  crlf.chapters[0].guidance = "One line:\r\nthe id and name.";
  const out = hosting.renderTemplate(crlf);
  assert.equal(out.includes("\r"), false);
  assert.match(out, /<!-- A DO pull request\.\nExactly three chapters\. -->/);
  assert.match(out, /<!-- One line:\nthe id and name\. -->/);
});

it("hosting/T305: renderBody puts each chapter under its heading in the declared order, whatever the key order", () => {
  const expected = "## Change\n\nhosting generator\n\n## Implement\n\nAdds the generator.\n\n## Refactor\n\nNone planned.\n";
  assert.equal(hosting.renderBody(DO, chapters), expected);
  assert.equal(hosting.renderBody(DO, { Refactor: "None planned.", Change: "hosting generator", Implement: "Adds the generator." }), expected);
  assert.equal(hosting.renderBody(DO, { ...chapters, Change: "  hosting generator\r\n" }), expected, "text is trimmed and LF");
});

const refused = (fn, code) => assert.throws(fn, (e) => e.code === code, `expected ${code}`);

it("hosting/T306: renderBody refuses a missing, an unknown and an empty chapter, and a declaration without chapters", () => {
  const { Refactor, ...missing } = chapters;
  refused(() => hosting.renderBody(DO, missing), "MISSING_CHAPTER");
  refused(() => hosting.renderBody(DO, { ...chapters, Extra: "x" }), "UNKNOWN_CHAPTER");
  refused(() => hosting.renderBody(DO, { ...chapters, Refactor: "  \n " }), "MISSING_CHAPTER");
  refused(() => hosting.renderBody({ ...DO, chapters: [] }, {}), "INVALID_DECLARATION");
  assert.throws(() => hosting.renderBody(DO, missing), /Refactor/, "the error names the chapter");
});

it("hosting/T307: invalid declarations are refused by renderTemplate and renderBody, with INVALID_DECLARATION", () => {
  const bad = {
    "a lower-case type": { ...DO, type: "do" },
    DEFAULT: { ...DO, type: "DEFAULT" },
    "a chapter without a name": { ...DO, chapters: [{ guidance: "x" }] },
    "a repeated chapter name": { ...DO, chapters: [DO.chapters[0], DO.chapters[0]] },
    "a field outside the format": { ...DO, colour: "red" },
    "guidance that closes a comment": { ...DO, chapters: [{ name: "Change", guidance: "x --> y" }] },
    "a file name": { ...DO, file: "do.md" },
    "comment syntax": { ...DO, comment: "<!-- -->" },
    "a recognition rule": { ...DO, recognition: [{ base: "main" }] },
    "an auto-merge method outside the set": { ...DO, raise: { ...DO.raise, autoMerge: "fast-forward" } },
    "a title rule that is not a pattern": { ...DO, raise: { ...DO.raise, title: { forbid: ["("] } } },
  };
  for (const [why, declaration] of Object.entries(bad)) {
    for (const call of [() => hosting.renderTemplate(declaration), () => hosting.renderBody(declaration, {})]) {
      assert.throws(call, (e) => e.code === "INVALID_DECLARATION", why);
    }
  }
});

it("hosting/T308: checkTemplates names a missing, a differing and an undeclared template, and passes when all match", async () => {
  const dir = mkdtempSync(join(tmpdir(), "hosting-c113-"));
  const put = (name, text) => writeFileSync(join(dir, name), text);
  put("do.md", hosting.renderTemplate(DO));
  put("sync.md", hosting.renderTemplate(SYNC));
  put("hotfix.md", hosting.renderTemplate(HOTFIX));
  assert.deepEqual(await hosting.checkTemplates([DO, SYNC, HOTFIX], dir), { ok: true, problems: [] });
  put("sync.md", hosting.renderTemplate(SYNC) + "extra\n");
  put("old.md", "stale");
  writeFileSync(join(dir, "hotfix.md"), "");
  const second = await hosting.checkTemplates([DO, SYNC, HOTFIX, { ...DO, type: "ACT" }], dir);
  assert.equal(second.ok, false);
  assert.deepEqual(second.problems.map((p) => `${p.file}:${p.problem}`).sort(), ["act.md:missing", "hotfix.md:differs", "old.md:undeclared", "sync.md:differs"]);
});

it("hosting/T309: the generator files import no node:fs, node:child_process or node:http, and name no Change in shipped docs", () => {
  assert.equal(typeof hosting.renderTemplate, "function", "the generator is shipped");
  const dir = fileURLToPath(new URL("./github/", import.meta.resolve("@kaihacksai/kaal-hosting")));
  const sources = readdirSync(dir).filter((f) => /^(templates|pull-request-types|raise)[\w-]*\.(js|mjs)$/.test(f));
  assert.ok(sources.length >= 2, "the generator modules are found");
  for (const f of sources) {
    const text = readFileSync(join(dir, f), "utf8");
    assert.doesNotMatch(text, /from ["']node:(fs|child_process|http|https)["']|require\(["']node:(fs|child_process)/, f);
  }
});
