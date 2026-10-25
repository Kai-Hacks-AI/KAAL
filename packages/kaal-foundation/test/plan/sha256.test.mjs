// foundation/C1 planned outer tests: SHA-256. Immutable to DO and CHECK; foundation/C2 turns them
// GREEN. Each title names the contracts it checks (plan/sha256/*.md). They use the package's public
// interface only. node:crypto is the reference: the tests may use it, the module may not.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const reference = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Foundation's sha256, or the reason the tests are blocked before any behavioural assertion. */
async function subject() {
  try {
    return (await import("@kaihacksai/kaal-foundation/sha256")).sha256;
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: @kaihacksai/kaal-foundation/sha256 cannot be imported (${e.code ?? e.message})`);
  }
}

/** A seeded xorshift32 byte stream: the same inputs on every run and every host. */
function bytes(length, seed) {
  const out = new Uint8Array(length);
  let x = seed >>> 0 || 1;
  for (let i = 0; i < length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out[i] = x & 0xff;
  }
  return out;
}

const ascii = (text) => new TextEncoder().encode(text);

describe("SHA-256 (foundation/C1)", () => {
  it("foundation/T1 [foundation/F1]: the FIPS 180-4 examples give their published digests", async () => {
    const sha256 = await subject();
    const examples = [
      ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
      ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
      ["abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"],
      [
        "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu",
        "cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1",
      ],
      ["a".repeat(1_000_000), "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0"],
    ];
    for (const [text, digest] of examples) assert.equal(sha256(ascii(text)), digest, `${text.length} bytes`);
  });

  it("foundation/T2 [foundation/F1, foundation/N3]: every length from 0 to 1024 bytes, which crosses every padding boundary, equals the reference", async () => {
    const sha256 = await subject();
    const all = bytes(1024, 0x5eed);
    for (let length = 0; length <= 1024; length++) {
      const input = all.slice(0, length);
      const digest = sha256(input);
      assert.match(digest, /^[0-9a-f]{64}$/, `${length} bytes`);
      assert.equal(digest, reference(input), `${length} bytes`);
    }
  });

  it("foundation/T3 [foundation/F1, foundation/N3]: seeded pseudo-random inputs up to 1 MiB equal the reference", async () => {
    const sha256 = await subject();
    for (let seed = 1; seed <= 32; seed++) {
      const input = bytes(bytes(4, seed).reduce((n, b) => n * 256 + b, 0) % (1 << 20), seed);
      assert.equal(sha256(input), reference(input), `seed ${seed}, ${input.length} bytes`);
    }
    const mebibyte = bytes(1 << 20, 0xfeed);
    assert.equal(sha256(mebibyte), reference(mebibyte), "1 MiB");
  });

  it("foundation/T4 [foundation/F2, foundation/N1]: a Buffer and a Uint8Array agree, a view counts only its own bytes, the input is unchanged, and repeated calls agree", async () => {
    const sha256 = await subject();
    const whole = bytes(300, 7);
    const before = Uint8Array.from(whole);
    assert.equal(sha256(Buffer.from(whole)), sha256(whole));
    const view = whole.subarray(13, 213);
    assert.equal(sha256(view), reference(Buffer.from(view)));
    assert.equal(sha256(Buffer.from(whole.buffer, 13, 200)), reference(Buffer.from(view)));
    assert.deepEqual(whole, before);
    const other = bytes(77, 9);
    const first = sha256(whole);
    sha256(other);
    assert.equal(sha256(whole), first);
  });

  it("foundation/T5 [foundation/F3]: a string, ArrayBuffer, DataView, Uint16Array, array of numbers or undefined is refused with a TypeError", async () => {
    const sha256 = await subject();
    const buffer = new ArrayBuffer(4);
    for (const input of ["abc", buffer, new DataView(buffer), new Uint16Array(2), [1, 2, 3], undefined]) {
      assert.throws(() => sha256(input), TypeError, Object.prototype.toString.call(input));
    }
  });

  it("foundation/T6 [foundation/N3, foundation/I2]: every Node KAAL ships hashes to the reference, so no Node id changes", async () => {
    const sha256 = await subject();
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
      }
    };
    walk(join(REPOSITORY, ".kaal"));
    const packages = (dir) => readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => join(dir, e.name));
    for (const root of [join(REPOSITORY, "packages"), join(REPOSITORY, "packages", "skills"), join(REPOSITORY, "packages", "extensions")]) {
      for (const pkg of packages(root)) if (existsSync(join(pkg, "payload"))) walk(join(pkg, "payload"));
    }
    assert.ok(files.length > 0, "found the Nodes KAAL ships");
    for (const file of files) {
      const content = readFileSync(file);
      assert.equal(sha256(content), reference(content), file);
    }
  });

  it("foundation/T7 [foundation/N1, foundation/N2]: the module imports nothing and names no host global, and the package declares no dependencies", async () => {
    await subject();
    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    for (const key of ["dependencies", "peerDependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"]) {
      assert.equal(manifest[key], undefined, `package.json declares ${key}`);
    }
    const target = manifest.exports["./sha256"].default;
    const source = readFileSync(join(PACKAGE, target), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    assert.doesNotMatch(source, /^\s*import\b|\bimport\s*\(|\brequire\s*\(|^\s*export\s+[^;]*\bfrom\b/m, "the module imports nothing");
    assert.doesNotMatch(source, /\b(globalThis|process|Buffer|crypto|window|self|Deno|Bun)\b/, "the module names no host global");
  });

  it("foundation/T8 [foundation/N4]: the package's README states that each concern's ownership is provisional", async () => {
    await subject();
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    const rows = readme.split("\n").filter((line) => line.includes("@kaihacksai/kaal-foundation/"));
    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    for (const subpath of Object.keys(manifest.exports).filter((k) => k !== "./package.json")) {
      const row = rows.find((line) => line.includes(`@kaihacksai/kaal-foundation/${subpath.slice(2)}`));
      assert.ok(row, `the README lists ${subpath}`);
      assert.match(row, /provisional/i, `${subpath}'s ownership is stated as provisional`);
    }
  });
});
