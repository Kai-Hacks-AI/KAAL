// Delivered cases: the Requirements loop. They run against whichever copy of
// @kaihacksai/kaal-foundation is installed, imported by its package name. Titles are
// `foundation/T<n> [<targets>]: <what it checks>`; the manifest's cases and model come from them.
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const ascii = (s) => new TextEncoder().encode(s);

test("foundation/T23 [foundation/F1]: the FIPS 180-4 known answers", () => {
  assert.equal(sha256(ascii("")), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(sha256(ascii("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(sha256(ascii("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")), "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1");
  assert.equal(
    sha256(ascii("abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu")),
    "cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1",
  );
});

test("foundation/T24 [foundation/F1]: messages of 55, 56, 63, 64 and 65 bytes, at the padding boundaries", () => {
  assert.equal(sha256(new Uint8Array(55).fill(0x61)), "9f4390f8d30c2dd92ec9f095b65e2b9ae9b0a925a5258e241c9f1e910f734318");
  assert.equal(sha256(new Uint8Array(56).fill(0x61)), "b35439a4ac6f0948b6d6f9e3c6af0f5f590ce20f1bde7090ef7970686ec6738a");
  assert.equal(sha256(new Uint8Array(63).fill(0x61)), "7d3e74a05d7db15bce4ad9ec0658ea98e3f06eeecf16b4c6fff2da457ddc2f34");
  assert.equal(sha256(new Uint8Array(64).fill(0x61)), "ffe054fe7ae0cb6dc65c3af9b61d5209f439851db43d0ba5997337df154668eb");
  assert.equal(sha256(new Uint8Array(65).fill(0x61)), "635361c48bb9eab14198e76ea8ab7f1a41685d6ad62aa9146d301d4f17eb0ae0");
});

test("foundation/T25 [foundation/F2]: a view counts only its own bytes and stays unmodified, and a Buffer agrees with a Uint8Array", () => {
  const buf = ascii("xxabcxx");
  const view = buf.subarray(2, 5);
  const before = [...buf];
  assert.equal(sha256(view), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.deepEqual([...buf], before);
  assert.equal(sha256(Buffer.from("abc")), sha256(ascii("abc")));
});

test("foundation/T26 [foundation/F3]: each refusal is a TypeError", () => {
  for (const bad of ["abc", new ArrayBuffer(3), new DataView(new ArrayBuffer(3)), new Uint16Array(3), [97, 98, 99], undefined]) assert.throws(() => sha256(bad), TypeError);
});
