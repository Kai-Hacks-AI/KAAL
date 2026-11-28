// The logo slot is checkable (hosting/F100): a PNG, square, at least 200 by 200 (GitHub's own recommendation). Hosting
// holds no logo and uploads none; it reads only the bytes it is given.
export type LogoCheck = { ok: true; width: number; height: number } | { ok: false; problem: "empty" | "not-png" | "not-square" | "too-small"; width?: number; height?: number };

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MIN = 200;

export function checkLogo(bytes: Uint8Array): LogoCheck {
  if (bytes.length === 0) return { ok: false, problem: "empty" };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const header = bytes.length >= 24 && SIGNATURE.every((b, i) => bytes[i] === b) && String.fromCharCode(bytes[12]!, bytes[13]!, bytes[14]!, bytes[15]!) === "IHDR";
  if (!header) return { ok: false, problem: "not-png" };
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (width !== height) return { ok: false, problem: "not-square", width, height };
  if (width < MIN) return { ok: false, problem: "too-small", width, height };
  return { ok: true, width, height };
}
