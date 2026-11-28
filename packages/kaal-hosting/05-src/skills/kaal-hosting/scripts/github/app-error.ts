// The named failures of the GitHub App adapter (hosting/F98 to hosting/F103). A message is fixed text and the
// names of what was refused; it never holds a key, a JWT or a token.
export type AppErrorCode =
  | "INVALID_APP_DECLARATION" | "APP_DECLARATION_MISSING" | "APP_DECLARATION_AMBIGUOUS" | "APP_TOKEN_REFUSED"
  | "APP_IDENTITY_MISMATCH" | "APP_INSTALLATION_MISMATCH" | "APP_GRANT_MISMATCH" | "APP_NOT_INSTALLED" | "APP_KEY_REJECTED" | "APP_TOKEN_FAILED"
  | "GRANT_UNTRUSTED" | "GRANT_EXPIRED" | "GRANT_REPO_MISMATCH" | "GRANT_TRANSPORT_MISMATCH" | "ABILITY_REFUSED" | "INVALID_READ" | "READ_FAILED"
  | "INVALID_CHECK" | "CHECK_FAILED" | "CHECK_MISMATCH" | "INVALID_REVIEW" | "REVIEW_FAILED" | "REVIEW_MISMATCH";

export class AppAdapterError extends Error {
  readonly code: AppErrorCode;
  /** For a failed call: GitHub's status and its headers (names in lower case), so the caller can tell a refusal from a failure. */
  readonly status?: number;
  readonly headers?: Record<string, string>;
  constructor(message: string, code: AppErrorCode, answer: { status?: number; headers?: Record<string, string> } = {}) {
    super(message);
    if (answer.status !== undefined) this.status = answer.status;
    if (answer.headers !== undefined) this.headers = answer.headers;
    this.name = "AppAdapterError";
    this.code = code;
  }
}
