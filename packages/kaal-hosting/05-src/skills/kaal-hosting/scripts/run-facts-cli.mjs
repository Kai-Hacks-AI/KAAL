#!/usr/bin/env node
// kaal-hosting-run-facts [--checkout <dir>]
//   Reads the event of the run (GITHUB_EVENT_NAME, GITHUB_EVENT_PATH) and its trigger (GITHUB_SHA) and prints one
//   `kaal-hosting-run-facts {…}` line: the identity of the content the working copy holds, the identity of the content of the
//   commit the event names when it is in the repository, and the provenance (the event's head, the trigger, the Git commit and
//   parents) with how those relate. Content first; Git is provenance. It prints facts, not a verdict: it does not say what was
//   examined. Exit 0 when the facts were read, whatever they say; 2 when they could not be (an event it does not know, an id
//   that is not a revision, an unreadable event or checkout), with the code and reason in the line. It never exits 1: nothing
//   here can fail a check.
import { describeRun, readCheckout, readFile } from "./index.js";

const args = process.argv.slice(2);
const LINE = "kaal-hosting-run-facts";
const say = (result) => console.log(`${LINE} ${JSON.stringify(result)}`);
const refuse = (code, reason) => {
  say({ result: "cannot-determine", code, reason });
  process.exitCode = 2;
};
const at = args.indexOf("--checkout");
const root = at < 0 ? undefined : args[at + 1];
if (args.some((a, i) => a !== "--checkout" && i !== at + 1) || (at >= 0 && (root === undefined || root.startsWith("--")))) {
  refuse("USAGE", "usage: kaal-hosting-run-facts [--checkout <dir>]");
} else {
  try {
    const path = process.env.GITHUB_EVENT_PATH;
    let event;
    try {
      if (!path) throw new Error("GITHUB_EVENT_PATH is not set");
      event = JSON.parse(Buffer.from(await readFile(path)).toString("utf8"));
    } catch (cause) {
      const error = new Error(`the event of the run could not be read (${cause.message})`);
      error.code = "EVENT_UNREADABLE";
      throw error;
    }
    const source = { eventName: process.env.GITHUB_EVENT_NAME, event, ...(process.env.GITHUB_SHA ? { trigger: process.env.GITHUB_SHA } : {}) };
    const head = describeRun(source).provenance.eventHead.revision; // the event is read once, to name the commit whose content is read
    const observed = root === undefined ? {} : await readCheckout(root, { head });
    say({ result: "facts", ...describeRun(source, observed) });
  } catch (e) {
    refuse(e?.code ?? "ERROR", String(e?.message ?? e));
  }
}
