// hosting/C114 shared fixtures for the draft Cases (T318 to T324). Plain data and a local stand-in for GitHub's API;
// nothing here reaches the network, and every key is generated inside the Case. The DO moves what the delivered Cases
// need beside them and removes this file.
export const DISPATCHER = {
  app: "dispatcher",
  name: "KAAL Dispatcher",
  owner: "kaal-release",
  purpose: "Raises pull requests to the next station.",
  abilities: ["read-contents", "read-pull-requests", "write-pull-requests"],
  logo: "13-source/github-apps/dispatcher.png",
};

/** A recording stand-in. `route(req)` returns `{ status, json }`; it may throw to simulate a network error. */
export function standIn(route) {
  const requests = [];
  const fetch = async (url, init = {}) => {
    const u = new URL(url);
    const req = { method: init.method ?? "GET", path: decodeURIComponent(u.pathname), query: Object.fromEntries(u.searchParams), headers: Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])), body: init.body ? JSON.parse(init.body) : undefined };
    requests.push(req);
    const { status, json } = route(req);
    return new Response(JSON.stringify(json), { status, headers: { "content-type": "application/json" } });
  };
  return { fetch, requests, api: "https://stand-in.invalid" };
}

/** A PNG whose header says `width` by `height`; the rest is not a picture and need not be. */
export function png(width, height) {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  b.writeUInt8(8, 24);
  b.writeUInt8(6, 25);
  return new Uint8Array(b);
}
