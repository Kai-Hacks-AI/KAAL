// Code tests for reading untrusted artifacts (packaging/C2): malformed, truncated and hostile
// archives are refused with an Error that names the cause, limits bound what reading may
// produce, and random corruption never escapes as anything but a refusal or a measurement.
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { describe, it } from "node:test";
import { LIMITS, measure } from "kaal-packaging";

/** One tar header and body, padded to 512-byte blocks, with a correct checksum unless told not. */
function entry(path, body, { flag = "0", size = body.length, sum = true } = {}) {
  const header = Buffer.alloc(512);
  header.write(path, 0, 100, "utf8");
  header.write("0000644\0", 100);
  header.write(`${size.toString(8).padStart(11, "0")}\0`, 124);
  header.write("00000000000\0", 136);
  header.write("        ", 148);
  header.write(flag, 156);
  header.write("ustar\0", 257);
  header.write("00", 263);
  let total = 0;
  for (const b of header) total += b;
  header.write(`${(sum ? total : total + 1).toString(8).padStart(6, "0")}\0 `, 148);
  return Buffer.concat([header, body, Buffer.alloc((512 - (body.length % 512)) % 512)]);
}

function pax(path) {
  let record = ` path=${path}\n`;
  let length = record.length;
  while (`${length}${record}`.length !== length) length = `${length}${record}`.length;
  return entry("PaxHeader", Buffer.from(`${length}${record}`), { flag: "x" });
}

const MANIFEST = entry("package/package.json", Buffer.from(JSON.stringify({ name: "fixture", version: "1.0.0" })));
const END = Buffer.alloc(1024);
const tgz = (...entries) => gzipSync(Buffer.concat([MANIFEST, ...entries, END]));
const VALID = tgz(entry("package/lib/a.mjs", Buffer.from("export const a = 1;\n")), entry("package/README.md", Buffer.from("# fixture\n")));

/** A refusal: an Error, not a TypeError or RangeError escaping from inside the reader. */
function refused(fn, pattern) {
  assert.throws(fn, (e) => e instanceof Error && e.constructor === Error && pattern.test(e.message), String(pattern));
}

