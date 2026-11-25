// core/C53 planned outer tests: generic installation integrity. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/installation-integrity/*.md). They are written
// against the provisional entry point and shapes of core/A53, `kaal-core/integrity`, and read the
// verdict as data, never a message. The case whose decision is the CTO's is in testing.md.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** `kaal-core/integrity`, or the reason the tests are blocked before any behavioural assertion. */
async function integrity() {
  let m;
  try {
    m = await import("kaal-core/integrity");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./integrity (${e.code ?? e.message})`);
  }
  for (const name of ["verifyInstallation", "exitStatus"]) {
    if (typeof m[name] !== "function") assert.fail(`blocked before behavioural assertion: kaal-core/integrity exports no ${name}`);
  }
  return m;
}

const sha = (text) => createHash("sha256").update(text).digest("hex");
const set = (files) => Object.fromEntries(Object.entries(files).map(([path, text]) => [path, sha(text)]));
/** The tree digest core/F101 states: SHA-256 over the sorted lines `path NUL sha256 LF`. */
const tree = (digests) => sha(Object.keys(digests).sort().map((p) => `${p}\0${digests[p]}\n`).join(""));

const entity = { kind: "capability", name: "x" };
const establisher = { role: "gate", id: "release/gate" };
/** One source of evidence: the manifest names the entity and every asset, the digests and the tree digest follow. */
const source = (kind, files, extra = {}) => {
  const digests = set(files);
  return { kind, origin: `x@1.0.0#${kind}`, manifest: { kind: "capability", name: "x", version: "1.0.0", assets: Object.keys(digests) }, files: digests, treeDigest: tree(digests), ...extra };
};
const KINDS = { installed: ["artifact", "tag"], engineering: ["package"], deployed: ["selected"] };
const evidence = (files, comparison = "engineering") => ({ establisher, sources: KINDS[comparison].map((k) => source(k, files)) });
const verify = (m, expected, observed, { comparison = "engineering", ...extra } = {}) =>
  m.verifyInstallation({ entity, version: "1.0.0", comparison, evidence: evidence(expected, comparison), observed: set(observed), ...extra });

describe("Installation integrity (core/C53)", () => {
  it("core/T110 [core/F100, core/N29, core/A53]: the verdict lists missing, unexpected and modified assets by content identity, in path order, and is aligned only when none exist; the same bytes at another path are one missing and one unexpected; the same name with other bytes is modified", async () => {
    const m = await integrity();
    const files = { "a.md": "a", "dir/b.md": "b", "dir/c.md": "c" };
    const same = verify(m, files, files);
    assert.equal(same.status, "aligned");
    assert.deepEqual([same.missing, same.unexpected, same.modified], [[], [], []]);
    const gone = verify(m, files, { "a.md": "a", "dir/b.md": "b" });
    assert.equal(gone.status, "differs");
    assert.deepEqual(gone.missing, ["dir/c.md"]);
    const extra = verify(m, files, { ...files, "z.md": "z", "dir/y.md": "y" });
    assert.deepEqual(extra.unexpected, ["dir/y.md", "z.md"], "path order");
    const changed = verify(m, files, { ...files, "a.md": "changed" });
    assert.deepEqual(changed.modified, ["a.md"], "the same name with other bytes is modified");
    assert.deepEqual([changed.missing, changed.unexpected], [[], []]);
    const moved = verify(m, files, { "a.md": "a", "dir/b.md": "b", "elsewhere/c.md": "c" });
    assert.deepEqual([moved.missing, moved.unexpected, moved.modified], [["dir/c.md"], ["elsewhere/c.md"], []], "the same bytes at another path are one missing and one unexpected");
    assert.equal(JSON.stringify(verify(m, files, files)), JSON.stringify(verify(m, files, files)), "the same input gives the same result");
  });

  it("core/T111 [core/F101, core/F110, core/A53]: evidence that is absent, names no establisher, is unavailable, or whose source is the installation or its own record gives unknown with a reason code, never aligned", async () => {
    const m = await integrity();
    const files = { "a.md": "a" };
    const ev = evidence(files);
    const cases = [
      ["unavailable", undefined],
      ["unavailable", { establisher, sources: [] }],
      ["unavailable", { establisher, sources: ev.sources, unavailable: true }],
      ["no-establisher", { sources: ev.sources }],
      ["no-establisher", { establisher: {}, sources: ev.sources }],
      ["self-authority", { establisher, sources: [source("installation", files)] }],
      ["self-authority", { establisher, sources: [source("record", files)] }],
    ];
    for (const [reason, evidence_] of cases) {
      const r = m.verifyInstallation({ entity, version: "1.0.0", comparison: "engineering", evidence: evidence_, observed: set(files) });
      assert.equal(r.status, "unknown", `unknown for ${reason}`);
      assert.equal(r.reason, reason);
    }
    assert.equal(m.verifyInstallation({ entity, version: "1.0.0", comparison: "engineering", expected: set(files), observed: set(files) }).status, "unknown", "a bare expected set, a label, is no evidence");
  });

  it("core/T112 [core/F102, core/F110, core/A53]: the result names the entity, the version, the comparison, the establisher and each source; a source naming another entity or version is unknown (identity); another version's evidence gives that version's differences", async () => {
    const m = await integrity();
    const v1 = { "a.md": "one" }; const v2 = { "a.md": "two", "b.md": "b" };
    const r = verify(m, v1, v1);
    assert.deepEqual(r.entity, entity);
    assert.equal(r.version, "1.0.0");
    assert.equal(r.comparison, "engineering");
    assert.deepEqual(r.establisher, establisher);
    assert.deepEqual(r.sources.map((s) => [s.kind, s.origin]), [["package", "x@1.0.0#package"]]);
    const wrongVersion = m.verifyInstallation({ entity, version: "2.0.0", comparison: "engineering", evidence: evidence(v2), observed: set(v1) });
    assert.equal(wrongVersion.status, "unknown", "a source whose manifest names version 1.0.0 is not evidence for 2.0.0");
    assert.equal(wrongVersion.reason, "identity");
    const named = (name) => { const ev = evidence(v1); ev.sources[0].manifest.name = name; return m.verifyInstallation({ entity, version: "1.0.0", comparison: "engineering", evidence: ev, observed: set(v1) }); };
    assert.equal(named("y").reason, "identity", "another entity");
    const ev2 = evidence(v2); ev2.sources[0].manifest.version = "2.0.0"; ev2.sources[0].origin = "x@2.0.0#package";
    const other = m.verifyInstallation({ entity, version: "2.0.0", comparison: "engineering", evidence: ev2, observed: set(v1) });
    assert.deepEqual([other.status, other.missing, other.modified], ["differs", ["b.md"], ["a.md"]], "that version's differences");
    assert.equal(r.status, "aligned", "and nothing of the other leaks into the first");
  });

  it("core/T113 [core/F103, core/N28, core/A55]: the same call judges a Capability, an Agent, a Skill, an Extension and an entity nobody has heard of, and the module holds no name of another package and imports only what Core already depends on", async () => {
    const m = await integrity();
    for (const kind of ["capability", "agent", "skill", "extension", "something-core-has-never-heard-of"]) {
      const e = { kind, name: "n" };
      const src = source("package", { p: "p" }); src.manifest = { ...src.manifest, kind, name: "n" };
      const ev = { establisher, sources: [src] };
      assert.equal(m.verifyInstallation({ entity: e, version: "1.0.0", comparison: "engineering", evidence: ev, observed: set({ p: "p" }) }).status, "aligned", `a ${kind}`);
      assert.equal(m.verifyInstallation({ entity: e, version: "1.0.0", comparison: "engineering", evidence: ev, observed: {} }).status, "differs");
    }
    const here = new URL("../../", import.meta.url);
    const text = readFileSync(new URL("dist/integrity.js", here), "utf8");
    const specifiers = [...text.matchAll(/(?:import|export)[^"']*from\s*["']([^"']+)["']/g)].map((x) => x[1]);
    for (const s of specifiers) assert.ok(s.startsWith("./") || s.startsWith("node:") || s.startsWith("@kaihacksai/kaal-hosting") || s.startsWith("@kaihacksai/kaal-foundation"), `imports only what Core depends on: ${s}`);
    const others = readdirSync(new URL("../", here)).filter((d) => d.startsWith("kaal-") && d !== "kaal-core");
    for (const name of others) assert.ok(!text.includes(name), `the module names no other package: ${name}`);
  });

  it("core/T114 [core/F104, core/A56]: a discrepancy exits 0, exits 1 only when enforcement is requested, and unknown exits 2 whatever is requested", async () => {
    const m = await integrity();
    const ok = verify(m, { "a.md": "a" }, { "a.md": "a" });
    const bad = verify(m, { "a.md": "a" }, { "a.md": "b" });
    const unknown = m.verifyInstallation({ entity, version: "1.0.0", comparison: "engineering", observed: set({ "a.md": "a" }) });
    assert.equal(m.exitStatus(ok, { enforce: false }), 0);
    assert.equal(m.exitStatus(ok, { enforce: true }), 0);
    assert.equal(m.exitStatus(bad, { enforce: false }), 0, "a finding is not a veto");
    assert.equal(m.exitStatus(bad, { enforce: true }), 1, "a veto only when enforced");
    assert.equal(m.exitStatus(unknown, { enforce: false }), 2, "unknown is never clean");
    assert.equal(m.exitStatus(unknown, { enforce: true }), 2);
  });

  it("core/T115 [core/F108, core/F110, core/A53]: a source whose tree digest does not match, or that lacks an asset its manifest lists, is unknown (digest, incomplete), whatever the installation holds", async () => {
    const m = await integrity();
    const files = { "a.md": "a", "b.md": "b" };
    const run = (change) => { const ev = evidence(files); change(ev.sources[0]); return m.verifyInstallation({ entity, version: "1.0.0", comparison: "engineering", evidence: ev, observed: set(files) }); };
    const tampered = run((s) => { s.files["a.md"] = sha("tampered"); });
    assert.deepEqual([tampered.status, tampered.reason], ["unknown", "digest"], "a digest changed after the tree digest was stated");
    const truncated = run((s) => { delete s.files["b.md"]; s.treeDigest = tree(s.files); });
    assert.deepEqual([truncated.status, truncated.reason], ["unknown", "incomplete"], "an asset the manifest lists is not in the source, even with a consistent tree digest");
    const restated = run((s) => { s.treeDigest = "0".repeat(64); });
    assert.equal(restated.reason, "digest");
    assert.equal(run(() => {}).status, "aligned", "an intact source is judged");
  });

  it("core/T116 [core/F106, core/F109, core/F110]: the three comparisons require their sources (installed the artifact and its tag, engineering the package, deployed the selected source), a missing one is unknown (unavailable), and an artifact and a tag that disagree are unknown (disagree) with the differing paths, never aligned and never a difference", async () => {
    const m = await integrity();
    const files = { "a.md": "a" };
    for (const comparison of ["installed", "engineering", "deployed"]) {
      assert.equal(verify(m, files, files, { comparison }).status, "aligned", `${comparison} with its sources`);
    }
    const only = (kinds) => ({ establisher, sources: kinds.map((k) => source(k, files)) });
    const judge = (comparison, ev) => m.verifyInstallation({ entity, version: "1.0.0", comparison, evidence: ev, observed: set(files) });
    assert.deepEqual([judge("installed", only(["artifact"])).status, judge("installed", only(["artifact"])).reason], ["unknown", "unavailable"], "the artifact alone is not enough for .kaal/");
    assert.equal(judge("installed", only(["tag"])).reason, "unavailable", "nor is the tag alone");
    assert.equal(judge("engineering", only(["artifact"])).reason, "unavailable", "engineering needs the package, not a published artifact");
    assert.equal(judge("deployed", only(["package"])).reason, "unavailable", "a deployment needs its selected source");
    const ev = only(["artifact", "tag"]);
    ev.sources[1] = source("tag", { "a.md": "other", "extra.md": "e" });
    const disagree = judge("installed", ev);
    assert.deepEqual([disagree.status, disagree.reason], ["unknown", "disagree"], "never aligned and never a difference");
    assert.deepEqual(disagree.differs, ["a.md", "extra.md"], "the differing paths are data");
    assert.deepEqual([disagree.missing, disagree.unexpected, disagree.modified], [[], [], []], "no verdict against either source");
  });

  it("core/T117 [core/F105, core/F110]: a variant is accepted only when its owner and path match the ownership declaration, not-owner and no-ownership are unknown, a location is verified against the one set selected for it, and matching another set is a difference that names it", async () => {
    const m = await integrity();
    const base = { "a.md": "base" }; const variant = { "a.md": "variant" };
    const ownership = { owner: "x", paths: ["packages/x/"] };
    const judge = (observed, { selected = "external", supplier = { owner: "x", path: "packages/x/external/" }, own = ownership } = {}) =>
      m.verifyInstallation({
        entity, version: "1.0.0", comparison: "engineering",
        evidence: { establisher, sources: [source("package", base)], variants: { external: { suppliedBy: supplier, sources: [source("package", variant)] } } },
        observed: set(observed), ownership: own, selected,
      });
    assert.equal(judge(variant).status, "aligned", "the owner's variant, selected, matches");
    assert.deepEqual([judge(variant, { supplier: { owner: "y", path: "packages/x/external/" } }).status, judge(variant, { supplier: { owner: "y", path: "packages/x/external/" } }).reason], ["unknown", "not-owner"], "supplied by another capability");
    assert.equal(judge(variant, { supplier: { owner: "x", path: "packages/y/external/" } }).reason, "not-owner", "from a path the owner has not been given");
    assert.equal(judge(variant, { own: null }).reason, "no-ownership", "no declaration, no variant");
    const selectedBase = judge(variant, { selected: "base" });
    assert.equal(selectedBase.status, "differs", "a variant is no blanket exemption: the location was selected against the base");
    assert.equal(selectedBase.matches, "external", "and the result names the set it matches");
    assert.equal(judge(base, { selected: "base" }).status, "aligned");
  });
});
