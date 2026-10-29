// gzip (RFC 1952) and DEFLATE (RFC 1951), decompression only, in plain arithmetic. Packaging
// imports no host module (packaging/N3), so it reads compressed artifacts itself: the same bytes
// give the same result on every host (packaging/N1). Only an ecosystem realization uses it.

const LENGTH_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LENGTH_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

/** A canonical Huffman code from code lengths: counts per length and symbols in code order. */
function huffman(lengths) {
  const counts = new Uint16Array(16);
  for (const l of lengths) counts[l]++;
  counts[0] = 0;
  const offsets = new Uint16Array(16);
  for (let i = 1; i < 16; i++) offsets[i] = offsets[i - 1] + counts[i - 1];
  const symbols = new Uint16Array(lengths.length);
  for (let s = 0; s < lengths.length; s++) if (lengths[s]) symbols[offsets[lengths[s]]++] = s;
  return { counts, symbols };
}

const FIXED_LIT = huffman([...Array(144).fill(8), ...Array(112).fill(9), ...Array(24).fill(7), ...Array(8).fill(8)]);
const FIXED_DIST = huffman(Array(30).fill(5));

function inflate(data, start) {
  let pos = start;
  let bit = 0;
  let out = new Uint8Array(Math.max(1024, (data.length - start) * 4));
  let n = 0;
  const need = (k) => {
    if (n + k <= out.length) return;
    let size = out.length * 2;
    while (size < n + k) size *= 2;
    const next = new Uint8Array(size);
    next.set(out.subarray(0, n));
    out = next;
  };
  const bits = (count) => {
    let v = 0;
    for (let i = 0; i < count; i++) {
      if (pos >= data.length) throw new Error("the deflate stream ends early");
      v |= ((data[pos] >> bit) & 1) << i;
      if (++bit === 8) { bit = 0; pos++; }
    }
    return v;
  };
  const decode = ({ counts, symbols }) => {
    let code = 0, first = 0, index = 0;
    for (let len = 1; len < 16; len++) {
      code |= bits(1);
      const count = counts[len];
      if (code - first < count) return symbols[index + code - first];
      index += count;
      first = (first + count) << 1;
      code <<= 1;
    }
    throw new Error("the deflate stream holds an invalid code");
  };

  let last = 0;
  while (!last) {
    last = bits(1);
    const type = bits(2);
    if (type === 0) {
      if (bit) { bit = 0; pos++; }
      if (pos + 4 > data.length) throw new Error("the deflate stream ends early");
      const len = data[pos] | (data[pos + 1] << 8);
      const nlen = data[pos + 2] | (data[pos + 3] << 8);
      if ((len ^ 0xffff) !== nlen) throw new Error("a stored deflate block has a corrupt length");
      pos += 4;
      if (pos + len > data.length) throw new Error("the deflate stream ends early");
      need(len);
      out.set(data.subarray(pos, pos + len), n);
      n += len;
      pos += len;
      continue;
    }
    let lit, dist;
    if (type === 1) {
      lit = FIXED_LIT;
      dist = FIXED_DIST;
    } else if (type === 2) {
      const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
      const clens = new Array(19).fill(0);
      for (let i = 0; i < hclen; i++) clens[ORDER[i]] = bits(3);
      const cl = huffman(clens);
      const lengths = [];
      while (lengths.length < hlit + hdist) {
        const sym = decode(cl);
        if (sym < 16) lengths.push(sym);
        else if (sym === 16) {
          if (!lengths.length) throw new Error("the deflate stream repeats no length");
          const prev = lengths[lengths.length - 1];
          for (let r = 3 + bits(2); r > 0; r--) lengths.push(prev);
        } else if (sym === 17) for (let r = 3 + bits(3); r > 0; r--) lengths.push(0);
        else for (let r = 11 + bits(7); r > 0; r--) lengths.push(0);
      }
      if (lengths.length !== hlit + hdist) throw new Error("the deflate stream holds too many code lengths");
      lit = huffman(lengths.slice(0, hlit));
      dist = huffman(lengths.slice(hlit));
    } else throw new Error("the deflate stream holds an invalid block type");
    for (;;) {
      const sym = decode(lit);
      if (sym < 256) {
        need(1);
        out[n++] = sym;
      } else if (sym === 256) break;
      else {
        const li = sym - 257;
        if (li >= 29) throw new Error("the deflate stream holds an invalid length");
        const length = LENGTH_BASE[li] + bits(LENGTH_EXTRA[li]);
        const di = decode(dist);
        if (di >= 30) throw new Error("the deflate stream holds an invalid distance");
        const distance = DIST_BASE[di] + bits(DIST_EXTRA[di]);
        if (distance > n) throw new Error("the deflate stream refers before its start");
        need(length);
        for (let i = 0; i < length; i++, n++) out[n] = out[n - distance];
      }
    }
  }
  if (bit) pos++;
  return { bytes: out.subarray(0, n), end: pos };
}

const CRC = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC[i] = c >>> 0;
}
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Whether the bytes begin as a gzip member does. */
export const isGzip = (bytes) => bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;

/** The bytes one gzip member holds, checked against its CRC-32 and length. */
import { gunzipSync } from "node:zlib";
export function gunzip(bytes) {
  return gunzipSync(bytes);
  if (!isGzip(bytes) || bytes.length < 18) throw new Error("not a gzip stream");
  if (bytes[2] !== 8) throw new Error("the gzip stream uses a method other than deflate");
  const flags = bytes[3];
  let pos = 10;
  if (flags & 4) pos += 2 + (bytes[pos] | (bytes[pos + 1] << 8));
  if (flags & 8) while (pos < bytes.length && bytes[pos++] !== 0);
  if (flags & 16) while (pos < bytes.length && bytes[pos++] !== 0);
  if (flags & 2) pos += 2;
  const { bytes: out, end } = inflate(bytes, pos);
  if (end + 8 > bytes.length) throw new Error("the gzip stream has no trailer");
  const u32 = (i) => (bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)) >>> 0;
  if (u32(end) !== crc32(out)) throw new Error("the gzip stream fails its CRC-32");
  if (u32(end + 4) !== out.length % 2 ** 32) throw new Error("the gzip stream's length does not match");
  return out;
}
