// RED Cases for packaging/C24 (plan/structure/plan.md, #1049): the package folder structure Packaging
// owns and defends, packaging/T98 to T112. They fail until the structure checker exists at
// lib/structure.mjs, and they define its contract. They are not in test:publisher yet: run them with
//   node --test test/publisher/structure.test.mjs
// The DO makes them GREEN and wires them into test:publisher.
//
// Contract under test: checkStructure(dir, { packed, build }) judges one package folder.
//   packed  the paths `npm pack` would deliver, relative to the package folder (supplied by the caller)
//   build   (dir, out) => void, writes dist/ into `out`; supplied by the caller (Packaging requires a
//           reproducible result, not a tool)
// It returns { result, findings }: result is "verified", "failed", "unknown" or "not-in-layout";
// each finding is { kind, path }. Fixtures only. No network.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const STRUCTURE = join(HERE, "..", "..", "lib", "structure.mjs");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-structure-"));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));

const { checkStructure } = await import(STRUCTURE).catch((e) => {
  // RED: the module does not exist yet. Every Case below then fails on this one assertion.
  return { checkStructure: () => assert.fail(`lib/structure.mjs does not exist yet (${e.code ?? e.message})`) };
});

let made = 0;
const write = (root, rel, text = "x\n") => {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
};

/** The copies dist/ holds, built from the other folders. This is the build the fixtures supply. */
function build(dir, out) {
  const copy = (from, to) => existsSync(join(dir, from)) && cpSync(join(dir, from), join(out, to), { recursive: true });
  copy("05-src/AGENTS.md", "dist/AGENTS.md");
  copy("05-src/skills", "dist/skills");
  copy("01-intent", "dist/docs/intent");
  copy("02-requirements", "dist/docs/requirements");
  copy("03-architecture", "dist/docs/architecture");
  copy("06-defects", "dist/docs/defects");
  copy("kaal", "dist/kaal");
  copy("04-test/package-check", "dist/test/package-check");
  copy("04-test/boundary-check", "dist/test/boundary-check");
}

function filesUnder(root, base = "") {
  const out = [];
  for (const e of existsSync(join(root, base)) ? readdirSync(join(root, base), { withFileTypes: true }) : []) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...filesUnder(root, rel));
    else out.push(rel);
  }
  return out;
}

/** A package in the layout. `name` and `license` vary per fixture. Returns its folder. */
function layout({ name = "kaal-fixture", license = "MIT", skills = ["fixture"], withKaal = true } = {}) {
  const dir = join(SCRATCH, `${name}-${++made}`);
  mkdirSync(dir, { recursive: true });
  write(dir, "package.json", JSON.stringify({ name, version: "0.0.1", license, files: ["dist"] }, null, 2));
  write(dir, "LICENSE", `${license} License\n`);
  write(dir, "README.md", "# fixture\n");
  write(dir, "AGENTS.md", "engineering rules\n");
  write(dir, "00-changes/c1/plan.md");
  write(dir, "01-intent/intent.md");
  write(dir, "02-requirements/functional/f.md");
  write(dir, "02-requirements/non-functional/n.md");
  write(dir, "03-architecture/a.md");
  write(dir, "04-test/package-check/verify.json", "{}\n");
  write(dir, "04-test/boundary-check/boundary-check.md", "Not applicable: fixture\n");
  write(dir, "05-src/AGENTS.md", "agent instructions\n");
  for (const s of skills) {
    write(dir, `05-src/skills/${s}/SKILL.md`, `# ${s}\n`);
    write(dir, `05-src/skills/${s}/scripts/run.mjs`, "export {};\n");
  }
  write(dir, "06-defects/D1.md");
  if (withKaal) {
    write(dir, "kaal/Fixture.md");
    write(dir, "kaal/core/README.md");
    write(dir, "kaal/core/register.md");
  }
  build(dir, dir);
  return dir;
}
const packedOf = (dir) => [...filesUnder(dir, "dist"), "package.json", "README.md", "LICENSE"].sort();
const check = (dir, extra = {}) => checkStructure(dir, { packed: packedOf(dir), build, ...extra });
const kinds = (r) => r.findings.map((f) => f.kind);

