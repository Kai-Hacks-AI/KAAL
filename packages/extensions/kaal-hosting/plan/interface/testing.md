# Package Interface Contract: Testing

The planned outer test lives in `packages/extensions/kaal-hosting/test/plan/interface.test.mjs`. Its title names the contracts it checks, and it is immutable to DO and CHECK. Run it with `npm run build -w <Hosting's workspace> && node --test packages/extensions/kaal-hosting/test/plan/interface.test.mjs`. Once `hosting/C11` has merged, `hosting/C15` adds it to Hosting's `npm test` beside hosting/T21–T24, so it runs in the Linux, Windows and macOS Hosting lanes.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T41: Hosting's packed candidate exposes exactly the interface hosting/A15 declares, read from the Architecture and not from the candidate. An undeclared export, or an undeclared `files` entry and what it ships, is RED. A delivered export removed is RED. An export pointing at an absent target is RED: it does not ship, does not load, and differs from the declaration. A declared target that ships but cannot load is RED. A status that is missing, misspelled (`deliverd`), differently cased or malformed (`planned`, `planned hosting/C`, `planned C14`), a duplicate row or an unknown kind is RED in the declaration itself, never read as planned; a well-formed `planned hosting/C<number>` is accepted and makes its entry optional. The authorized `./boundary` extension is GREEN with no edit to the Test Case | hosting/F35, hosting/A15 | Requirements |

## The correction to hosting/C10's planned tests

`hosting/C15` makes the smallest explicit change to two planned tests of `hosting/C10`, on the Owner's ruling on #657 (comment 6533937580). It changes nothing else in them.

- hosting/T21 no longer pins `exports` to three entries or `files` to a list. It keeps the name, version, `publishConfig`, `repository`, engines, license, runtime dependencies and README.
- hosting/T24 no longer pins the tarball to a file list. It keeps the packed install by the new name and the consumer's use of `.` and `./conformance`.

What they no longer pin, hosting/T41 checks against the declared interface instead.

## Evidence

hosting/C10's hosting/T21 and hosting/T24, as they stand at #657's head (38960b7), were run against two altered candidates:

| Candidate | hosting/T21 and T24 as planned | hosting/T41 |
| --- | --- | --- |
| adds the authorized `./boundary` export, with its target | T21 RED: a false RED | GREEN |
| points `./conformance` at an absent file | T21 and T24's file list GREEN: a false GREEN (only T24's consumer script, which happens to import `./conformance`, would notice) | RED: not shipped, does not load, differs from the declaration |

hosting/T41 is GREEN on the candidate today, before and after the rename (applied on top of #657's head), and each of its seven negative cases is RED as stated in the table. The strict reading of the declaration was checked against weaker variants of `contract()`: one that reads any status other than `delivered` as planned (the rule before the Owner's review on #664, comment 6541423832), one that accepts a duplicate row, and one that skips an unknown kind. Each turns the status case RED. With this correction, hosting/T21–T24 remain GREEN at #657's head.
