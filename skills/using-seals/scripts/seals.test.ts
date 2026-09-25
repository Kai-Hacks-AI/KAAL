import assert from "node:assert/strict";
import test from "node:test";
import { checkChain, entryKind, sealChain } from "./seals.js";
import {
  CHAIN,
  chainData,
  chainWithEmptyUnit,
  chainWithSymlink,
  chainWithSymlinkedUnit,
  INVALID_CHAIN,
  RENAMED_UNITS,
  scratchChain,
  SPECIAL_ENTRY,
  tree,
  UNITS,
  UNSAFE_UNITS,
} from "./test-data.js";

const check = (name: string, units = UNITS) => checkChain(chainData(name), CHAIN, units);

test("seals every open unit oldest first, each chained to the one before, and records the head", () => {
  const root = scratchChain("open");
  assert.deepEqual(sealChain(root, CHAIN, UNITS), ["one", "two"]);
  assert.deepEqual(tree(root), tree(chainData("sealed")));
});

test("sealing later extends the chain and its head exactly as sealing everything at once would", () => {
  const root = scratchChain("sealed-one");
  assert.deepEqual(sealChain(root, CHAIN, UNITS), ["two"]);
  assert.deepEqual(tree(root), tree(chainData("sealed")));
});

test("sealing a fully sealed chain does nothing", () => {
  const root = scratchChain("sealed");
  assert.deepEqual(sealChain(root, CHAIN, UNITS), []);
  assert.deepEqual(tree(root), tree(chainData("sealed")));
});

test("refuses to seal a chain whose seals are broken, and writes nothing", () => {
  for (const name of ["sealed-after-open", "trailing-seal-removed-changed"]) {
    const root = scratchChain(name);
    assert.throws(() => sealChain(root, CHAIN, UNITS), /refusing to seal a chain with broken seals/, name);
    assert.deepEqual(tree(root), tree(chainData(name)), name);
  }
});

test("refuses to seal an empty unit, and writes no seal for the units before it", () => {
  const { root, units } = chainWithEmptyUnit();
  assert.throws(() => sealChain(root, CHAIN, units), /three: refusing to seal an empty unit/);
  assert.deepEqual(tree(root), tree(chainData("open")));
});

test("refuses to seal a unit holding a symlink, naming what it is", () => {
  const root = chainWithSymlink("open");
  assert.throws(
    () => sealChain(root, CHAIN, UNITS),
    /one: refusing to seal entries that are not regular files: link\.txt \(symlink\)/,
  );
});

test("refuses a chain name that is not lowercase kebab-case", () => {
  assert.deepEqual(checkChain(chainData("open"), INVALID_CHAIN, UNITS), [
    "Not A Chain: chain name must be lowercase kebab-case (a-z, 0-9, single hyphens)",
  ]);
});

test("accepts intact seals and open units after them", () => {
  assert.deepEqual(check("sealed"), []);
  assert.deepEqual(check("sealed-one"), []);
  assert.deepEqual(check("open"), []);
});

test("reports files changed, added or removed after sealing", () => {
  assert.deepEqual(check("file-changed"), ["one/nested/b.txt: changed after sealing"]);
  assert.deepEqual(check("file-added"), ["one/d.txt: added after sealing"]);
  assert.deepEqual(check("file-removed"), ["one/nested/b.txt: removed after sealing"]);
});

test("reports an edited seal and every seal chained after it", () => {
  assert.deepEqual(check("seal-edited"), [
    "one: seal does not match its own content",
    "two: seal does not chain to the previous seal",
  ]);
});

test("reports a seal that is intact but chained to the wrong predecessor", () => {
  assert.deepEqual(check("chain-broken"), ["two: seal does not chain to the previous seal"]);
});

test("reports a seal removed before other seals, and the sealed unit after it", () => {
  assert.deepEqual(check("sealed-after-open"), [
    "two: sealed after open unit one",
    "two: seal does not chain to the previous seal",
    "one: seal removed after sealing",
  ]);
});