describe("packaging/C24: the package folder structure", () => {
  it("T98 a package with the full layout is verified", async () => {
    const r = await check(layout());
    assert.equal(r.result, "verified", JSON.stringify(r.findings));
  });

  it("T99 a missing numbered folder, an unknown name and a duplicate number fail, each named", async () => {
    const dir = layout();
    rmSync(join(dir, "03-architecture"), { recursive: true });
    mkdirSync(join(dir, "07-misc"));
    mkdirSync(join(dir, "05-other"));
    const r = await check(dir);
    assert.equal(r.result, "failed");
    for (const k of ["missing-folder", "unknown-folder", "duplicate-number"]) assert.ok(kinds(r).includes(k), `${k} in ${kinds(r)}`);
    assert.ok(r.findings.some((f) => f.kind === "missing-folder" && f.path.includes("03-architecture")));
    assert.ok(r.findings.some((f) => f.kind === "unknown-folder" && f.path.includes("07-misc")));
  });

  it("T100 scripts outside a skill, a skill without SKILL.md and an agent/ folder fail", async () => {
    const a = layout();
    mkdirSync(join(a, "scripts"));
    assert.ok(kinds(await check(a)).includes("misplaced-script"), "scripts/ at the package root");
    const b = layout();
    write(b, "05-src/scripts/x.mjs");
    assert.ok(kinds(await check(b)).includes("misplaced-script"), "scripts/ in 05-src outside a skill");
    const c = layout();
    rmSync(join(c, "05-src/skills/fixture/SKILL.md"));
    assert.ok(kinds(await check(c)).includes("skill-without-skill-md"));
    const d = layout();
    write(d, "05-src/agent/AGENTS.md");
    assert.ok(kinds(await check(d)).includes("agent-folder"), "05-src/agent/ does not exist in the layout");
    const e = layout();
    write(e, "dist/AGENTS.md", "different\n");
    assert.ok(kinds(await check(e)).includes("dist-copy-differs"), "dist/AGENTS.md must equal 05-src/AGENTS.md");
  });

  it("T101 files other than [\"dist\"] fail", async () => {
    for (const files of [["dist", "lib"], [], ["lib"]]) {
      const dir = layout();
      write(dir, "package.json", JSON.stringify({ name: "kaal-fixture", version: "0.0.1", license: "MIT", files }));
      assert.ok(kinds(await check(dir)).includes("files-not-dist"), JSON.stringify(files));
    }
  });

  it("T102 a packed file outside dist/ fails, npm's fixed root files do not", async () => {
    const dir = layout();
    const ok = await checkStructure(dir, { packed: packedOf(dir), build });
    assert.equal(ok.result, "verified");
    const bad = await checkStructure(dir, { packed: [...packedOf(dir), "05-src/AGENTS.md", "lib/x.mjs"], build });
    assert.equal(bad.result, "failed");
    assert.ok(bad.findings.some((f) => f.kind === "packed-outside-dist" && f.path === "lib/x.mjs"));
    assert.ok(bad.findings.some((f) => f.kind === "packed-outside-dist" && f.path === "05-src/AGENTS.md"));
    // Equality, not only containment: a dist/ file left out of the pack is a failure too.
    const omitted = await checkStructure(dir, { packed: packedOf(dir).filter((f) => f !== "dist/AGENTS.md"), build });
    assert.equal(omitted.result, "failed");
    assert.ok(omitted.findings.some((f) => f.kind === "dist-not-packed" && f.path === "dist/AGENTS.md"));
    const noChecks = await checkStructure(dir, { packed: packedOf(dir).filter((f) => !f.startsWith("dist/test/")), build });
    assert.ok(noChecks.findings.some((f) => f.kind === "dist-not-packed"), "shipped checks missing from the pack");
  });

  it("T103 a missing LICENSE or a license field the file contradicts fails, but packages may differ", async () => {
    const none = layout();
    rmSync(join(none, "LICENSE"));
    assert.ok(kinds(await check(none)).includes("license"), "LICENSE missing");
    const mismatch = layout({ license: "MIT" });
    write(mismatch, "LICENSE", "ISC License\n");
    assert.ok(kinds(await check(mismatch)).includes("license"), "license field MIT, file ISC");
    const mit = layout({ name: "kaal-a", license: "MIT" });
    const isc = layout({ name: "kaal-b", license: "ISC" });
    assert.equal((await check(mit)).result, "verified");
    assert.equal((await check(isc)).result, "verified", "no cross-package license rule");
  });

  it("T104 a package on the old layout is reported not in the layout, neither verified nor failed", async () => {
    const dir = join(SCRATCH, `old-${++made}`);
    write(dir, "package.json", JSON.stringify({ name: "kaal-old", version: "0.0.1", license: "MIT", files: ["lib", "docs"] }));
    write(dir, "plan/p.md");
    write(dir, "lib/x.mjs");
    write(dir, "docs/intent.md");
    const r = await checkStructure(dir, { packed: ["package.json", "lib/x.mjs", "docs/intent.md"], build });
    assert.equal(r.result, "not-in-layout");
  });

  it("T105 an unreadable folder or pack is unknown, never verified", async () => {
    assert.equal((await checkStructure(join(SCRATCH, "does-not-exist"), { packed: [], build })).result, "unknown");
    const dir = layout();
    assert.equal((await checkStructure(dir, { build })).result, "unknown", "no pack was supplied");
  });

  it("T106 building dist/ twice gives the same bytes, and a hand-edited dist/ fails", async () => {
    const dir = layout();
    assert.equal((await check(dir)).result, "verified");
    write(dir, "dist/skills/fixture/scripts/run.mjs", "// hand edited\n");
    assert.ok(kinds(await check(dir)).includes("dist-not-reproducible"));
    const flaky = layout();
    let n = 0;
    // The first build equals the existing dist/ and only later builds differ, so a checker that builds once and
    // compares with the tree on disk passes; only comparing two builds with each other catches it.
    const nondeterministic = (d, out) => {
      build(d, out);
      if (++n > 1) writeFileSync(join(out, "dist/stamp.txt"), String(n));
    };
    assert.ok(kinds(await check(flaky, { build: nondeterministic })).includes("dist-not-reproducible"), "two builds differ");
    assert.ok(n >= 2, "dist/ is built at least twice to judge reproducibility");
  });

  it("T107 the shipped checks, docs and defects equal their sources, and a missing copy fails", async () => {
    const stale = layout();
    write(stale, "01-intent/intent.md", "changed after the build\n");
    assert.ok(kinds(await check(stale)).includes("dist-copy-differs"), "edited a source without rebuilding");
    const noBoundary = layout();
    rmSync(join(noBoundary, "dist/test/boundary-check"), { recursive: true });
    assert.ok(kinds(await check(noBoundary)).includes("dist-copy-missing"), "boundary-check record not shipped");
    const noPackageCheck = layout();
    rmSync(join(noPackageCheck, "dist/test/package-check"), { recursive: true });
    assert.ok(kinds(await check(noPackageCheck)).includes("dist-copy-missing"), "package-check not shipped");
    const noDefects = layout();
    rmSync(join(noDefects, "dist/docs/defects"), { recursive: true });
    assert.ok(kinds(await check(noDefects)).includes("dist-copy-missing"), "accepted defects not shipped");
  });

  it("T135 04-test/engineering-check/ is allowed and optional, is not shipped, and an unknown 04-test folder fails (Owner decision, 5 Nov)", async () => {
    const without = layout();
    assert.equal((await check(without)).result, "verified", "optional: a package may have none");
    const withEng = layout();
    write(withEng, "04-test/engineering-check/regression.test.mjs", "export {};\n");
    const r = await check(withEng);
    assert.equal(r.result, "verified", JSON.stringify(r.findings));
    assert.ok(!packedOf(withEng).some((p) => p.includes("engineering-check")), "it is not copied into dist/");
    const unknown = layout();
    write(unknown, "04-test/misc/x.md");
    assert.ok(kinds(await check(unknown)).includes("unknown-folder"), "04-test allows only package-check, boundary-check and engineering-check");
  });

  it("T136 a copy of engineering-check inside dist/ is shipped by mistake and fails", async () => {
    const dir = layout();
    write(dir, "04-test/engineering-check/regression.test.mjs", "export {};\n");
    write(dir, "dist/test/engineering-check/regression.test.mjs", "export {};\n");
    const r = await check(dir);
    assert.equal(r.result, "failed");
    assert.ok(kinds(r).includes("dist-copy-extra"), kinds(r).join());
  });

  it("T108 empty numbered folders and a package with no skill are verified", async () => {
    const dir = layout({ skills: [], withKaal: false });
    for (const f of ["01-intent", "02-requirements/functional", "02-requirements/non-functional", "03-architecture", "06-defects", "04-test/package-check", "04-test/boundary-check"]) {
      rmSync(join(dir, f), { recursive: true, force: true });
      write(dir, `${f}/.gitkeep`, "");
    }
    rmSync(join(dir, "dist"), { recursive: true, force: true });
    build(dir, dir);
    const r = await check(dir);
    assert.equal(r.result, "verified", JSON.stringify(r.findings));
  });

  it("T109 a hostile path (a symlink out of the folder) is refused and reported unknown", async () => {
    const dir = layout();
    const outside = join(SCRATCH, `outside-${++made}`);
    mkdirSync(outside);
    symlinkSync(outside, join(dir, "dist", "escape"));
    const r = await checkStructure(dir, { packed: [...packedOf(dir), "dist/escape/x"], build });
    assert.equal(r.result, "unknown");
    assert.ok(kinds(r).includes("refused-path"));
    const traversal = await checkStructure(layout(), { packed: ["../x", "package.json"], build });
    assert.equal(traversal.result, "unknown", "a traversal path in the pack list");
  });

  it("T110 the same checker judges any package and reads no package name", async () => {
    const hosting = layout({ name: "kaal-hosting" });
    const other = layout({ name: "kaal-anything" });
    const [a, b] = [await check(hosting), await check(other)];
    assert.equal(a.result, b.result);
    assert.deepEqual(kinds(a), kinds(b));
    const source = readFileSync(STRUCTURE, "utf8");
    for (const name of ["kaal-hosting", "kaal-core", "kaal-guard", "kaal-foundation", "kaal-testing"]) assert.ok(!source.includes(name), `the checker names ${name}`);
  });

  it("T111 kaal/<Name>.md and kaal/<capability>/ are checked for shape and for their shipped copy only", async () => {
    const ok = layout();
    assert.equal((await check(ok)).result, "verified", "kaal/Fixture.md, kaal/core/{README,register}.md");
    const noReadme = layout();
    rmSync(join(noReadme, "kaal/core/README.md"));
    build(noReadme, noReadme);
    rmSync(join(noReadme, "dist/kaal/core/README.md"), { force: true });
    assert.ok(kinds(await check(noReadme)).includes("kaal-shape"), "a capability folder with no README.md");
    const notMd = layout();
    write(notMd, "kaal/core/run.sh");
    build(notMd, notMd);
    assert.ok(kinds(await check(notMd)).includes("kaal-shape"), "a non-.md file in a capability folder");
    const upper = layout();
    write(upper, "kaal/Core/README.md");
    build(upper, upper);
    assert.ok(kinds(await check(upper)).includes("kaal-shape"), "an uppercase capability folder");
    const nested = layout();
    write(nested, "kaal/core/deep/README.md");
    build(nested, nested);
    assert.ok(kinds(await check(nested)).includes("kaal-shape"), "a nested capability folder");
    const loose = layout();
    write(loose, "kaal/notes.txt");
    build(loose, loose);
    assert.ok(kinds(await check(loose)).includes("kaal-shape"), "a non-.md file directly in kaal/");
    const missingCopy = layout();
    rmSync(join(missingCopy, "dist/kaal/Fixture.md"));
    assert.ok(kinds(await check(missingCopy)).includes("dist-copy-missing"), "kaal/<Name>.md not shipped");
    const unknown = layout();
    write(unknown, "kaal/anything-at-all/README.md");
    write(unknown, "kaal/anything-at-all/any-command.md");
    build(unknown, unknown);
    assert.equal((await check(unknown)).result, "verified", "a capability or command unknown to Packaging is fine");
    const leftover = layout();
    mkdirSync(join(leftover, "payload"));
    assert.equal((await check(leftover)).result, "not-in-layout", "a leftover payload/ folder");
  });

  it("T112 a kaal/ doc implies no package.json dependency", async () => {
    const dir = layout();
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    assert.equal(pkg.dependencies, undefined);
    const r = await check(dir);
    assert.equal(r.result, "verified", "kaal/core/ is documented and core is not a dependency");
    assert.ok(!kinds(r).some((k) => /depend/.test(k)), "no dependency finding is raised from kaal/");
  });
});
