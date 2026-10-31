# Ownership Claim: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **hosting/F56** [hosting/I13]: **Hosting's claim.** `packages/extensions/kaal-hosting/ownership.kaal.json` is Hosting's ownership claim, in the format Testing owns and #609 settled (JSON, machine-oriented; `CLAIM_FILE` and `readClaim` in `kaal-testing/attribution`):
  - It holds exactly `owner` and `paths`.
  - `owner` is exactly `{ kind, name, id }`: `kind` is `extension`, because Hosting's Node `payload/Hosting.md` is typed `KAAL Extension`; `name` is that Node's name, `Hosting`; `id` is that Node's identity, the lowercase hex SHA-256 of its bytes.
  - `paths` is exactly `["packages/extensions/kaal-hosting/"]`: Hosting's whole tree, nothing outside it, and no narrower pattern.
  - When `payload/Hosting.md` changes, the same Change refreshes `owner.id`, so the claim never names a Node Hosting no longer carries.

## Limits

- The claim settles only Hosting's tree. Who owns the root files every workspace shares is settled by their owners' claims, not here.
- The claim is repository governance, not product: it is not in `files`, so it never ships, and hosting/A15's interface is unchanged.
- Hosting depends on no Testing package. Its planned test checks the claim's shape and identity itself, and Testing's attribution remains the reader that counts.
- Whether Change Isolation uses the claim, and how, is engineering/C11's DO, not this Change.
