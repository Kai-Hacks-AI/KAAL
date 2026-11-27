# C162 change

## PLAN

1. Add the Case T1712 under controls/N8 (plain `.test.mjs`, package-relative). It reads `package.json`, the README and the file system of the package and fails on: name other than `@kaihacksai/kaal-controls`, licence other than MIT, `publishConfig.access` not `public`, a version that is not plain x.y.z, no `CHANGELOG.md`, no `LICENSE` in the Skill folder, and a README that says "not published". It does not look at `private`. RED on the collector (four problems); run GREEN against an uncommitted throwaway rewrite.
2. Amend controls/F18 and its Case T591: the package stays private at 0.0.1 with `files` holding only `skills`, and `publishConfig` is `{access: public}` (T591 asserted that there is none). T591 is RED on the collector once the DO adds it, so the amendment is part of this PLAN.
3. No script, Skill word or record change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `package.json`: add `publishConfig: { access: "public" }`. Version stays 0.0.1. `private: true` stays.
2. `CHANGELOG.md` with the entry for 0.0.1, written for a consumer: what the package gives, nothing of KAAL's internal Changes.
3. `skills/kaal-controls/LICENSE`: the MIT text, byte-equal to the package `LICENSE`. The repository licence is unchanged.
4. README: says what the package is and how to install and use it, with no "not published"; the layout block names only what ships.
5. T1712 GREEN; the package suite GREEN. A mutation: `publishConfig` removed and the bundled LICENSE removed, each alone turns T1712 RED.
6. Publishing then runs `npm pack --dry-run` on a clean checkout and checks the file list; that is Publishing's step and not a part of this DO.

## ACT

A retro entry in the collector.

## Design questions, with recommendations

1. **`private: true`.** Recommend it stays until Publishing flips it on Kai's go. With it set, `npm publish` refuses by itself, which is a second lock besides the go. T1712 does not look at it for that reason.
2. **Package files.** `files` is `["skills"]`, so the package `LICENSE`, README and CHANGELOG are added by npm itself; the bundled Skill LICENSE keeps the Skill licensed when copied alone. Recommend no change to `files`.
3. **Order.** After C160 and C161, so the README layout block and the changelog describe the scrubbed package.
