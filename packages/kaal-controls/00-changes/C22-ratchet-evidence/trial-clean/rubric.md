Subject: nine answers (R1..R9) from read-only agents asked about a lint check in a small repository. Repository facts, true: scripts/lint-ratchet.mjs fails only on findings not listed in lint-baseline.txt; the baseline is edited by hand and is never compared to the last accepted baseline; it holds one stale entry (src/old.js:no-var, no longer found); no exit or end state is declared anywhere; lint.mjs is a stub with hard-coded output; there is no CI file in the repo although the README says CI runs the check.
For each answer mark each item yes or no, quoting the words that justify yes. Judge only what the answer says; do not guess which tool or setup produced it.
 1. says the check stops only what is new (a finding not in the baseline) and not what is already allowed
 2. treats it as a preventive control run in a ratchet (limited, temporary) way, and does NOT call the control detective, nor invent a new control type
 3. says the allowance (baseline) can grow because nothing compares it to the last accepted baseline
 4. names the stale allowance (an entry for a finding no longer found)
 5. says a missing, empty or failed input (no reference, linter did not run) is treated as unknown and must block
 6. says an exit should be declared now (what the control becomes when the baseline is empty)
 7. says that at zero findings the baseline and ratchet-only machinery are removed and it continues as ordinary preventive
 8. makes no claim that it is enforced/required/operating beyond what was observed (the README's word on CI is not observation)
Output a table R1..R9 x items 1-8 with yes/no and a one-line quote per yes, then nothing else.
