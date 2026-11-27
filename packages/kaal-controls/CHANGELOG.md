# Changelog

## 0.0.1

First release of the Skill.

- Teaches the four types of control (directive, preventive, detective, corrective), what each is for, how they combine while staying independent, and how far a claim about a control may go.
- Controls are declared as `<capability>/CTL<n>` records. The scripts find them, check their declarations, and report which are declared, implemented, running and tested, each by its own proof. A missing proof reads as unknown, never as permission.
- The adapter runs a check as a detective or preventive control, or as a ratchet over a baseline, and writes the run as a record. A switch (a flag) can turn a control off, and the record says so.
- The judging functions take files as `{path, text}` entries and read nothing themselves.
