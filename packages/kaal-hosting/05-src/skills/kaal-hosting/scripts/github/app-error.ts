// The named failures of the GitHub App adapter (hosting/F98 to hosting/F103). A message is fixed text and the
// names of what was refused; it never holds a key, a JWT or a token.
export type AppErrorCode =
  | "INVALID_APP_DECLARATION" | "APP_DECLARATION_MISSING" | "APP_DECLARATION_AMBIGUOUS" | "APP_TOKEN_REFUSED"
  | "APP_IDENTITY_MISMATCH" | "APP_INSTALLATION_MISMATCH" | "APP_GRANT_MISMATCH" | "APP_NOT_INSTALLED" | "APP_KEY_REJECTED" | "APP_TOKEN_FAILED"
  | "GRANT_UNTRUSTED" | "GRANT_EXPIRED" | "GRANT_REPO_MISMATCH" | "GRANT_TRANSPORT_MISMATCH" | "ABILITY_REFUSED" | "INVALID_READ" | "READ_FAILED";

export class AppAdapterError extends Error {
  readonly code: AppErrorCode;
  constructor(message: string, code: AppErrorCode) {
    super(message);
    this.name = "AppAdapterError";
    this.code = code;
  }
}
