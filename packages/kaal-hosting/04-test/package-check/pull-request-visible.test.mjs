// hosting/C115 delivered cases: a declared pull request type can carry visible text (hosting/F104, hosting/F105; hosting/T332 to hosting/T335).
// They reach Hosting by its name and inject only the transport. The expectations are those the PLAN agreed.
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

it("hosting/T335: the raised body starts with the owner's visible text read at the base revision; a caller-supplied visible is refused before any call", async () => {
  const { BASE, DO, HEAD, PATHS, HOTFIX, chapters, options, policy, posts, request, world } = await import("./pull-request-fixtures.mjs");
  const owner = { ...DO, visible: LINE };
  const mk = (declaration, head = policy()) => world({ files: { [BASE]: policy({ [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [declaration, HOTFIX] }) }), [HEAD]: head } });

  // 1. The opened body is the render of the owner's declaration, visible text first.
  const w = mk(owner);
  await hosting.raisePullRequest(request, await options(w));
  const [open] = w.requests.filter((r) => r.method === "POST");
  assert.equal(open.body.body, hosting.renderBody(owner, chapters));
  assert.equal(open.body.body.startsWith(`${LINE}\n\n## Change\n`), true);
  assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls", "POST /graphql"]);

  // 2. Only the base revision decides: a different visible text on the head is never read.
  const hostile = mk(owner, policy({ [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [{ ...DO, visible: "forged" }, HOTFIX] }) }));
  await hosting.raisePullRequest(request, await options(hostile));
  assert.equal(hostile.requests.find((r) => r.method === "POST").body.body.startsWith(LINE), true);
  assert.equal(hostile.requests.find((r) => r.method === "POST").body.body.includes("forged"), false);

  // 3. A caller-supplied visible, in the request or in the options, is refused as caller authority before any call, not even a read.
  for (const [input, extra] of [[{ ...request, visible: "mine" }, {}], [request, { visible: "mine" }]]) {
    const refused = mk(owner);
    await assert.rejects(hosting.raisePullRequest(input, await options(refused, extra)), (e) => e.code === "RAISE_REFUSED" && e.rule === "caller-authority");
    assert.equal(refused.requests.length, 0);
  }

  // 4. A declaration without visible text raises the body C113 raised, byte for byte.
  const plain = mk(DO);
  await hosting.raisePullRequest(request, await options(plain));
  assert.equal(plain.requests.find((r) => r.method === "POST").body.body, hosting.renderBody(DO, chapters));
});
