# Pull Promotion: next is the qualifier of highest value density (testing)

Runnable Cases `T38` and `T39`, `.red.mjs`, built on the fixtures of the existing Pull Promotion Cases. They are RED because today's `next` is the first qualifier in the declared order. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-next/T38.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T38 | F38 | With a value, size and the same unit on every qualifier, `next` is the highest density (value ÷ size, so value 6 size 3 loses to value 3 size 1), whichever is listed first, with two and with three qualifiers. A single qualifier is `next` with or without the fields. With no qualifier `next` is unchanged. Statuses, `missing` and `qualifiers` equal the same run without any field. |
| pull/T39 | F38 | Everything not determinable is judged and names the candidates: a tie (equal ratios such as 2÷1 and 4÷2, not broken by float comparison), a missing `value`, a missing `size` (never defaulted to 1), a missing `unit`, and two different units (including a mixed IFPUG and COSMIC pair). Invalid fields (0, 1.5, a string, an empty unit) give no valid density and are named in `problems`. A lower tie below a unique highest does not make `next` judged. A tie does not change who qualifies. |

They do not show the live host.
