# Handover record

A Handover record is a Node: a UTF-8 Markdown file with LF line endings that begins with the Kernel's frontmatter. Its type is the Engine's `Handover` Definition; find its id with `kaal resolve Handover`. Its id is the SHA-256 of its exact bytes, so a record is never edited: a change is a new record.

```markdown
---
name: Review the package structure
type:
  name: Handover
  id: <id of the Engine's Handover>
---

# Review the package structure

## From

Example Agent A

## To

Example Agent B

## Request

Review the proposed package structure and return a list of required changes.

## Evidence

- <Transport reference of the request message>
```

The record that completes it is written by the recipient, From the recipient To the requester, with Answers and Outcome in place of Request:

```markdown
---
name: Package structure reviewed
type:
  name: Handover
  id: <id of the Engine's Handover>
---

# Package structure reviewed

## From

Example Agent B

## To

Example Agent A

## Answers

- name: Review the package structure
- id: <id of the record above>

## Outcome

Reviewed; two changes required, listed in the reply.

## Evidence

- <Transport reference of the reply>
```

`From` and `To` are required on every record, `Request` on a request and `Outcome` on a record that answers one. `Answers` holds exactly the two lines shown. The script reads only these headings; text under any other `##` heading is for people.
