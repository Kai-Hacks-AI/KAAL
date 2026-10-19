---
name: Change Record
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Change Record

A Change Record holds what supports one Change in a repository: its coordination, rationale, decisions, references and evidence. It references the work and never contains it. Requirements, architecture, code, tests and deliverables stay where the capabilities that own them keep them, so a record is never a second source of truth.

A record is the folder `.kaal/changes/<capability>/YY/MM/DD/CC/`. `<capability>` is the name of the capability the Change belongs to, in lowercase letters, digits and single hyphens. `YY/MM/DD` is the day the record was opened. `CC` numbers that capability's records of that day, from `01` to `99`.

The path is an address for finding a record. It is not the identity of a Node: a record's contents keep their own identity, and Core does not admit anything as a Node because it lies under this path. Change defines only the path's syntax; reading and writing files there is Hosting's.
