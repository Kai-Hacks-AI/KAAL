// hosting/T319 draft (hosting/C114): invalid App declarations are refused.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER } from "./fixtures.mjs";

it("hosting/T319: renderAppManifest refuses every invalid declaration with INVALID_APP_DECLARATION, naming the field", () => {
  const bad = {
    "an ability outside the vocabulary": [{ ...DISPATCHER, abilities: ["read-contents", "read-everything"] }, /read-everything/],
    "write-pull-requests, which is not an ability (raising and approving are separate)": [{ ...DISPATCHER, abilities: ["write-pull-requests"] }, /write-pull-requests/],
    "an App that may raise and approve": [{ ...DISPATCHER, abilities: ["raise-pull-requests", "approve-pull-requests"] }, /raise-pull-requests.*approve-pull-requests|approve-pull-requests.*raise-pull-requests/],
    "an ability that writes contents": [{ ...DISPATCHER, abilities: ["write-contents"] }, /write-contents/],
    "an ability that writes workflows": [{ ...DISPATCHER, abilities: ["write-workflows"] }, /write-workflows/],
    "an administration ability": [{ ...DISPATCHER, abilities: ["administration"] }, /administration/],
    "a secrets ability": [{ ...DISPATCHER, abilities: ["write-secrets"] }, /write-secrets/],
    "a GitHub permission field": [{ ...DISPATCHER, default_permissions: { contents: "write" } }, /default_permissions/],
    "a hook field": [{ ...DISPATCHER, hook_attributes: { url: "https://x.example" } }, /hook_attributes/],
    "no name": [{ ...DISPATCHER, name: undefined }, /name/],
    "an empty name": [{ ...DISPATCHER, name: "  " }, /name/],
    "no owner": [{ ...DISPATCHER, owner: undefined }, /owner/],
    "an App that cannot read contents (its declaration could not be read at the base revision)": [{ ...DISPATCHER, abilities: ["raise-pull-requests"] }, /read-contents/],
    "no abilities": [{ ...DISPATCHER, abilities: [] }, /abilities/],
    "a repeated ability": [{ ...DISPATCHER, abilities: ["read-contents", "read-contents"] }, /read-contents/],
    "a field outside the format": [{ ...DISPATCHER, colour: "red" }, /colour/],
    "an app name that is not lower-case words": [{ ...DISPATCHER, app: "Dispatcher App!" }, /app/],
  };
  for (const [why, [declaration, field]] of Object.entries(bad)) {
    assert.throws(() => hosting.renderAppManifest(declaration), (e) => e.code === "INVALID_APP_DECLARATION" && field.test(e.message), why);
  }
});
