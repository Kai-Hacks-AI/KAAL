---
type: Guard/Check
command: npm run test:workspaces
runs: [ci]
---

The tests of every workspace except Hosting, which has a lane of its own (npm run test:workspaces). A failure names the workspace and the test; reproduce it with the same command.
