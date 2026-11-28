# Id claims: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N34** [core/I49, core/I51]: A judgment is pure, deterministic and independent of the order of what it is given. It reads no file, takes no branch, process or network, and names no host. Input it cannot read is `unknown` with the fact named, never a pass. Absent is not empty.

## Functional

- **core/F133** [core/I49]: A claim is one JSON object with exactly three members: `capability`, non-empty text; `kind`, a lowercase word; `id`, a positive integer. Its file is named `<kind>-<id>.json`. A name that disagrees with the content, a member that is missing or extra, or a value of another type is a `mismatch` finding.
- **core/F134** [core/I50]: A claim is exact. Any member that states a range, a list or a count of ids is an extra member and a `mismatch`. Core knows no block.
- **core/F135** [core/I49]: Each kind has a first claimable number, which the adopter gives (`from`). An id below it is legacy. Only a record that already exists is grandfathered: it stays and is not judged. A record added by the change under judgement that takes an id below the number is `below-start`, and so is a claim of one. Core states no number.
- **core/F136** [core/I49, core/I51]: Two claims of one kind and one id are a `duplicate` finding naming both capabilities. The lane stops this at integration, so it can reach the judge only when the lane did not run.
- **core/F137** [core/I49]: An id that content uses, at or above its kind's first claimable number, must have a claim by the capability that owns the content. With no claim it is `unclaimed`. Claimed by another capability it is `foreign`. The adopter gives the owner of each use, from its ownership data.
- **core/F140** [core/I49]: One capability never gives one id of a kind to two distinct records. A record is distinct by its path. A record added by the change under judgement that takes an id already held by another record of the same capability and kind, existing or added, is `reused`, whatever the number. Two existing records that already share an id are grandfathered and not judged. Across capabilities the same id is `foreign` (F137) or `unclaimed`.
- **core/F138** [core/I51]: `judgeIdClaims({ claims, used, from })` takes the claims as `{ name, content }`, the uses as `{ capability, kind, id, path, added }`, where `added` is true for a record the change under judgement adds and false for one that already exists, which the adopter reads from the change and `from` as a map of kind to number. It returns `{ verdict, findings }`: `fail` when there is a finding, `pass` when there is none. When an input is not the shape it should be it returns `{ verdict: "unknown", fact }`, the fact being `claims`, `used` or `from`.
- **core/F139** [core/I50]: `nextClaim(claims, from, kind)` returns the next number to claim: one above the highest claim of that kind, or the kind's first claimable number when there is none. A gap is never filled. It reserves nothing, and its answer stands only until a claim lands. It is `{ id: null, reason }` when the kind is not in `from` or a claim cannot be read.
