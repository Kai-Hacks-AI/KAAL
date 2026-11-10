// release-management/T16 to T21 (Change): the Change documents describe A to B, reference B by id and never redefine it, and nothing of
// B was lost on the way. Read with the Markdown parser, never by a regex over the raw file.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { AREA, ROOT_DOCUMENTS, definitions, nodes, parseFile, textOf, tokens } from "../04-test/records.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY_FILES = ["current-state.md", "gaps.md", "transformation.md", "interim-states.md"];
const CHANGE_IDS = /^(G\d+|F20|T12|T13|T14|T1[6-9]|T2[0-9]|T30|T4[5-9]|T5[01])$/;
const NORMATIVE = /\b(must|shall|should)\b|\b(is|are|be) required\b/i; // "required context" is the name of a ruleset's status check, not a requirement
const PULL_REQUESTS = ["#1323", "#1324", "#1325", "#1326", "#1327"];

const changeFiles = () => readdirSync(HERE).filter((f) => f.endsWith(".md") && f !== "README.md").map((f) => `00-changes/${f}`);
const defined = (files) => files.flatMap((f) => (existsSync(join(AREA, f)) ? definitions(f) : []));
const entries = (file) => (existsSync(join(AREA, file)) ? nodes(parseFile(file), "item") : []);
const memberOf = (item, label) => nodes(item, "paragraph").map(textOf).find((t) => t.startsWith(label)) ?? "";
const targetIds = (text) => [...text.matchAll(/\b([IFTA]\d+)\b/g)].map((m) => m[1]);
const rootIds = () => new Set(defined(ROOT_DOCUMENTS).map((d) => d.id));
const componentNames = () => new Set(nodes(parseFile("03-architecture/architecture.md"), "code").map((n) => n.literal));

describe("release-management/T16 every current-state entry and gap names the target it differs from", () => {
  for (const file of ["current-state.md", "gaps.md"]) {
    it(`${file} exists and each entry carries a Target that resolves in the root documents`, () => {
      const items = entries(`00-changes/${file}`);
      assert.ok(items.length > 0, `00-changes/${file} is missing or has no entries: current-state observations and gaps belong in Change, each with a Target member`);
      const known = rootIds();
      const components = componentNames();
      for (const item of items) {
        const target = memberOf(item, "Target:");
        const refs = targetIds(target);
        const comps = nodes(item, "code").map((n) => n.literal).filter((c) => components.has(c));
        assert.ok(refs.length + comps.length > 0, `entry without a Target: ${textOf(item).slice(0, 70)}`);
        for (const id of refs) assert.ok(known.has(id), `Target ${id} is not defined in the root documents: ${textOf(item).slice(0, 70)}`);
      }
    });
  }
});

describe("release-management/T17 migration requirements and Cases are defined in Change only", () => {
  it("the root documents define no Change id, and the Change documents define no target id", () => {
    const inRoot = defined(ROOT_DOCUMENTS).filter((d) => CHANGE_IDS.test(d.id)).map((d) => `${d.id} in ${d.file}`);
    assert.deepEqual(inRoot, [], "Change ids (gaps, F20, the migration Cases) are defined only under 00-changes");
    const inChange = defined(changeFiles()).filter((d) => !CHANGE_IDS.test(d.id)).map((d) => `${d.id} in ${d.file}`);
    assert.deepEqual(inChange, [], "Change references target ids and never defines them");
  });
  it("F20 and the shim Cases T12, T13 and T14 are defined under 00-changes", () => {
    const ids = new Set(defined(changeFiles()).map((d) => d.id));
    for (const id of ["F20", "T12", "T13", "T14"]) assert.ok(ids.has(id), `${id} is not defined under 00-changes`);
  });
});

describe("release-management/T18 every temporary mechanism ends by a condition a parser can read", () => {
  for (const file of ["change-requirements.md", "interim-states.md"]) {
    it(`${file} gives every entry an Ends when that names the Case which judges it`, () => {
      const items = entries(`00-changes/${file}`);
      assert.ok(items.length > 0, `00-changes/${file} is missing or has no entries`);
      const cases = new Set(defined(changeFiles().concat(ROOT_DOCUMENTS)).filter((d) => d.id[0] === "T").map((d) => d.id));
      for (const item of items) {
        const ends = memberOf(item, "Ends when:");
        assert.ok(ends, `no "Ends when:" member: ${textOf(item).slice(0, 70)}`);
        assert.ok(targetIds(ends).some((id) => cases.has(id)), `"Ends when:" names no defined Case: ${ends.slice(0, 80)}`);
      }
    });
  }
});

