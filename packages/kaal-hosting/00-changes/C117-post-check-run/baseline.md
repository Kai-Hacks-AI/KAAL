# C117 baseline

The baseline is the C114 collector (the App adapter), promoted to `main`. Until it is, the drafts of this Change run on a checkout of that collector.

- `mintToken` can give a grant that holds `post-checks`; no function uses it. A grant is checked (Hosting's own, unexpired, for its repository and transport, holding the ability) by `useGrant` before any call.
- Failures of the adapter's calls are `AppAdapterError`s with a code; none keeps GitHub's status or headers, so a caller cannot tell a refusal from a failure.
- The facts Hosting returns carry attribution (`factOrigin`).
