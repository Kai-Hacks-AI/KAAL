// hosting/T318 draft (hosting/C114): the App manifest, exact bytes.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER } from "./fixtures.mjs";

it("hosting/T318: renderAppManifest gives exact, deterministic bytes with abilities mapped to permissions and metadata always read", () => {
  const expected = [
    "{",
    '  "name": "KAAL Dispatcher",',
    '  "url": "https://github.com",',
    '  "public": false,',
    '  "hook_attributes": {',
    '    "url": "https://example.invalid",',
    '    "active": false',
    "  },",
    '  "default_events": [],',
    '  "default_permissions": {',
    '    "contents": "read",',
    '    "metadata": "read",',
    '    "pull_requests": "write"',
    "  }",
    "}",
    "",
  ].join("\n");
  assert.equal(hosting.renderAppManifest(DISPATCHER), expected);
  assert.equal(hosting.renderAppManifest(structuredClone(DISPATCHER)), expected);
  const reader = hosting.renderAppManifest({ ...DISPATCHER, abilities: ["read-pull-requests", "read-checks"] });
  assert.deepEqual(JSON.parse(reader).default_permissions, { checks: "read", metadata: "read", pull_requests: "read" });
  const writer = hosting.renderAppManifest({ ...DISPATCHER, abilities: ["write-checks", "write-pull-requests"] });
  assert.deepEqual(JSON.parse(writer).default_permissions, { checks: "write", metadata: "read", pull_requests: "write" });
});
