# Privacy

`check.mjs` looks for private material that must not be committed or published: personal email addresses, chat-workspace links, member and channel identifiers, local home-directory paths, credentials, and files that hold local configuration, logs or conversation exports. Its tests (`check.test.mjs`) use synthetic values only, assembled at run time so that the test file itself passes the check.

```sh
git ls-files -z | node engineering/privacy/check.mjs --paths     # the repository's files
node engineering/privacy/check.mjs --pack <tarball>               # what a package publishes
node engineering/privacy/check.mjs <dir>                          # any directory
```

Findings are masked, so a log never reproduces the value found. Exceptions are narrow and stated in the rule they belong to: documentation domains reserved by RFC 2606, public API documentation, the fictional `example` workspace, identifiers containing `EXAMPLE`, and placeholder or CI account names in paths.

Repository acceptance (`engineering/acceptance/communication.test.mjs`) runs these rules over every tracked file and over the packed contents of kaal-communication and kaal-slack.

## Your own identifiers

The rules know generic shapes, never anyone's real values. To check against your own names, handles or workspace, keep a list outside this repository, one literal per line, and pass it with `--local <file>` or `KAAL_PRIVACY_LOCAL=<file>`. A list inside the repository is refused. It never belongs in the repository, in CI variables or in secrets: CI runs the generic rules and synthetic data only.

## Limitations

These are pattern checks. A clean result does not establish that prose is free of private information: names, descriptions of people and situations, and paraphrased details pass them. Review decides that.
