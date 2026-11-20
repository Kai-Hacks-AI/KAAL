#!/usr/bin/env node
// kaal-hosting-pulls --repository <owner/name>
//   Reads the open pull requests of a repository through Hosting's `readPullRequests` and prints one `kaal-hosting-pulls {…}` line:
//   the records, or the code and reason it could not. Which route or binary reached GitHub is Hosting's business and is not printed.
//   Exit 0 when read, 2 when not (including bad arguments). It never exits 1: nothing here can fail a check.
import { pullRequestsCommand } from "./pull-requests-command.js";

const { line, status } = await pullRequestsCommand(process.argv.slice(2));
console.log(line);
process.exitCode = status;
