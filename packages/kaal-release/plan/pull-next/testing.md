# Pull Promotion: the highest-value qualifier is next (testing)

Runnable Cases `T38` and `T39`, `.red.mjs`, built on the fixtures of the existing Pull Promotion Cases. They are RED because today's `next` is the first qualifier in the declared order. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-next/T38.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T38 | F38 | Two qualifiers with values 1 and 2 give `next` the one with 2, whichever is listed first. Three qualifiers give the highest. A single qualifier is `next` with or without a value. With a `size`, the rank is value ÷ size (value 6 size 3 loses to value 3 size 1), compared exactly. With no qualifier `next` is unchanged. Statuses, `missing` and `qualifiers` equal the same run without any value. |
| pull/T39 | F38 | A tie for the highest rank (equal ratios such as 2÷1 and 4÷2), or a qualifier without a value, gives `collector: null` and `judged` naming the tied or all qualifiers. An invalid value or size (0, 1.5, a string) gives no valid rank and a non-integer is named in `problems`. A lower-valued tie below a unique highest does not make `next` judged. |

They do not show the live host.