test("reports a trailing seal removed after sealing, even if its files changed since", () => {
  assert.deepEqual(check("trailing-seal-removed"), ["two: seal removed after sealing"]);
  assert.deepEqual(check("trailing-seal-removed-changed"), ["two: seal removed after sealing"]);
});

test("reports a chain whose head is missing, mismatched, behind its seals, unknown or unreadable", () => {
  assert.deepEqual(check("head-missing"), ["chain: chain has seals but no head in seals.json"]);
  assert.deepEqual(check("head-mismatch"), ["chain: head does not match the seal of two"]);
  assert.deepEqual(check("sealed-beyond-head"), ["two: sealed beyond the chain's head"]);
  assert.deepEqual(check("head-unknown-unit"), ["chain: head names unit three, which is not in the chain"]);
  assert.deepEqual(check("heads-malformed"), ["seals.json: unreadable chain heads (not a set of chain heads)"]);
});

test("reports units checked in a different order than they were sealed", () => {
  assert.deepEqual(check("sealed", ["two", "one"]), [
    "two: seal does not chain to the previous seal",
    "one: seal does not chain to the previous seal",
    "one: sealed beyond the chain's head",
  ]);
});

test("reports a sealed unit whose directory was renamed after sealing", () => {
  assert.deepEqual(check("unit-renamed", RENAMED_UNITS), ["zero: seal belongs to unit one"]);
});

test("reports a symlink placed in a sealed unit", () => {
  assert.deepEqual(checkChain(chainWithSymlink("sealed"), CHAIN, UNITS), ["one/link.txt: symlink in sealed unit"]);
});

test("refuses unit lists that could leave the root, repeat a unit or nest units, reading and writing nothing", () => {
  const rule =
    'unit must be a relative path of portable segments separated by "/": letters, digits, "_", "-", and dots only between them';
  const expected: Record<string, string> = {
    traversal: `../outside: ${rule}`,
    absolute: `/outside: ${rule}`,
    backslash: `one\\nested: ${rule}`,
    "dot-segment": `./one: ${rule}`,
    "trailing-slash": `one/: ${rule}`,
    "trailing-dot": `one.: ${rule}`,
    "trailing-space": `one : ${rule}`,
    reserved: 'con: unit segment "con" is reserved on Windows',
    "reserved-with-extension": 'one/NUL.txt: unit segment "NUL.txt" is reserved on Windows',
    duplicate: "one: unit listed twice",
    "case-alias": "ONE: unit is the same directory as one on case-insensitive filesystems",
    nested: "one: unit contains unit one/nested",
  };
  for (const [name, units] of Object.entries(UNSAFE_UNITS)) {
    const root = scratchChain("open");
    assert.deepEqual(checkChain(root, CHAIN, units), [expected[name]], name);
    assert.throws(() => sealChain(root, CHAIN, units), /refusing to seal a chain with broken seals/, name);
    assert.deepEqual(tree(root), tree(chainData("open")), name);
  }
});

test("reports an unsafe unit list on its own, without reading the units", () => {
  assert.deepEqual(check("sealed", UNSAFE_UNITS.duplicate), ["one: unit listed twice"]);
});

test("refuses a unit whose directory is a symlink, and writes nothing through it", () => {
  const { root, outside } = chainWithSymlinkedUnit();
  assert.deepEqual(checkChain(root, CHAIN, UNITS), ["one: unit path passes through a symlink"]);
  assert.throws(() => sealChain(root, CHAIN, UNITS), /one: unit path passes through a symlink/);
  assert.deepEqual(Object.keys(tree(outside)), ["a.txt", "nested/b.txt"]);
});

test("reports a structurally invalid seal instead of crashing, and keeps checking later units", () => {
  for (const name of ["seal-malformed-empty", "seal-malformed-files"]) {
    assert.deepEqual(
      check(name),
      ["one: unreadable seal (not a seal)", "two: seal does not chain to the previous seal"],
      name,
    );
  }
});

test("classifies FIFOs, sockets and devices as special files, which cannot be sealed", () => {
  assert.equal(entryKind(SPECIAL_ENTRY), "special file");
});
