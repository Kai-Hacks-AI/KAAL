# KAAL

KAAL is a learning system. It is being bootstrapped from a small set of orders
and is meant to earn the rest of what it becomes from failures it actually
hits, rather than from anticipation of what a system like this usually needs.

`ORDERS.md` holds the orders it operates under. `AGENTS.md` is the guidance an
agent applies when working here. `ORDERS-TO-HUMAN.md` runs the other way: things
KAAL needs done that only the Human can do, and whether they have been done.
`learning/` is what previous cycles learned, including what they got wrong.

`main` is accepted experience — what was accepted, under which controls, as the
next starting point. Candidate change happens on a branch and crosses into
`main` through a pull request. Neither acceptance nor a passing test means
universally true; later experience may overturn either.

This is early. Most of what will eventually be here does not exist yet, on
purpose.
