// testing/C9 planned outer tests: consumer verification.
// Immutable to DO and CHECK; testing/C10 turns them GREEN. Each title names the
// contracts it checks (plan/consumer/*.md). They read the delivered text only.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const PACKAGE = new URL("../../", import.meta.url);
const text = (path) => readFileSync(new URL(path, PACKAGE), "utf8");
const HEADING = "## Consumer verification";

/** A Markdown section's text up to the next heading of its level, or the reason the tests are blocked. */
function section(markdown, heading, where) {
  const start = markdown.indexOf(`\n${heading}\n`);
  if (start < 0) assert.fail(`blocked before behavioural assertion: ${where} has no "${heading}" section`);
  const rest = markdown.slice(start + heading.length + 2);
  const end = rest.search(/\n## /);
  return end < 0 ? rest : rest.slice(0, end);
}

/** The Node's consumer verification section, with whitespace runs folded so line wrapping does not matter. */
const node = () => section(text("payload/Testing.md"), HEADING, "payload/Testing.md").replace(/\s+/g, " ");

/** Asserts each planned statement is in the section verbatim. */
function states(body, statements) {
  for (const [id, s] of Object.entries(statements)) assert.ok(body.includes(s), `${id} is not stated verbatim: "${s}"`);
}

describe("Consumer verification (testing/C9)", () => {
  it("testing/T16 [testing/F11, testing/F12, testing/F13]: the Node states delivery, the fail-closed entry point and the three results verbatim", () => {
    states(node(), {
      "testing/F11": "A product may deliver, with its distribution, the cases by which a consumer verifies the product as installed. They are the product's own acceptance or conformance cases, kept apart from tests that serve only its engineering, and the product declares which cases they are.",
      "testing/F12": "The product documents one entry point for them. It locates the installed product by resolution, not by a source path, and needs no source checkout. It fails closed: a run in which no case failed but fewer cases executed than the product declares is unknown, never verified.",
      "testing/F13": "Each run gives exactly one result. It is failed when any case failed. It is unknown when no case failed but a declared case was skipped, not run or unable to run. It is verified only when every declared case ran and passed. Each result has its own exit status and its own summary, so no result is read from silence.",
    });
  });

  it("testing/T17 [testing/F14, testing/F15, testing/F16, testing/F17]: the Node states the named subject, isolation and repeatability, the two scopes, and whose observation a consumer's result is, verbatim", () => {
    states(node(), {
      "testing/F14": "The evidence names what was exercised: the product's name, its version, where it is installed, and the identity of its bytes where the installation records one. What the installation does not record stays unknown.",
      "testing/F15": "A run works outside the consumer's content and leaves that content as it found it, and it shows that it did. Repeating a run against the same installation gives the same result.",
      "testing/F16": "Product conformance and consumer integration are separate scopes. Conformance shows that the installed product behaves as its contract states, in surroundings the run builds for itself. Integration shows that the product is installed and configured correctly in one consumer. Each has its own verdict, and neither stands in for the other.",
      "testing/F17": "A consumer's result is the consumer's own observation of its run. It is not evidence Testing observed, and it changes no classification of a product's contracts.",
    });
  });

  it("testing/T18 [testing/N5, testing/I6]: the section names no product, package manager, version control system or hosting service, and kaal-testing gains no export or dependency", () => {
    const named = node().match(/\b(npm|pnpm|yarn|node_modules|git|github|guard|kaal-guard)\b/gi) ?? [];
    assert.deepEqual(named, [], "the Definition names a realization");
    const pkg = JSON.parse(text("package.json"));
    assert.deepEqual(Object.keys(pkg.exports).sort(), ["./acceptance", "./attribution", "./contracts", "./coverage", "./inventory", "./package.json", "./report"]);
    assert.deepEqual(pkg.dependencies, { c8: "12.0.0", "kaal-hosting": "0.0.1" });
  });

  it("testing/T19 [testing/A8]: the Agent Skill and the README carry the section, and the Skill points to the Node", () => {
    node();
    const skill = section(text("skills/kaal-testing/SKILL.md"), "## Making a product verifiable by its consumers", "the Agent Skill");
    assert.match(skill, /`Testing` Node/, "the Skill section points to the Node for what it means");
    section(text("README.md"), HEADING, "the README");
  });
});
