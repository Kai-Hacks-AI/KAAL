# C33 evidence

All Cases run RED on `main` at the PLAN, and each for the reason it states.

| Case | Tests | Red because |
|---|---|---|
| T440 | F23 | `03-architecture/A49-how-to-work/` does not exist |
| T441 | F23 | no guidance, definition or trailer exists whose paths could resolve |
| T442 | F23 | `engineering/HOW-TO-WORK.md` does not exist; the template sources carry no trailer |
| T443 | F23 | `readTemplates` returns no trailers and `verifyEnvelope` ignores a missing trailer |
| T444 | F23 | F23 is not stated in the interface of the release capability |
| T445 | F23 | WIRE case: the installed templates carry no trailer (stays `.red.mjs` through the promotion) |