describe("reading untrusted artifacts (packaging/C2)", () => {
  it("measures the valid fixture these cases mutate", () => {
    assert.equal(measure(VALID).files.length, 3);
  });

  it("refuses a gzip stream cut short at any point", () => {
    for (let cut = 1; cut < VALID.length; cut += Math.max(1, Math.floor(VALID.length / 40))) {
      refused(() => measure(VALID.subarray(0, cut)), /gzip|deflate|ends|format is unknown/);
    }
  });

  it("refuses a stream whose CRC-32 or length does not match what it decompresses to", () => {
    const crc = Buffer.from(VALID);
    crc[crc.length - 8] ^= 0xff;
    refused(() => measure(crc), /CRC-32/);
    const length = Buffer.from(VALID);
    length[length.length - 1] ^= 0x01;
    refused(() => measure(length), /length does not match/);
  });

  it("refuses bytes after the gzip stream, and a header with reserved flags", () => {
    refused(() => measure(Buffer.concat([VALID, Buffer.from([0])])), /after its gzip stream/);
    const flags = Buffer.from(VALID);
    flags[3] |= 0x80;
    refused(() => measure(flags), /reserved flags/);
  });

  it("refuses an invalid deflate block type", () => {
    const header = Buffer.from([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 0, 3]);
    refused(() => measure(Buffer.concat([header, Buffer.from([0b111]), Buffer.alloc(8)])), /invalid block type/);
  });

  it("refuses a decompression bomb at the archive limit, before expanding it", () => {
    const bomb = tgz(entry("package/zeros.bin", Buffer.alloc(8 * 1024 * 1024)));
    assert.ok(bomb.length < 64 * 1024, `the bomb compresses to ${bomb.length} bytes`);
    refused(() => measure(bomb, { archive: 1024 * 1024 }), /more than the limit of 1048576 bytes/);
    assert.equal(measure(bomb).files.find((f) => f.path === "zeros.bin").size, 8 * 1024 * 1024, "within the default limit it is measured");
  });

  it("refuses more files than the file limit, and a path longer than the path limit", () => {
    const many = tgz(...Array.from({ length: 5 }, (_, i) => entry(`package/f${i}`, Buffer.from("x"))));
    refused(() => measure(many, { files: 3 }), /more than the limit of 3 files/);
    assert.equal(measure(many, { files: 6 }).files.length, 6);
    const long = `package/${"d/".repeat(600)}x`;
    refused(() => measure(tgz(pax(long), entry("package/x", Buffer.from("x")))), new RegExp(`longer than the limit of ${LIMITS.path} bytes`));
  });

  it("refuses unsafe and duplicate paths", () => {
    for (const path of ["package/../evil", "package/a//b", "package/./a", "package/a\\b", "package/"]) {
      refused(() => measure(tgz(pax(path), entry("package/x", Buffer.from("x")))), /unsafe path/);
    }
    refused(() => measure(tgz(entry("package/a", Buffer.from("1")), entry("package/a", Buffer.from("2")))), /lists a twice/);
  });

  it("refuses a tar header that fails its checksum, an entry larger than the archive, and a cut header", () => {
    refused(() => measure(tgz(entry("package/a", Buffer.from("x"), { sum: false }))), /fails its checksum/);
    refused(() => measure(gzipSync(Buffer.concat([MANIFEST, entry("package/a", Buffer.from("x"), { size: 1e9 })]))), /ends inside/);
    refused(() => measure(gzipSync(Buffer.concat([MANIFEST, entry("package/a", Buffer.from("x")).subarray(0, 300)]))), /ends inside a header/);
  });

  it("refuses an npm package without a readable package.json", () => {
    refused(() => measure(gzipSync(Buffer.concat([entry("package/a", Buffer.from("x")), END]))), /no package\.json/);
    refused(() => measure(gzipSync(Buffer.concat([entry("package/package.json", Buffer.from("{")), END]))), /not JSON/);
    refused(() => measure(gzipSync(Buffer.concat([entry("package/package.json", Buffer.from("null")), END]))), /no name and version/);
  });

  it("refuses unknown limits and limits that are not whole numbers", () => {
    assert.throws(() => measure(VALID, { bytes: 1 }), TypeError);
    assert.throws(() => measure(VALID, { files: -1 }), TypeError);
    assert.throws(() => measure(VALID, { archive: 1.5 }), TypeError);
  });

  it("under random corruption, compressed or archived, gives a measurement or a refusal and nothing else", () => {
    let seed = 0x5eed;
    const random = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32);
    const tar = Buffer.concat([MANIFEST, entry("package/lib/a.mjs", Buffer.from("export const a = 1;\n".repeat(40))), END]);
    const outcomes = { measured: 0, refused: 0 };
    for (let i = 0; i < 400; i++) {
      const compressed = i % 2 === 0;
      const bytes = Buffer.from(compressed ? gzipSync(tar) : tar);
      for (let k = 1 + Math.floor(random() * 4); k > 0; k--) bytes[Math.floor(random() * bytes.length)] ^= 1 + Math.floor(random() * 255);
      const artifact = compressed ? bytes : gzipSync(bytes);
      try {
        const m = measure(artifact, { archive: 1024 * 1024 });
        assert.equal(m.unpacked, m.files.reduce((s, f) => s + f.size, 0));
        outcomes.measured++;
      } catch (e) {
        assert.ok(e.constructor === Error && e.message.length > 0, `case ${i}: ${e.constructor.name}: ${e.message}`);
        outcomes.refused++;
      }
    }
    assert.ok(outcomes.refused > 0 && outcomes.measured + outcomes.refused === 400, JSON.stringify(outcomes));
  });
});
