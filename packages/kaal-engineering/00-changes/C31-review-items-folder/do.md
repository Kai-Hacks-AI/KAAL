# C31 do

The DO of the merged PLAN (#2329).

- **Template:** `review-items` is a child of `10-intent`, `11-requirements`, `12-architecture`, `13-source`, `14-operations` and `15-defects`, and is optional in `14-operations` beside `runs`. Nothing is marked `required`; the check is unchanged.
- **Document:** `package-layout.md` has a section "Review items" saying where they sit and that the folder is optional and never a verifier.
- **Cases amended** because they pinned the exact child lists: T1223 (`13-source`) and T1242 (`14-operations`) now include `review-items`.
- **Cases:** T1391 and T1392 are GREEN; T1380 to T1382 stay GREEN. T1178 and T1228 fail here on a Node package-reader error in this environment, as they do at the collector tip without this DO.
