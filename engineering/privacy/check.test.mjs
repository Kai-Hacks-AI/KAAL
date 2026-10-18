// Synthetic fixtures only. Every value that a rule must catch is assembled at run time, so this
// file itself passes the check it tests. None of them is anyone's real value.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { execute } from "kaal-hosting";
import { localList, mask, scan, unpack } from "./check.mjs";

const CHECK = fileURLToPath(new URL("./check.mjs", import.meta.url));
const REPO = resolve(dirname(CHECK), "../..");
const j = (...parts) => parts.join("");

const CAUGHT = {
  email: j("robin.q", "@", "mailhost", ".io"),
  "workspace-link": j("https://", "acme-corp", ".slack.com/archives/", "C0ABC", "12345"),
  "member-or-channel-id": j("U0", "9ZXK4", "LM2"),
  "local-path": j("/home", "/robinq/projects"),
  credential: j("xox", "b-", "1234567890-", "abcdefghijklmnop"),
};

const CREDENTIALS = [
  j("gh", "p_", "a".repeat(36)),
  j("github", "_pat_", "B".repeat(30)),
  j("sk-", "ant-", "c".repeat(30)),
  j("AKIA", "ABCDEFGHIJKLMNOP"),
  j("-----BEGIN ", "RSA PRIVATE KEY-----"),
  j("api_key", " = ", "Zz9".repeat(8)),
];

const LEGITIMATE = [
  "Write to someone@example.com or ops@mail.example.org.",
  "Use https://example.slack.com/archives/C0EXAMPLE1 in fictional setups.",
  "See https://api.slack.com/methods for the API.",
  "Clone from git@github.com:example/repo.git.",
  "The SHA is 4e01b2d4da8bbaea7c73eb1a02a4f5e898f7a4154a0186c16cedfd1ef9a53933.",
  "CONTRIBUTING and README are words; U12345678 is a number.",
  "CI runs in /home/runner/work, and docs say /Users/you/project.",
  "Install kaal-core@0.0.1 and actions/checkout@v4.",
  "The token is read from the environment.",
];

describe("content rules", () => {
  for (const [rule, value] of Object.entries(CAUGHT)) {
    it(`catch ${rule}`, () => {
      const found = scan({ "doc.md": `line one\nsee ${value} here\n` });
      assert.ok(
        found.some((f) => f.rule === rule && f.line === 2),
        JSON.stringify(found),
      );
    });
  }

  it("catch common credential shapes", () => {
    for (const c of CREDENTIALS) assert.ok(scan({ "a.txt": c }).some((f) => f.rule === "credential"), mask(c));
  });

  it("leave legitimate public resources and fictional examples alone", () => {
    assert.deepEqual(scan({ "ok.md": LEGITIMATE.join("\n") }), []);
  });

  it("never reproduce the value they found", () => {
    const value = CAUGHT.credential;
    const found = scan({ "a.txt": value });
    assert.equal(found.length, 1);
    assert.ok(!JSON.stringify(found).includes(value.slice(4)));
    assert.match(found[0].masked, /^xo\*+ \(\d+ chars\)$/);
  });
});

describe("path rules", () => {
  it("catch local configuration, logs and conversation exports", () => {
    const paths = [".env", "pkg/.env.production", ".npmrc", "settings.local.json", ".claude/settings.json", "debug.log", "session.jsonl", "export/conversations.json", "id_ed25519"];
    const found = scan(Object.fromEntries(paths.map((p) => [p, "x"])));
    assert.deepEqual([...new Set(found.map((f) => f.path))].sort(), [...paths].sort());
  });

  it("allow an example environment file", () => {
    assert.deepEqual(scan({ ".env.example": "NAME=" }), []);
  });
});

describe("local list", () => {
  it("matches its literals without case, masked", () => {
    const found = scan({ "a.md": "Signed by Robin Quill." }, { local: ["robin quill", ""] });
    assert.deepEqual(found, [{ rule: "local", path: "a.md", line: 1, masked: mask("robin quill") }]);
  });

  it("is refused inside this repository", () => {
    assert.throws(() => localList(CHECK), /outside this repository/);
  });

  it("is read from outside the repository", () => {
    const file = join(mkdtempSync(join(tmpdir(), "kaal-privacy-")), "local.txt");
    writeFileSync(file, "Robin Quill\n");
    assert.deepEqual(localList(file), ["Robin Quill", ""]);
  });
});

describe("packed contents", () => {
  it("are read from the tarball's bytes", () => {
    const header = (name, size) => {
      const h = Buffer.alloc(512);
      h.write(name, 0);
      h.write(size.toString(8).padStart(11, "0"), 124);
      h.write("0", 156);
      return h;
    };
    const body = Buffer.from(CAUGHT.email);
    const tar = Buffer.concat([header("package/README.md", body.length), body, Buffer.alloc(512 - body.length), Buffer.alloc(1024)]);
    const files = unpack(gzipSync(tar));
    assert.deepEqual(Object.keys(files), ["package/README.md"]);
    assert.equal(scan(files)[0].rule, "email");
  });
});

describe("repository", () => {
  it("holds nothing private in any tracked file, so no package packs any", async () => {
    const r = await execute("git", ["ls-files", "-z"], { cwd: REPO });
    assert.equal(r.status, 0, r.stderr);
    const files = Object.fromEntries(
      r.stdout
        .split("\0")
        .filter(Boolean)
        .map((p) => [p, readFileSync(join(REPO, p))]),
    );
    assert.deepEqual(scan(files), []);
  });
});

describe("command line", () => {
  it("exits 1 with masked findings, 0 when clean, 2 on misuse", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-privacy-"));
    writeFileSync(join(dir, "clean.md"), LEGITIMATE.join("\n"));
    const clean = await execute(process.execPath, [CHECK, dir], { cwd: dir });
    assert.equal(clean.status, 0, clean.stderr);
    writeFileSync(join(dir, "leak.md"), CAUGHT.credential);
    const leak = await execute(process.execPath, [CHECK, dir], { cwd: dir });
    assert.equal(leak.status, 1);
    assert.match(leak.stderr, /credential: .*leak\.md:1: xo\*+/);
    assert.ok(!leak.stderr.includes(CAUGHT.credential.slice(4)));
    const misuse = await execute(process.execPath, [CHECK, "--local", CHECK, dir], { cwd: dir });
    assert.equal(misuse.status, 2);
    const missing = await execute(process.execPath, [CHECK, join(dir, "no-such-dir")], { cwd: dir });
    assert.equal(missing.status, 2, "a scan of nothing must not pass");
    assert.match(missing.stderr, /not a directory/);
  });
});
