/** A registry archive: an http(s) URL under a registry's `/-/` path, as npm records a package it fetched from a registry (packaging/F19, packaging/A28). */
export const REGISTRY_TARBALL = /^https?:\/\/[^\s]+\/-\/[^\s/]+$/;
