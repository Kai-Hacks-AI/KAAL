import assert from "node:assert/strict";
import test from "node:test";
import { checkChain, sealChain } from "./seals.js";
import {
  chainData,
  chainWithEmptyUnit,
  chainWithSymlink,
  RENAMED_UNITS,
  scratchChain,
  tree,
  UNITS,
} from "./test-data.js";

test("seals every open unit oldest first, each chained to the one before", () => {
  const root = scratchChain("open");
  assert.deepEqual(sealChain(root, UNITS), ["one", "two"]);
  assert.deepEqual(tree(root), tree(chainData("sealed")));
});

test("sealing later extends the chain exactly as sealing everything at once would", () => {
  const root = scratchChain("sealed-one");
  assert.deepEqual(sealChain(root, UNITS), ["two"]);
  assert.deepEqual(tree(root), tree(chainData("sealed")));
});

test("sealing a fully sealed chain does nothing", () => {
  const root = scratchChain("sealed");
  assert.deepEqual(sealChain(root, UNITS), []);
  assert.deepEqual(tree(root), tree(chainData("sealed")));
});

test("refuses to seal a chain whose seals are broken, and writes nothing", () => {
  const root = scratchChain("sealed-after-open");
  assert.throws(() => sealChain(root, UNITS), /refusing to seal a chain with broken seals/);
  assert.deepEqual(tree(root), tree(chainData("sealed-after-open")));
});

test("refuses to seal an empty unit, and writes no seal for the units before it", () => {
  const { root, units } = chainWithEmptyUnit();
  assert.throws(() => sealChain(root, units), /three: refusing to seal an empty unit/);
  assert.deepEqual(tree(root), tree(chainData("open")));
});

test("refuses to seal a unit holding a symlink", () => {
  const root = chainWithSymlink("open");
  assert.throws(() => sealChain(root, UNITS), /one: refusing to seal symlinks: link\.txt/);
});

test("accepts intact seals and open units after them", () => {
  assert.deepEqual(checkChain(chainData("sealed"), UNITS), []);
  assert.deepEqual(checkChain(chainData("sealed-one"), UNITS), []);
  assert.deepEqual(checkChain(chainData("open"), UNITS), []);
});

test("reports files changed, added or removed after sealing", () => {
  assert.deepEqual(checkChain(chainData("file-changed"), UNITS), ["one/nested/b.txt: changed after sealing"]);
  assert.deepEqual(checkChain(chainData("file-added"), UNITS), ["one/d.txt: added after sealing"]);
  assert.deepEqual(checkChain(chainData("file-removed"), UNITS), ["one/nested/b.txt: removed after sealing"]);
});

test("reports an edited seal and every seal chained after it", () => {
  assert.deepEqual(checkChain(chainData("seal-edited"), UNITS), [
    "one: seal does not match its own content",
    "two: seal does not chain to the previous seal",
  ]);
});

test("reports a seal that is intact but chained to the wrong predecessor", () => {
  assert.deepEqual(checkChain(chainData("chain-broken"), UNITS), ["two: seal does not chain to the previous seal"]);
});

test("reports a sealed unit that follows an open one", () => {
  assert.deepEqual(checkChain(chainData("sealed-after-open"), UNITS), [
    "two: sealed after open unit one",
    "two: seal does not chain to the previous seal",
  ]);
});

test("reports units checked in a different order than they were sealed", () => {
  assert.deepEqual(checkChain(chainData("sealed"), ["two", "one"]), [
    "two: seal does not chain to the previous seal",
    "one: seal does not chain to the previous seal",
  ]);
});

test("reports a sealed unit whose directory was renamed after sealing", () => {
  assert.deepEqual(checkChain(chainData("unit-renamed"), RENAMED_UNITS), ["zero: seal belongs to unit one"]);
});

test("reports a symlink placed in a sealed unit", () => {
  assert.deepEqual(checkChain(chainWithSymlink("sealed"), UNITS), ["one/link.txt: symlink in sealed unit"]);
});