describe("release-management/T19 nothing of B was lost", () => {
  const capture = JSON.parse(readFileSync(join(HERE, "id-capture.json"), "utf8"));
  const movesPath = join(HERE, "id-moves.json");
  const moves = existsSync(movesPath) ? JSON.parse(readFileSync(movesPath, "utf8")) : { ids: {}, decisions: {} };
  const everywhere = () => defined(ROOT_DOCUMENTS.concat(changeFiles()));
  it("every captured id has exactly one authoritative definition, where id-moves.json says", () => {
    const found = everywhere();
    const problems = [];
    for (const [id, was] of Object.entries(capture.ids)) {
      const here = found.filter((d) => d.id === id);
      const move = moves.ids[id];
      if (here.length !== 1) problems.push(`${id}: ${here.length} definitions (was ${was.provenance})`);
      else if (!move) problems.push(`${id}: not listed in id-moves.json`);
      else if (here[0].file !== move.to) problems.push(`${id}: defined in ${here[0].file}, listed for ${move.to}`);
      else if (!move.reworded && here[0].text !== was.text) problems.push(`${id}: text changed but not listed as reworded`);
    }
    assert.deepEqual(problems, []);
  });
  it("every reworded id is classified, and what it dropped or added is declared (equivalence is reviewed, not assumed)", () => {
    const found = everywhere();
    const problems = [];
    for (const [id, move] of Object.entries(moves.ids)) {
      if (!move.reworded) continue;
      const here = found.find((d) => d.id === id);
      if (!["relocation", "clarification", "normative"].includes(move.class)) problems.push(`${id}: class is ${move.class}`);
      if (!move.note) problems.push(`${id}: no note on what changed`);
      if (move.class === "normative" && !move.approval) problems.push(`${id}: a normative change needs a recorded approval`);
      const before = tokens(capture.ids[id]);
      const after = tokens(here);
      const dropped = [...before].filter((x) => !after.has(x)).sort();
      const added = [...after].filter((x) => !before.has(x)).sort();
      if (JSON.stringify(dropped) !== JSON.stringify([...(move.dropped ?? [])].sort())) problems.push(`${id}: dropped ${JSON.stringify(dropped)} is not what id-moves.json declares`);
      if (JSON.stringify(added) !== JSON.stringify([...(move.added ?? [])].sort())) problems.push(`${id}: added ${JSON.stringify(added)} is not what id-moves.json declares`);
    }
    assert.deepEqual(problems, [], "a reworded statement that drops or adds a name, an id or a number must say so");
  });
  it("every captured decision is still recorded, in the concern id-moves.json names", () => {
    const problems = [];
    for (const [name, d] of Object.entries(capture.decisions ?? {})) {
      const move = moves.decisions[name];
      const where = move?.to;
      if (!where || !existsSync(join(AREA, where))) { problems.push(`${name}: no place listed`); continue; }
      const text = textOf(parseFile(where));
      if (!text.includes(d.anchor)) problems.push(`${name}: anchor not found in ${where}: ${d.anchor}`);
    }
    assert.deepEqual(problems, []);
  });
});

describe("release-management/T20 the existing Changes stay traceable", () => {
  it("transformation.md lists each Change against a Target that resolves", () => {
    const items = entries("00-changes/transformation.md");
    const known = rootIds();
    const listed = items.map((i) => (textOf(i).match(/^#\d+/) ?? [""])[0]).filter(Boolean);
    for (const pr of PULL_REQUESTS) assert.ok(listed.includes(pr), `${pr} is not listed in 00-changes/transformation.md`);
    for (const item of items.filter((i) => PULL_REQUESTS.some((p) => textOf(i).startsWith(p)))) {
      const refs = targetIds(memberOf(item, "Target:"));
      assert.ok(refs.length > 0 && refs.every((id) => known.has(id) || CHANGE_IDS.test(id)), `unresolved Target: ${textOf(item).slice(0, 70)}`);
    }
  });
});

describe("release-management/T21 Change references B and never redefines it", () => {
  it("no entry restates what B must be", () => {
    const problems = [];
    for (const file of ENTRY_FILES) for (const item of entries(`00-changes/${file}`)) {
      const sentence = textOf(item).split(/(?<=[.;])\s/).find((s) => NORMATIVE.test(s));
      if (sentence) problems.push(`${file}: "${sentence.slice(0, 80)}"`);
    }
    assert.deepEqual(problems, [], "a Change entry points at B by id; what B must be is said once, in the root documents");
  });
  it("each entry has the members Target, Difference and Done when", () => {
    const problems = [];
    for (const file of ENTRY_FILES) for (const item of entries(`00-changes/${file}`)) {
      for (const label of ["Target:", file === "current-state.md" ? "Current:" : "Difference:"]) if (!memberOf(item, label)) problems.push(`${file}: no ${label} in "${textOf(item).slice(0, 50)}"`);
    }
    assert.deepEqual(problems, []);
    assert.ok(ENTRY_FILES.every((f) => existsSync(join(AREA, "00-changes", f))), "current-state.md, gaps.md, transformation.md and interim-states.md are all missing: create them");
  });
});
