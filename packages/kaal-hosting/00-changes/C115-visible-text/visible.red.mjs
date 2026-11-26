// hosting/C115 executable drafts (RED on main: the declaration format has no `visible`). The DO turns them into delivered
// Cases unchanged. Written against the C113 generator; the raise Case (T335) uses C113's stand-in transport.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";

const LINE = "**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.";
const HOTFIX = {
  type: "HOTFIX",
  intro: "A HOTFIX. Four chapters.",
  visible: LINE,
  chapters: [{ name: "Change", guidance: "One line." }, { name: "Defect", guidance: "What is broken." }],
};
const chapters = { Change: "C1 name", Defect: "cap/D1 broken" };

it("hosting/T332: visible text renders plain, after the intro and before the chapters, in the template and in the body", () => {
  const template = hosting.renderTemplate(HOTFIX);
  assert.equal(template, [
    "<!-- KAAL-PR-template: HOTFIX -->", "", "<!-- A HOTFIX. Four chapters. -->", "", LINE, "",
    "## Change", "", "<!-- One line. -->", "", "## Defect", "", "<!-- What is broken. -->", "",
  ].join("\n"));
  assert.equal(hosting.renderBody(HOTFIX, chapters), `${LINE}\n\n## Change\n\nC1 name\n\n## Defect\n\ncap/D1 broken\n`);
  const { visible, ...plain } = HOTFIX;
  assert.equal(hosting.renderBody(plain, chapters), "## Change\n\nC1 name\n\n## Defect\n\ncap/D1 broken\n");
  assert.equal(hosting.renderTemplate(plain).includes(LINE), false);
});

it("hosting/T333: invalid visible text is refused, CRLF comes out as LF", () => {
  for (const visible of ["", "  ", 7, "a <!-- b", "a --> b", "ok\n# Extra chapter", "ok\r\n## Extra"]) {
    for (const render of [hosting.renderTemplate, (d) => hosting.renderBody(d, chapters)]) {
      assert.throws(() => render({ ...HOTFIX, visible }), (e) => e.code === "INVALID_DECLARATION" && /visible/.test(e.message));
    }
  }
  assert.equal(hosting.renderTemplate({ ...HOTFIX, visible: "one\r\ntwo" }).includes("\r"), false);
});

it("hosting/T334: checkTemplates names a template without or with changed visible text as differs", async () => {
  const { mkdtempSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = mkdtempSync(join(tmpdir(), "c115-"));
  writeFileSync(join(dir, "hotfix.md"), hosting.renderTemplate(HOTFIX));
  assert.equal((await hosting.checkTemplates([HOTFIX], dir)).ok, true);
  writeFileSync(join(dir, "hotfix.md"), hosting.renderTemplate({ ...HOTFIX, visible: undefined }));
  assert.deepEqual((await hosting.checkTemplates([HOTFIX], dir)).problems, [{ file: "hotfix.md", problem: "differs" }]);
  writeFileSync(join(dir, "hotfix.md"), hosting.renderTemplate({ ...HOTFIX, visible: "other" }));
  assert.deepEqual((await hosting.checkTemplates([HOTFIX], dir)).problems, [{ file: "hotfix.md", problem: "differs" }]);
});

// T335 reuses the C113 raise fixtures (stand-in GitHub, owner declaration at the base revision); its draft is added
// beside them by the DO, unchanged in expectation: the opened body starts with the owner's `visible`, and a request
// that carries `visible` is RAISE_REFUSED (rule `caller-authority`) before any call.
