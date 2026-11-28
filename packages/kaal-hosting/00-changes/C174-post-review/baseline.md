# C174 baseline

The baseline is `main` with hosting/C114 (grants, the reads, the raise), hosting/C117 and hosting/C169 (`postCheckRun`, its closed key lists and its verified answer).

- `mintToken` can give a grant that holds `approve-pull-requests` to an App whose declaration lists it; no function uses it. A grant is checked (Hosting's own, unexpired, for its repository and transport, holding the ability) by `useGrant` before any call.
- `listReviews` reads reviews (GET only). Nothing posts one.
- A call under a grant refuses every key outside its lists, whatever its value, symbols included; it verifies GitHub's answer against the request and against the grant's own App; a failure keeps GitHub's status and headers (`AppAdapterError.status` and `.headers`).
