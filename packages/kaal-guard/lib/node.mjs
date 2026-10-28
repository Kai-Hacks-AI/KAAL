// The runtime prerequisite (N1): kaal-guard needs Node 24 or later. Imported first by the command, so
// on an older Node every command is cannot judge before anything is read, run or written.
const NEEDED = 24;

const major = Number(process.versions.node.split(".")[0]);
if (!(major >= NEEDED)) {
  console.log(`cannot judge: kaal-guard: this is Node ${process.versions.node}, and kaal-guard needs Node ${NEEDED} or later`);
  console.log(`  do: run kaal-guard on Node ${NEEDED} or later`);
  process.exit(2);
}
