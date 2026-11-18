# C77 baseline

The baseline is the collector `kaal/release/stages-extra-rule` at its tip, which holds release/C70 (judge, `stages.json` with `rules`, Cases T900 to T903), on `main` c8291db.

- The status-check rule of each source states the two settings: `strict_required_status_checks_policy: false` everywhere; `do_not_enforce_on_create: true` on Integrating, Collecting, Hotfixing and Wiring, `false` on Promoting.
- release/C70 traces a rule's settings to the control of the rule as a whole (release/CTL1 for the status checks); no control or Intent states these two settings.
- The two settings are decisions of the Owner ("no up to date in new rulesets"; creation of a work branch) that no control records.
