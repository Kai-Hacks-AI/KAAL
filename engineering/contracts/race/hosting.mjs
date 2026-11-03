// Hosting as measure.test.mjs shows it to the contracts driver: the real
// module, except that within() first plays the race a concurrent writer causes
// after kind() has answered. It removes the file whose path ends in RACE_VANISH,
// or refuses the file whose path ends in RACE_PATH with the HostingError code
// RACE_FAIL; then it asks the real within().
import { rmSync } from "node:fs";
import { HostingError, within as asked } from "kaal-hosting";

export * from "kaal-hosting";

const { RACE_VANISH, RACE_PATH, RACE_FAIL } = process.env;

export async function within(root, candidate) {
  if (RACE_VANISH && candidate.endsWith(RACE_VANISH)) rmSync(candidate);
  if (RACE_FAIL && candidate.endsWith(RACE_PATH)) throw new HostingError("refused", RACE_FAIL);
  return asked(root, candidate);
}
