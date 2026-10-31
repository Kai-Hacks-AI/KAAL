# Limitations

- **Bytes only.** `sha256` hashes bytes. A caller that has text encodes it as UTF-8 first, for example with `new TextEncoder().encode(text)`.
- **SHA-256 only.** Foundation holds no other hash and no HMAC.
- **Speed.** It is a pure implementation, slower than the host's native one. Prefer the host's hash where a host module is allowed and speed matters.
- **Provisional ownership.** Each concern's ownership is provisional, and a concern may move to a more specialized package in a later version.
- **What the shipped tests cannot show.** They check known answers, padding boundaries, views and refusals on the installed copy. They do not compare every input against another implementation; the publisher's tests do that before release.
